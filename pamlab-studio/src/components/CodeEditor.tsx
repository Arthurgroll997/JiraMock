import { useState } from 'react';
import Editor from '@monaco-editor/react';
import type { ApiResult, StepResultType } from '../types';
import { parseScript } from '../services/scriptParser';
import { apiFetch } from '../services/api';

export default function CodeEditor({ script, onScriptChange, onResults }: {
  script: string;
  onScriptChange: (s: string) => void;
  onResults: (steps: StepResultType[], traffic: ApiResult[]) => void;
}) {
  const [running, setRunning] = useState(false);

  const handleRun = async () => {
    setRunning(true);
    const calls = parseScript(script);
    const steps: StepResultType[] = [];
    const traffic: ApiResult[] = [];

    for (let i = 0; i < calls.length; i++) {
      const call = calls[i];
      const res = await apiFetch(call.url, call.method, call.body);
      const result: ApiResult = {
        method: call.method,
        url: call.url,
        status: res.status,
        statusText: res.statusText,
        time: res.time,
        requestBody: call.body,
        responseBody: res.data,
      };
      traffic.push(result);
      steps.push({
        step: i + 1,
        description: `${call.method} ${call.url}`,
        success: res.status >= 200 && res.status < 400,
        result,
      });
      onResults([...steps], [...traffic]);
    }
    setRunning(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-0px)]">
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-sm text-gray-400 mr-auto">📝 script.ps1</span>
        <button onClick={handleRun} disabled={running} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded text-sm font-medium transition-colors">
          {running ? '⏳ Running...' : '▶️ Run'}
        </button>
        <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors">🐛 Debug</button>
        <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors">💾 Save</button>
        <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors">📤 Export</button>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="powershell"
          theme="vs-dark"
          value={script}
          onChange={(v) => onScriptChange(v || '')}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            lineNumbers: 'on',
            wordWrap: 'on',
            padding: { top: 10 },
          }}
        />
      </div>
    </div>
  );
}
