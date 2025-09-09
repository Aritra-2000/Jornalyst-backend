# 🚀 Real API Integration Guide

This guide explains how to integrate your Broker Integration Layer with real broker APIs.

## 📋 Current Status

✅ **Ready for Real APIs**: Your system is now prepared for real broker integration
✅ **Mock Mode**: Currently using mock data for development/testing
✅ **Configuration System**: Environment-based configuration for different brokers
✅ **Error Handling**: Comprehensive error handling for API failures
✅ **Retry Logic**: Automatic retry for network failures
✅ **Token Management**: Automatic token refresh handling

## 🔧 Setup for Real APIs

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in your project root:

```bash
# Switch to real API mode
USE_MOCK_DATA=false

# MetaTrader Configuration
METATRADER_BASE_URL=https://api.metatrader.com
METATRADER_CLIENT_ID=your_actual_client_id
METATRADER_CLIENT_SECRET=your_actual_client_secret

# Zerodha Configuration
ZERODHA_BASE_URL=https://api.kite.trade
ZERODHA_API_KEY=your_actual_api_key
ZERODHA_API_SECRET=your_actual_api_secret
```

### 3. Get Broker API Credentials

#### MetaTrader
1. Register at [MetaTrader Developer Portal](https://www.metatrader.com/developers)
2. Create a new application
3. Get your Client ID and Client Secret
4. Configure OAuth redirect URIs

#### Zerodha (Kite Connect)
1. Register at [Kite Connect](https://kite.trade/)
2. Create a new app
3. Get your API Key and API Secret
4. Configure redirect URIs

## 🔄 How It Works

### Current Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Your App      │───▶│  Broker Adapter  │───▶│  Real Broker    │
│                 │    │                  │    │     API         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Data Flow
1. **Request**: Your app calls `syncTrades(userId, brokerName)`
2. **Token Check**: System checks if token is valid/expired
3. **API Call**: Adapter makes HTTP request to real broker API
4. **Response**: Raw broker data is received
5. **Normalization**: Data is transformed to your Trade format
6. **Return**: Normalized trades are returned

## 🛠️ Customization for Specific Brokers

### Adding a New Broker

1. **Create Adapter**:
```typescript
// src/adapters/MyBrokerAdapter.ts
export class MyBrokerAdapter extends BaseHttpAdapter implements IBrokerAdapter {
  constructor(useMockData: boolean = true) {
    super('mybroker');
    this.useMockData = useMockData;
  }

  async fetchTrades(token: Token): Promise<any[]> {
    if (this.useMockData) {
      // Mock implementation
      return mockTrades;
    }

    // Real API implementation
    const response = await this.makeRequest('GET', '/trades', undefined, token);
    return this.transformTradesResponse(response);
  }

  private transformTradesResponse(response: any): any[] {
    // Transform your broker's response format
    return response.trades.map(trade => ({
      symbol: trade.instrument,
      quantity: trade.volume,
      price: trade.price,
      timestamp: trade.time,
      side: trade.direction
    }));
  }
}
```

2. **Add Configuration**:
```typescript
// src/config/brokerConfig.ts
export const BROKER_CONFIGS = {
  // ... existing configs
  mybroker: {
    baseUrl: process.env.MYBROKER_BASE_URL || 'https://api.mybroker.com',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
};
```

3. **Register Adapter**:
```typescript
// src/adapters/index.ts
const registry = {
  // ... existing adapters
  mybroker: new MyBrokerAdapter(USE_MOCK_DATA),
};
```

## 🔍 API Response Transformation

Each broker returns data in different formats. Your adapters handle the transformation:

### MetaTrader Format
```json
{
  "symbol": "EURUSD",
  "volume": 1.0,
  "price": 1.0845,
  "time": "2025-09-03T09:30:00Z",
  "type": "buy"
}
```

### Zerodha Format
```json
{
  "tradingsymbol": "INFY",
  "qty": 10,
  "avg_price": 1500,
  "timestamp": "2025-09-03T10:00:00Z",
  "side": "BUY"
}
```

### Normalized Format (Your Trade Model)
```json
{
  "symbol": "EURUSD",
  "quantity": 1,
  "price": 1.0845,
  "timestamp": "2025-09-03T09:30:00Z",
  "side": "BUY"
}
```

## 🚨 Error Handling

The system handles various error scenarios:

- **Network Errors**: Automatic retry with exponential backoff
- **Authentication Errors**: Token refresh attempts
- **Rate Limiting**: Respects broker API rate limits
- **Invalid Responses**: Graceful error messages

## 📊 Monitoring and Logging

All API calls are logged with:
- Request/response details
- Timing information
- Error details
- Retry attempts

## 🧪 Testing

### Mock Mode (Current)
```bash
USE_MOCK_DATA=true npm run dev:api
```

### Real API Mode
```bash
USE_MOCK_DATA=false npm run dev:api
```

## 🔐 Security Best Practices

1. **Environment Variables**: Store credentials in `.env` files
2. **HTTPS Only**: All API communications use HTTPS
3. **Token Rotation**: Automatic token refresh
4. **Error Sanitization**: Don't expose sensitive data in errors
5. **Rate Limiting**: Respect broker API limits

## 📈 Performance Optimization

- **Connection Pooling**: Reuse HTTP connections
- **Request Batching**: Combine multiple requests when possible
- **Caching**: Cache frequently accessed data
- **Retry Logic**: Smart retry with exponential backoff

## 🆘 Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check API credentials
   - Verify token format
   - Ensure proper OAuth flow

2. **Network Timeouts**
   - Increase timeout values
   - Check network connectivity
   - Verify API endpoints

3. **Rate Limiting**
   - Implement request throttling
   - Use exponential backoff
   - Monitor API usage

### Debug Mode

Enable detailed logging:
```bash
LOG_LEVEL=debug npm run dev:api
```

## 🎯 Next Steps

1. **Get API Credentials**: Obtain real broker API access
2. **Test Integration**: Start with one broker
3. **Monitor Performance**: Watch API response times
4. **Handle Edge Cases**: Test error scenarios
5. **Scale Up**: Add more brokers as needed

Your system is now ready for real API integration! 🚀
