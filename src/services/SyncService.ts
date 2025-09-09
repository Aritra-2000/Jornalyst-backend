import { getAdapter } from '../adapters';
import Trade from '../models/Trade';
import { getValidToken } from './TokenService';
import { getDynamicBrokerConfig } from '../config/dynamicBrokers';
import { normalizeWithMapping } from '../utils/dynamicNormalize';

export async function syncTrades(userId: string, brokerName: string): Promise<Trade[]> {
  const adapter = getAdapter(brokerName);
  const token = await getValidToken(userId, adapter.getName(), adapter);
  const rawTrades = await adapter.fetchTrades(token);

  const cfg = getDynamicBrokerConfig(adapter.getName());
  if (!cfg) {
    throw new Error(`No dynamic config found for broker ${adapter.getName()}`);
  }
  return rawTrades.map((r: any) => new Trade(normalizeWithMapping(r, cfg.mapping)));
}
