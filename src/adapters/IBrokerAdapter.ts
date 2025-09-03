export interface Token {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export abstract class IBrokerAdapter {
  abstract getName(): string;
  abstract fetchTrades(token: Token): Promise<any[]>;
  abstract refreshToken(oldToken: Token | null): Promise<Token>;
}
