import type { ApiCall } from '../types';
import { getSettings } from './api';

/**
 * Simplified PowerShell Invoke-RestMethod parser.
 * Extracts method, URI, and body from lines like:
 *   Invoke-RestMethod -Uri "http://..." -Method POST -Body ($body | ConvertTo-Json)
 *   $response = Invoke-RestMethod ...
 */
export function parseScript(script: string): ApiCall[] {
  const settings = getSettings();
  const calls: ApiCall[] = [];
  const lines = script.split('\n');

  // Collect variable assignments for body resolution
  const vars: Record<string, string> = {};

  for (const line of lines) {
    const trimmed = line.trim();

    // Capture simple $var = @{ ... } or $var = @" ... "@ blocks — store raw
    const varMatch = trimmed.match(/^\$(\w+)\s*=\s*@\{([\s\S]*?)\}/);
    if (varMatch) {
      vars[varMatch[1]] = varMatch[2];
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
        .replace(/\$\w+Base/g, settings.fudoUrl);
    }

    // Extract -Body
    const bodyMatch = trimmed.match(/-Body\s+\(?\$(\w+)/i);
    if (bodyMatch && vars[bodyMatch[1]]) {
      try {
        // Try to parse the PS hashtable as JSON-ish
        const raw = vars[bodyMatch[1]]
          .replace(/=/g, ':')
          .replace(/;/g, ',')
          .replace(/'/g, '"');
        body = JSON.parse('{' + raw + '}');
      } catch {
        body = { _raw: vars[bodyMatch[1]] };
      }
    }
    // Inline JSON body
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
