import type { DynamicMapping } from '../config/dynamicBrokers';
import type { NormalizedTrade, Side } from './helpers';

function getByPath(obj: any, path: string): any {
  if (!path) return undefined;
  return path.split('.').reduce((acc: any, key: string) => (acc ? acc[key] : undefined), obj);
}

export function normalizeWithMapping(raw: any, mapping: DynamicMapping): NormalizedTrade {
  const symbol = String(getByPath(raw, mapping.symbol));
  const quantityVal = getByPath(raw, mapping.quantity);
  const priceVal = getByPath(raw, mapping.price);
  const tsVal = mapping.timestamp ? getByPath(raw, mapping.timestamp) : new Date().toISOString();
  const sideVal = String(getByPath(raw, mapping.side) ?? '').toUpperCase();

  let side: Side = 'BUY';
  if (sideVal === 'SELL') side = 'SELL';
  if (!sideVal && typeof quantityVal === 'number' && quantityVal < 0) side = 'SELL';

  return {
    symbol,
    quantity: Number(quantityVal),
    price: Number(priceVal),
    timestamp: new Date(tsVal as any).toISOString(),
    side,
  };
}


