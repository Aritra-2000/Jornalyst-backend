export const sleep = (ms: number) => new Promise<void>(res => setTimeout(res, ms));
export const nowMs = () => Date.now();

export type Side = 'BUY' | 'SELL';

export interface RawZerodhaTrade {
  tradingsymbol: string;
  qty: number | string;
  avg_price: number | string;
  timestamp: string | number | Date;
  side: Side | string;
}

export interface NormalizedTrade {
  symbol: string;
  quantity: number;
  price: number;
  timestamp: string; 
  side: Side;
}

export function normalizeFromZerodha(raw: RawZerodhaTrade): NormalizedTrade {
  return {
    symbol: String(raw.tradingsymbol),
    quantity: Number(raw.qty),
    price: Number(raw.avg_price),
    timestamp: new Date(raw.timestamp as any).toISOString(),
    side: String(raw.side).toUpperCase() === 'SELL' ? 'SELL' : 'BUY',
  };
}

export interface RawMetaTraderTrade {
  symbol: string;
  volume: number | string;     
  price: number | string;
  time: string | number | Date; 
  type: string;                 
}

export function normalizeFromMetaTrader(raw: RawMetaTraderTrade): NormalizedTrade {
  return {
    symbol: String(raw.symbol).toUpperCase(),
    quantity: Number(raw.volume),
    price: Number(raw.price),
    timestamp: new Date(raw.time as any).toISOString(),
    side: String(raw.type).toLowerCase() === 'sell' ? 'SELL' : 'BUY',
  };
}
