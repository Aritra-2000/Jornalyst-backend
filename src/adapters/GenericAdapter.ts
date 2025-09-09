import axios, { AxiosInstance } from 'axios';
import { BaseHttpAdapter, BrokerApiError } from './BaseHttpAdapter';
import type { Token } from './IBrokerAdapter';
import type { DynamicBrokerConfig } from '../config/dynamicBrokers';

export class GenericAdapter extends BaseHttpAdapter {
  private readonly dynamicConfig: DynamicBrokerConfig;

  constructor(dynamicConfig: DynamicBrokerConfig) {
    super(dynamicConfig.name, {
      baseURL: dynamicConfig.baseUrl,
      defaultHeaders: {
        'Content-Type': 'application/json',
        'User-Agent': 'Journalyst-Broker-Integration/1.0',
        ...(dynamicConfig.headers?.request || {}),
      },
    });
    this.dynamicConfig = dynamicConfig;
  }

  getName(): string { return this.dynamicConfig.name; }

  async fetchTrades(token: Token): Promise<any[]> {
    if (!token || !token.accessToken) {
      throw new Error(`${this.dynamicConfig.name}: Missing access token`);
    }
    try {
      const response = await this.retryRequest(async () => {
        return this.makeRequest<any>(
          'GET',
          this.dynamicConfig.endpoints.trades,
          undefined,
          token,
          this.dynamicConfig.headers?.request
        );
      });

      const tradesArray = this.extractArrayFromPath(response, this.dynamicConfig.responsePath);
      if (!Array.isArray(tradesArray)) {
        throw new Error('Trades response is not an array at configured path');
      }
      return tradesArray;
    } catch (error) {
      if (error instanceof BrokerApiError) {
        throw new Error(`${this.dynamicConfig.name} API Error: ${error.message} (${error.code})`);
      }
      throw error;
    }
  }

  async refreshToken(oldToken: Token | null): Promise<Token> {
    try {
      const payload = this.buildRefreshPayload(this.dynamicConfig, oldToken);
      const response = await this.retryRequest(async () => {
        return this.makeRequest<any>(
          'POST',
          this.dynamicConfig.endpoints.refresh,
          payload
        );
      });

      return this.transformTokenResponse(response);
    } catch (error) {
      if (error instanceof BrokerApiError) {
        throw new Error(`${this.dynamicConfig.name} Token Refresh Error: ${error.message} (${error.code})`);
      }
      throw error;
    }
  }

  private extractArrayFromPath(obj: any, path?: string): any[] | any {
    if (!path || path.trim() === '') return obj;
    return path.split('.').reduce((acc: any, key: string) => (acc ? acc[key] : undefined), obj);
  }

  private transformTokenResponse(response: any): Token {
    const nowMs = Date.now();
    return {
      accessToken: response.access_token || response.accessToken,
      refreshToken: response.refresh_token || response.refreshToken,
      expiresAt: response.expires_in
        ? nowMs + response.expires_in * 1000
        : response.expires_at || nowMs + 20 * 60 * 1000,
    };
  }

  private buildRefreshPayload(cfg: DynamicBrokerConfig, oldToken: Token | null): Record<string, any> {
    const payload: Record<string, any> = {};
    for (const [k, v] of Object.entries(cfg.refreshPayload || {})) {
      if (typeof v !== 'string') { payload[k] = v; continue; }
      payload[k] = v
        .replace('${TOKEN:refresh}', String(oldToken?.refreshToken || ''))
        .replace('${ENV:METATRADER_CLIENT_ID}', String(process.env.METATRADER_CLIENT_ID || ''))
        .replace('${ENV:METATRADER_CLIENT_SECRET}', String(process.env.METATRADER_CLIENT_SECRET || ''))
        .replace('${ENV:ZERODHA_API_KEY}', String(process.env.ZERODHA_API_KEY || ''))
        .replace('${ENV:ZERODHA_API_SECRET}', String(process.env.ZERODHA_API_SECRET || ''));
    }
    return payload;
  }
}

export default GenericAdapter;


