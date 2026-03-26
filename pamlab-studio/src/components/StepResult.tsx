import type { StepResultType } from '../types';

export default function StepResult({ step }: { step: StepResultType }) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg ${step.success ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
      <span className="text-lg mt-0.5">{step.success ? '✅' : '❌'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-200">
          Step {step.step}: {step.description}
        </p>
        {step.result && (
          <p className="text-xs text-gray-500 mt-1 font-mono">
            {step.result.method} {step.result.url} → {step.result.status} ({step.result.time}ms)
          </p>
        )}
      </div>
    </div>
  );
}
