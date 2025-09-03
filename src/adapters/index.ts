import type { IBrokerAdapter } from './IBrokerAdapter';
import { MetaTraderAdapter } from './MetaTraderAdapter';
import ZerodhaAdapter from './ZerodhaAdapter';

const registry: Record<string, IBrokerAdapter> = {
  metatrader: new MetaTraderAdapter(),
  zerodha: new ZerodhaAdapter(),
};

export function getAdapter(name: string): IBrokerAdapter {
  const key = String(name || '').toLowerCase();
  const adapter = registry[key];
  if (!adapter) throw new Error(`Unknown broker adapter: ${name}`);
  return adapter;
}

export { registry };
