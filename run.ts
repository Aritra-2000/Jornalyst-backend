import { syncTrades } from './src/services/SyncService';

export { syncTrades };

if (require.main === module) {
  (async () => {
    const userId = 'demo-user-1';
    const broker = 'zerodha';
    const trades = await syncTrades(userId, broker);
  
    console.log('Normalized Trades:', JSON.stringify(trades, null, 2));
  })().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
