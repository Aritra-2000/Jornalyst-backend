import { nowMs } from '../utils/helpers';
import type { IBrokerAdapter, Token } from '../adapters/IBrokerAdapter';

// In-memory token store
const store: Record<string, Record<string, Token>> = Object.create(null);

export function get(userId: string, broker: string): Token | null {
  return store[userId]?.[broker] || null;
}

export function set(userId: string, broker: string, token: Token): Token {
  if (!store[userId]) store[userId] = Object.create(null);
  store[userId][broker] = token;
  return token;
}

export function isExpired(token: Token | null, skewMs: number = 30_000): boolean {
  if (!token || !token.expiresAt) return true;
  return token.expiresAt - skewMs <= nowMs();
}

export async function getValidToken(userId: string, broker: string, adapter: IBrokerAdapter): Promise<Token> {
  let token = get(userId, broker);
  if (!token) {
    token = await adapter.refreshToken(null);
    set(userId, broker, token);
    return token;
  }
  if (isExpired(token)) {
    const refreshed = await adapter.refreshToken(token);
    set(userId, broker, refreshed);
    return refreshed;
  }
  return token;
}
