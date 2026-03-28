import { useState, useEffect } from 'react';

export interface RunRecord {
  id: string;
  timestamp: string;
  workflowName: string;
  steps: number;
  passed: number;
  failed: number;
  duration: number;
  isTestRun: boolean;
}

const STORAGE_KEY = 'pamlab-run-history';

export function saveRun(record: RunRecord) {
  const runs = getRuns();
  runs.unshift(record);
  if (runs.length > 50) runs.length = 50;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
}

export function getRuns(): RunRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export default function RunHistory() {
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setRuns(getRuns());
  }, []);

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRuns([]);
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTime = (ts: string) => {
    try { return new Date(ts).toLocaleString(); } catch { return ts; }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-100">📜 Run History</h2>
        {runs.length > 0 && (
          <button onClick={clearHistory} className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-xs font-medium transition-colors">
            🗑️ Clear History
          </button>
        )}
      </div>

      {runs.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 border border-gray-700 text-center">
          <div className="text-4xl mb-3">📭</div>
          <div className="text-gray-400">No workflow runs recorded yet.</div>
          <div className="text-sm text-gray-600 mt-1">Run a workflow from the builder to see results here.</div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 text-xs text-gray-500 uppercase">
                <th className="text-left px-4 py-3">Time</th>
                <th className="text-left px-4 py-3">Workflow</th>
                <th className="text-left px-4 py-3">Result</th>
                <th className="text-left px-4 py-3">Duration</th>
                <th className="text-left px-4 py-3">Type</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr
                  key={run.id}
                  onClick={() => setExpanded(expanded === run.id ? null : run.id)}
                  className="border-b border-gray-700/50 hover:bg-gray-750 cursor-pointer transition-colors hover:bg-gray-700/30"
                >
                  <td className="px-4 py-3 text-sm text-gray-400">{formatTime(run.timestamp)}</td>
                  <td className="px-4 py-3 text-sm text-gray-200 font-medium">{run.workflowName}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-sm font-medium ${run.failed === 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {run.failed === 0 ? '✅' : '❌'} {run.passed}/{run.steps}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{formatDuration(run.duration)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${run.isTestRun ? 'bg-yellow-600/20 text-yellow-400' : 'bg-blue-600/20 text-blue-400'}`}>
                      {run.isTestRun ? 'Test' : 'Production'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
