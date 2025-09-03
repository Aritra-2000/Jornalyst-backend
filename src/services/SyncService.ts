import { getAdapter } from '../adapters';
import Trade from '../models/Trade';
import { getValidToken } from './TokenService';
import { normalizeFromMetaTrader, normalizeFromZerodha } from '../utils/helpers';

export async function syncTrades(userId: string, brokerName: string): Promise<Trade[]> {
  const adapter = getAdapter(brokerName);
  const token = await getValidToken(userId, adapter.getName(), adapter);
  const rawTrades = await adapter.fetchTrades(token);

  switch (adapter.getName()) {
    case 'metatrader':
      return rawTrades.map((r: any) => new Trade(normalizeFromMetaTrader(r)));
    case 'zerodha':
      return rawTrades.map((r: any) => new Trade(normalizeFromZerodha(r)));
    default:
      throw new Error(`No normalization implemented for ${adapter.getName()}`);
  }
}
