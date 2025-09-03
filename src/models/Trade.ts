import type { Side } from '../utils/helpers';

export interface TradeShape {
  symbol: string;
  quantity: number;
  price: number;
  timestamp: string; 
  side: Side;
}

export class Trade implements TradeShape {
  symbol: string;
  quantity: number;
  price: number;
  timestamp: string;
  side: Side;

  constructor({ symbol, quantity, price, timestamp, side }: TradeShape) {
    this.symbol = symbol;
    this.quantity = quantity;
    this.price = price;
    this.timestamp = new Date(timestamp).toISOString();
    this.side = side;
  }
}

export default Trade;
