import type { IBrokerAdapter } from './IBrokerAdapter';
import GenericAdapter from './GenericAdapter';
import { getDynamicBrokerConfig, DYNAMIC_BROKERS } from '../config/dynamicBrokers';

const registry: Record<string, IBrokerAdapter> = {};

for (const key of Object.keys(DYNAMIC_BROKERS)) {
  const cfg = getDynamicBrokerConfig(key)!;
  registry[key] = new GenericAdapter(cfg);
}

export function getAdapter(name: string): IBrokerAdapter {
  const key = String(name || '').toLowerCase();
  const adapter = registry[key];
  if (!adapter) throw new Error(`Unknown broker adapter: ${name}`);
  return adapter;
}

export function getAllAdapters(): Record<string, IBrokerAdapter> {
  return { ...registry };
}

export { registry };
