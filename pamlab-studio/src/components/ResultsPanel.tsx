import { useState } from 'react';
import type { ApiResult, StepResultType } from '../types';
import StepResult from './StepResult';

export default function ResultsPanel({ steps, traffic }: { steps: StepResultType[]; traffic: ApiResult[] }) {
  const [tab, setTab] = useState<'results' | 'traffic'>('results');
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-100 mb-4">Results</h2>
      <div className="flex gap-1 mb-4">
        <button onClick={() => setTab('results')} className={`px-4 py-2 rounded-t-lg text-sm font-medium ${tab === 'results' ? 'bg-gray-800 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}>
          Results
        </button>
        <button onClick={() => setTab('traffic')} className={`px-4 py-2 rounded-t-lg text-sm font-medium ${tab === 'traffic' ? 'bg-gray-800 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}>
          API Traffic
        </button>
      </div>

      {tab === 'results' ? (
        <div className="space-y-2">
          {steps.length === 0 && <p className="text-gray-500 text-sm">No results yet. Run a script to see execution results.</p>}
          {steps.map((s) => <StepResult key={s.step} step={s} />)}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="text-left p-3">Method</th>
                <th className="text-left p-3">URL</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {traffic.length === 0 && (
                <tr><td colSpan={4} className="p-4 text-gray-500 text-center">No API calls recorded yet.</td></tr>
              )}
              {traffic.map((t, i) => (
                <>
                  <tr key={i} onClick={() => setExpanded(expanded === i ? null : i)} className="border-b border-gray-700/50 hover:bg-gray-700/30 cursor-pointer">
                    <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-bold ${t.method === 'GET' ? 'bg-green-900/40 text-green-400' : t.method === 'POST' ? 'bg-blue-900/40 text-blue-400' : t.method === 'DELETE' ? 'bg-red-900/40 text-red-400' : 'bg-yellow-900/40 text-yellow-400'}`}>{t.method}</span></td>
                    <td className="p-3 font-mono text-xs text-gray-300">{t.url}</td>
                    <td className="p-3"><span className={t.status >= 200 && t.status < 400 ? 'text-green-400' : 'text-red-400'}>{t.status}</span></td>
                    <td className="p-3 text-gray-400">{t.time}ms</td>
                  </tr>
                  {expanded === i && (
                    <tr key={`${i}-detail`}><td colSpan={4} className="p-4 bg-gray-900">
                      <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                        <div><p className="text-gray-500 mb-1">Request Body</p><pre className="text-gray-300 whitespace-pre-wrap">{t.requestBody ? JSON.stringify(t.requestBody, null, 2) : '—'}</pre></div>
                        <div><p className="text-gray-500 mb-1">Response Body</p><pre className="text-gray-300 whitespace-pre-wrap">{t.responseBody ? JSON.stringify(t.responseBody, null, 2) : '—'}</pre></div>
                      </div>
                    </td></tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
