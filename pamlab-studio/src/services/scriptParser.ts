import type { ApiCall } from '../types';
import { getSettings } from './api';

/**
 * Simplified PowerShell Invoke-RestMethod parser.
 * Handles multi-line @{ } hashtables and variable substitution.
 */
export function parseScript(script: string): ApiCall[] {
  const settings = getSettings();
  const calls: ApiCall[] = [];
  const lines = script.split('\n');

  // Collect variable assignments (multi-line hashtable support)
  const vars: Record<string, Record<string, string>> = {};
  let currentVar: string | null = null;
  let currentBlock: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Start of multi-line hashtable: $var = @{
    const startMatch = trimmed.match(/^\$(\w+)\s*=\s*@\{\s*$/);
    if (startMatch) {
      currentVar = startMatch[1];
      currentBlock = [];
      continue;
    }

    // Inside a hashtable block
    if (currentVar !== null) {
      if (trimmed === '}') {
        // End of hashtable — parse the collected lines
        vars[currentVar] = parseHashtable(currentBlock);
        currentVar = null;
        currentBlock = [];
      } else {
        currentBlock.push(trimmed);
      }
      continue;
    }

    // Single-line hashtable: $var = @{ key = "val"; key2 = "val2" }
    const singleMatch = trimmed.match(/^\$(\w+)\s*=\s*@\{(.+)\}\s*$/);
    if (singleMatch) {
      vars[singleMatch[1]] = parseHashtable(singleMatch[2].split(';').map(s => s.trim()));
      continue;
    }

    // Look for Invoke-RestMethod
    if (!trimmed.includes('Invoke-RestMethod')) continue;

    let method = 'GET';
    let url = '';
    let body: unknown = undefined;

    // Extract -Method
    const methodMatch = trimmed.match(/-Method\s+(\w+)/i);
    if (methodMatch) method = methodMatch[1].toUpperCase();

    // Extract -Uri
    const uriMatch = trimmed.match(/-Uri\s+["']([^"']+)["']/i) || trimmed.match(/-Uri\s+(\S+)/i);
    if (uriMatch) {
      url = uriMatch[1]
        .replace(/\$fudoBase/g, settings.fudoUrl)
        .replace(/\$matrixBase/g, settings.matrixUrl)
        .replace(/\$adBase/g, settings.adUrl)
        .replace(/\$snowBase/g, settings.snowUrl)
        .replace(/\$jsmBase/g, settings.jsmUrl)
        .replace(/\$remedyBase/g, settings.remedyUrl)
        .replace(/\$\w+Base/g, settings.fudoUrl);
    }

    // Extract -Body with variable reference: ($var | ConvertTo-Json)
    const bodyMatch = trimmed.match(/-Body\s+\(?\$(\w+)/i);
    if (bodyMatch && vars[bodyMatch[1]]) {
      body = vars[bodyMatch[1]];
    }
    // Inline JSON body: -Body '{"key":"val"}'
    const inlineBody = trimmed.match(/-Body\s+'(\{[^']+\})'/i);
    if (inlineBody) {
      try { body = JSON.parse(inlineBody[1]); } catch { /* skip */ }
    }

    if (url) {
      calls.push({ method, url, body: body || undefined });
    }
  }

  return calls;
}

/**
 * Parse PowerShell hashtable lines into a JS object.
 * Handles: key = "value" and key = value
 */
function parseHashtable(lines: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;
    // Match: key = "value" or key = 'value' or key = value
    const m = line.match(/^(\w+)\s*=\s*["']?([^"'\n;]*)["']?\s*;?\s*$/);
    if (m) {
      result[m[1]] = m[2].trim();
    }
  }
  return result;
}
