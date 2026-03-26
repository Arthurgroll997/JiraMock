import { useState } from 'react';
import type { Page } from '../types';
import { scenarios } from '../services/scenarios';

export default function ScenarioBuilder({ onNavigate, onLoadScript }: { onNavigate: (p: Page) => void; onLoadScript: (s: string) => void }) {
  const [selected, setSelected] = useState('');
  const scenario = scenarios.find((s) => s.id === selected);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-100 mb-6">Scenario Builder</h2>

      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">Select Scenario</label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 focus:outline-none focus:border-blue-500"
        >
          <option value="">— Choose a scenario —</option>
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {scenario && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <h3 className="text-lg font-semibold text-gray-100 mb-2">{scenario.name}</h3>
            <p className="text-sm text-gray-400 mb-4">{scenario.description}</p>
            <div className="flex gap-2 mb-4">
              {scenario.systems.map((sys) => (
                <span key={sys} className="px-2.5 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-medium">{sys}</span>
              ))}
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300">Workflow Steps</h4>
              {scenario.steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold text-gray-300">{i + 1}</span>
                  {step}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => { onLoadScript(scenario.template); onNavigate('editor'); }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            ⚡ Generate Script & Open Editor
          </button>
        </div>
      )}
    </div>
  );
}
