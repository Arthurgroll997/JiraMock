import { useState, useEffect, useRef } from 'react';
import type { EventItem } from '../types';
import { connectEventStream } from '../services/eventStream';

const severityColors: Record<string, string> = {
  info: 'text-blue-400 bg-blue-900/20',
  warning: 'text-yellow-400 bg-yellow-900/20',
  error: 'text-red-400 bg-red-900/20',
  critical: 'text-red-500 bg-red-900/30',
};

export default function EventStream() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  const connect = () => {
    esRef.current?.close();
    esRef.current = connectEventStream(
      (ev) => { setEvents((prev) => [ev, ...prev].slice(0, 200)); setConnected(true); },
      () => setConnected(false)
    );
  };

  const disconnect = () => {
    esRef.current?.close();
    esRef.current = null;
    setConnected(false);
  };

  useEffect(() => () => { esRef.current?.close(); }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-100">Event Stream</h2>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-2 text-sm ${connected ? 'text-green-400' : 'text-gray-500'}`}>
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
            {connected ? 'Connected' : 'Disconnected'}
          </span>
          <button onClick={connected ? disconnect : connect} className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${connected ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
            {connected ? 'Disconnect' : 'Connect'}
          </button>
          {events.length > 0 && <button onClick={() => setEvents([])} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors">Clear</button>}
        </div>
      </div>

      <div className="space-y-2">
        {events.length === 0 && <p className="text-gray-500 text-sm">No events. Click "Connect" to start receiving events from Fudo PAM SSE stream.</p>}
        {events.map((ev) => (
          <div key={ev.id} className={`flex items-start gap-3 p-3 rounded-lg ${severityColors[ev.severity] || severityColors.info}`}>
            <span className="text-xs text-gray-500 font-mono whitespace-nowrap mt-0.5">{new Date(ev.timestamp).toLocaleTimeString()}</span>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-800 text-gray-300">{ev.type}</span>
            <span className="text-sm text-gray-200 flex-1">{ev.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
