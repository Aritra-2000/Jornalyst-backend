import { syncTrades } from '../services/SyncService';
import { Request, Response } from 'express';

export const tradeAdapter = async (req: Request, res: Response) => {
    try {
        
        const userId = typeof req.body.userId === 'string' ? req.body.userId.trim() : '';
        const broker = typeof req.body.broker === 'string' ? req.body.broker.trim() : '';
  
      if (!userId || !broker) {
        return res.status(400).json({ error: 'Missing query params: userId, broker' });
      }
  
      const trades = await syncTrades(userId, broker);
      res.json({ userId, broker, count: trades.length, trades });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Internal Server Error' });
    }
}