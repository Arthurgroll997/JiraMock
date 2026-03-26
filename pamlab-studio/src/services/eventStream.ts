import type { EventItem } from '../types';
import { getSettings } from './api';

export function connectEventStream(onEvent: (e: EventItem) => void, onError?: (e: Event) => void): EventSource | null {
  const settings = getSettings();
  const url = settings.fudoUrl + '/api/v2/events/stream';
  try {
    const es = new EventSource(url);
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        const item: EventItem = {
          id: data.id || crypto.randomUUID(),
          timestamp: data.timestamp || new Date().toISOString(),
          type: data.type || data.event_type || 'unknown',
          description: data.description || data.message || JSON.stringify(data),
          severity: data.severity || 'info',
        };
        onEvent(item);
      } catch {
        onEvent({
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          type: 'raw',
          description: ev.data,
          severity: 'info',
        });
      }
    };
    es.onerror = (e) => onError?.(e);
    return es;
  } catch {
    return null;
  }
}
