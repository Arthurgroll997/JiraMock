import type { StepResultType } from '../types';
import { getConnector } from '../data/connectors';

interface FlowStep {
  connectorId: string;
  label: string;
  status: 'pending' | 'running' | 'success' | 'error';
  result?: StepResultType;
}

interface FlowDiagramProps {
  steps: FlowStep[];
  onStepClick?: (index: number) => void;
}

const statusIcon: Record<string, string> = {
  pending: '⏸',
  running: '⏳',
  success: '✅',
  error: '❌',
};

const connectorBorder: Record<string, string> = {
  ad: 'border-blue-500',
  fudo: 'border-emerald-500',
  matrix42: 'border-purple-500',
  servicenow: 'border-orange-500',
  jira: 'border-sky-500',
  remedy: 'border-red-500',
};

const connectorBg: Record<string, string> = {
  ad: 'bg-blue-600/15',
  fudo: 'bg-emerald-600/15',
  matrix42: 'bg-purple-600/15',
  servicenow: 'bg-orange-600/15',
  jira: 'bg-sky-600/15',
  remedy: 'bg-red-600/15',
};

export default function FlowDiagram({ steps, onStepClick }: FlowDiagramProps) {
  if (steps.length === 0) return null;

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h4 className="text-sm font-medium text-gray-400 mb-4">Flow Visualization</h4>
      <div className="flex items-start gap-0 overflow-x-auto pb-2">
        {steps.map((step, i) => {
          const c = getConnector(step.connectorId);
          const border = connectorBorder[step.connectorId] || 'border-gray-500';
          const bg = connectorBg[step.connectorId] || 'bg-gray-700/30';

          return (
            <div key={i} className="flex items-center shrink-0">
              <button
                onClick={() => onStepClick?.(i)}
                className={`flex flex-col items-center p-3 rounded-xl border-2 ${border} ${bg} min-w-[120px] max-w-[140px] hover:brightness-125 transition-all cursor-pointer`}
              >
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-base">{c?.icon || '⚙️'}</span>
                  <span className="text-xs text-gray-500">{c?.name}</span>
                </div>
                <span className="text-xs text-gray-200 text-center font-medium leading-tight">{step.label}</span>
                <span className="mt-2 text-base">{statusIcon[step.status]}</span>
              </button>
              {i < steps.length - 1 && (
                <div className="flex items-center px-1 text-gray-600 shrink-0">
                  <div className="w-6 h-0.5 bg-gray-600" />
                  <span className="text-xs">→</span>
                  <div className="w-6 h-0.5 bg-gray-600" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
