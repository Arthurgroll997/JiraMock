import type { HealthStatus } from '../types';

export default function ApiStatusCard({ status }: { status: HealthStatus }) {
  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-100">{status.name}</h3>
        <span className={`w-3 h-3 rounded-full ${status.healthy ? 'bg-green-400' : 'bg-red-500'}`} />
      </div>
      <p className="text-xs text-gray-500 font-mono mb-3">{status.url}</p>
      <div className="flex items-center justify-between text-sm">
        <span className={status.healthy ? 'text-green-400' : 'text-red-400'}>
          {status.healthy ? '● Online' : '● Offline'}
        </span>
        {status.responseTime !== null && (
          <span className="text-gray-400">{status.responseTime}ms</span>
        )}
      </div>
    </div>
  );
}
