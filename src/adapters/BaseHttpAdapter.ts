import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Token } from './IBrokerAdapter';

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export class BrokerApiError extends Error {
  public readonly code: string;
  public readonly details?: any;
  public readonly statusCode?: number;

  constructor(message: string, code: string, statusCode?: number, details?: any) {
    super(message);
    this.name = 'BrokerApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export interface HttpAdapterOptions {
  baseURL?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  defaultHeaders?: Record<string, string>;
}

type ResolvedHttpAdapterOptions = {
  baseURL?: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  defaultHeaders: Record<string, string>;
};

export abstract class BaseHttpAdapter {
  protected httpClient: AxiosInstance;
  protected config: ResolvedHttpAdapterOptions;
  protected brokerName: string;

  constructor(brokerName: string, options: HttpAdapterOptions = {}) {
    this.brokerName = brokerName;
    this.config = {
      baseURL: options.baseURL,
      timeout: options.timeout ?? 30_000,
      retryAttempts: options.retryAttempts ?? 3,
      retryDelay: options.retryDelay ?? 1_000,
      defaultHeaders: options.defaultHeaders || {
        'Content-Type': 'application/json',
        'User-Agent': 'Journalyst-Broker-Integration/1.0',
      },
    };

    const axiosOptions: any = {
      timeout: this.config.timeout,
      headers: this.config.defaultHeaders,
    };
    if (this.config.baseURL) {
      axiosOptions.baseURL = this.config.baseURL;
    }
    this.httpClient = axios.create(axiosOptions);

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for logging and auth
    this.httpClient.interceptors.request.use(
      (config) => {
        console.log(`[${this.brokerName}] API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error(`[${this.brokerName}] Request Error:`, error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => {
        console.log(`[${this.brokerName}] API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        const apiError = this.handleApiError(error);
        console.error(`[${this.brokerName}] API Error:`, apiError);
        return Promise.reject(apiError);
      }
    );
  }

  protected handleApiError(error: any): BrokerApiError {
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || data?.error || `HTTP ${status} Error`;
      const code = data?.code || `HTTP_${status}`;
      return new BrokerApiError(message, code, status, data);
    } else if (error.request) {
      return new BrokerApiError(
        'No response received from broker API',
        'NETWORK_ERROR',
        undefined,
        { timeout: this.config.timeout }
      );
    } else {
      // Something else happened
      return new BrokerApiError(
        error.message || 'Unknown API error',
        'UNKNOWN_ERROR',
        undefined,
        error
      );
    }
  }

  protected async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    token?: Token,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      method,
      url: endpoint,
      data,
      headers: {
        ...additionalHeaders,
      },
    };

    // Add authentication if token is provided
    if (token) {
      config.headers!['Authorization'] = `Bearer ${token.accessToken}`;
    }

    try {
      const response: AxiosResponse<T> = await this.httpClient.request(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  protected async retryRequest<T>(
    requestFn: () => Promise<T>,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt < this.config.retryAttempts && this.shouldRetry(error)) {
        console.log(`[${this.brokerName}] Retrying request (attempt ${attempt + 1}/${this.config.retryAttempts})`);
        await this.delay(this.config.retryDelay * attempt);
        return this.retryRequest(requestFn, attempt + 1);
      }
      throw error;
    }
  }

  private shouldRetry(error: any): boolean {
    if (error instanceof BrokerApiError) {
      // Retry on network errors and 5xx server errors
      return error.code === 'NETWORK_ERROR' || 
             (error.statusCode !== undefined && error.statusCode >= 500);
    }
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Abstract methods to be implemented by specific adapters
  abstract fetchTrades(token: Token): Promise<any[]>;
  abstract refreshToken(oldToken: Token | null): Promise<Token>;
}
