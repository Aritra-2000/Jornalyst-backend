import { IBrokerAdapter, type Token } from './IBrokerAdapter';
import { sleep, nowMs } from '../utils/helpers';

export class MetaTraderAdapter extends IBrokerAdapter {
  getName(): string { return 'metatrader'; }

  async fetchTrades(token: Token): Promise<any[]> {
    await sleep(120);
    if (!token || !token.accessToken) {
      throw new Error('MetaTrader: Missing access token');
    }
    return [
      { symbol: 'EURUSD', volume: 1.0, price: 1.0845, time: '2025-09-03T09:30:00Z', type: 'buy' },
      { symbol: 'GBPUSD', volume: 0.5, price: 1.2752, time: '2025-09-03T10:10:00Z', type: 'sell' },
    ];
  }

  async refreshToken(oldToken: Token | null): Promise<Token> {
    await sleep(80);
    const access = `mt_${Math.random().toString(36).slice(2, 10)}`;
    return {
      accessToken: access,
      refreshToken: oldToken?.refreshToken || `mt_r_${Math.random().toString(36).slice(2, 10)}`,
      expiresAt: nowMs() + 1000 * 60 * 20,
    };
  }
}

export default MetaTraderAdapter;
