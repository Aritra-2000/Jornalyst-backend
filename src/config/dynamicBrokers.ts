export type FieldPath = string; 

export interface DynamicMapping {
  symbol: FieldPath;
  quantity: FieldPath;
  price: FieldPath;
  timestamp: FieldPath;
  side: FieldPath; 
}

export interface DynamicHeaders {
  request?: Record<string, string>;
}

export interface DynamicBrokerConfig {
  name: string;                    
  baseUrl: string;                 
  endpoints: {
    trades: string;                
    refresh: string;               
  };
  responsePath?: string;           
  headers?: DynamicHeaders;        
  mapping: DynamicMapping;         
  refreshPayload?: Record<string, string>;
}


function env(name: string, fallback: string = ''): string {
  return process.env[name] || fallback;
}

export const DYNAMIC_BROKERS: Record<string, DynamicBrokerConfig> = {
  metatrader: {
    name: 'metatrader',
    baseUrl: env('METATRADER_BASE_URL', 'https://api.metatrader.com'),
    endpoints: {
      trades: '/v1/trades',
      refresh: '/v1/auth/refresh',
    },
    headers: {
      request: {
        'X-API-Version': '1.0',
        'X-Client-ID': env('METATRADER_CLIENT_ID', ''),
      },
    },
    responsePath: '', 
    mapping: {
      symbol: 'symbol',
      quantity: 'volume',
      price: 'price',
      timestamp: 'time',
      side: 'type',
    },
    refreshPayload: {
      refresh_token: '${TOKEN:refresh}',
      grant_type: 'refresh_token',
      client_id: '${ENV:METATRADER_CLIENT_ID}',
      client_secret: '${ENV:METATRADER_CLIENT_SECRET}',
    },
  },
  zerodha: {
    name: 'zerodha',
    baseUrl: env('ZERODHA_BASE_URL', 'https://api.kite.trade'),
    endpoints: {
      trades: '/portfolio/positions',
      refresh: '/session/refresh_token',
    },
    headers: {
      request: {
        'X-Kite-Version': '3',
      },
    },
    responsePath: 'data.positions.NRML',
    mapping: {
      symbol: 'tradingsymbol',
      quantity: 'quantity',
      price: 'average_price',
      timestamp: '', 
      side: 'quantity', 
    },
    refreshPayload: {
      refresh_token: '${TOKEN:refresh}',
      client_id: '${ENV:ZERODHA_API_KEY}',
      client_secret: '${ENV:ZERODHA_API_SECRET}',
    },
  },
};

export function getDynamicBrokerConfig(name: string): DynamicBrokerConfig | undefined {
  return DYNAMIC_BROKERS[String(name || '').toLowerCase()];
}


