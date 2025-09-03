import { IBrokerAdapter, type Token } from './IBrokerAdapter';
import { sleep, nowMs } from '../utils/helpers';

export class ZerodhaAdapter extends IBrokerAdapter {
  getName(): string { return 'zerodha'; }

  async fetchTrades(token: Token): Promise<any[]> {
    await sleep(150);
    if (!token || !token.accessToken) {
      throw new Error('Zerodha: Missing access token');
    }
    return [
      { tradingsymbol: 'INFY', qty: 10, avg_price: 1500, timestamp: '2025-09-03T10:00:00Z', side: 'BUY' },
      { tradingsymbol: 'TCS', qty: 5, avg_price: 3600.5, timestamp: '2025-09-03T11:15:00Z', side: 'SELL' },
    ];
  }

  async refreshToken(oldToken: Token | null): Promise<Token> {
    await sleep(100);
    const newAccess = `zk_${Math.random().toString(36).slice(2, 10)}`;
    return {
      accessToken: newAccess,
      refreshToken: oldToken?.refreshToken || `zr_${Math.random().toString(36).slice(2, 10)}`,
      expiresAt: nowMs() + 1000 * 60 * 30,
    };
  }
}

export default ZerodhaAdapter;
