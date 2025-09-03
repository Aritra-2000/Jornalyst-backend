# 🏦 Broker Integration Layer (One-Way Sync)

This is my backend engineering assessment for **Journalyst** – a trade journaling platform.

The project implements a simplified **Broker Integration Layer** that can fetch and normalize trades from external brokers. The current implementation includes simulated adapters for **MetaTrader** and **Zerodha**, and a clear architecture to add more brokers.

---

## 🚀 Goal

- Build a clean, modular backend system to sync trades from brokers.  
- Handle tokens with expiry and refresh logic.  
- Normalize raw broker data into a **consistent Trade object**.  
- Provide a simple `syncTrades(userId, brokerName)` function to fetch trades.  
- Make the system easily extensible for future brokers.  

---

## 🧩 Features Implemented

### 1. **Broker Adapter System**
- An abstract base class `IBrokerAdapter` defines:
  - `getName()`
  - `fetchTrades(token)`
  - `refreshToken(oldToken)`
- Implemented one adapter: `MetaTraderAdapter` (simulated API calls for demo).

### 2. **Trade Data Normalization**
- Different brokers return trades in different formats.  
- Designed a consistent **Trade schema** (my own design):

```json
{
  "symbol": "EURUSD",
  "quantity": 1,
  "price": 1.0845,
  "timestamp": "2025-09-03T09:30:00Z",
  "side": "BUY"
}
```

---

## 📁 Folder Structure (TypeScript)

```
/src
  /adapters
    IBrokerAdapter.ts       # Abstract base
    MetaTraderAdapter.ts    # Simulated MetaTrader adapter
    index.ts                # Adapter registry
  /services
    TokenService.ts         # In-memory token management
    SyncService.ts          # Core syncTrades logic
  /models
    Trade.ts                # Normalized Trade model
  /utils
    helpers.ts              # Helpers + normalizers
run.ts                      # CLI entry (exports syncTrades + demo)
tsconfig.json               # TypeScript config
```

---

## ▶️ Run the Demo (CLI)

Prereqs: Node 18+.

1) Install
```
npm i
```

2) Build and run
```
npm run build && node dist/run.js
```

Dev (no build):
```
npm run dev:cli
```

This executes `syncTrades('demo-user-1', 'zerodha')` (see `run.ts`) and prints normalized trades.

---

## 🌐 Run the HTTP Server (Express)

Install deps (first time): see Installation section below.

Dev server:
```
npm run dev:api
```

Prod server:
```
npm run start:api
```

Default port: 3000. Change via `PORT` env.

Endpoint:
- `POST /sync` → normalized trades

Examples:
```
curl -X POST "http://localhost:3000/sync" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo-user-1",
    "broker": "metatrader"
  }'

curl -X POST "http://localhost:3000/sync" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo-user-1",
    "broker": "zerodha"
  }'
```

---

## 🔧 Programmatic Usage

```ts
// After build
import { syncTrades } from './dist/src/services/SyncService';

(async () => {
  const trades = await syncTrades('user-123', 'metatrader');
  console.log(trades);
})();
```

---

## 🧠 Design Decisions

- **Abstract adapter class** (`IBrokerAdapter`) gives a clear contract and allows common orchestration in services.
- **Normalization separate from fetching**: fetch returns broker raw rows; service applies a broker-specific normalizer to map into the `Trade` model.
- **In-memory token service** to simulate per-user tokens with expiry and refresh; easily swappable with DB/Redis in real systems.
- **Strict TS types** improve clarity and future maintainability.

---

## ➕ Adding a New Broker

1. Create `src/adapters/MyBrokerAdapter.ts` extending `IBrokerAdapter`:
   - `getName(): 'mybroker'`
   - `fetchTrades(token)` → returns raw trades as returned by the broker
   - `refreshToken(oldToken)` → returns `{ accessToken, refreshToken, expiresAt }`
2. Register in `src/adapters/index.ts`:
   - `registry.mybroker = new MyBrokerAdapter()`
3. Add a normalizer in `src/utils/helpers.ts` and update `SyncService` switch-case to use it.

---

## ✅ Assumptions & Simplifications

- Network requests are simulated for demo (no external credentials required).
- Tokens are stored in-memory and refreshed with a simulated flow.
- Two brokers are enabled in the registry: `metatrader` and `zerodha`.
- Error handling is minimal but pragmatic; real implementation should map broker/API errors.

---

## (Optional) API Notes

The Express server exposes a single endpoint `POST /sync`. See "Run the HTTP Server (Express)" above for curl examples.

---

## (Optional) Walkthrough Video

Link: <your-video-link-here>

---

## Submission

- Source code ready for a GitHub repo.
- This README includes design decisions, how to add a broker, assumptions, architecture diagram, and run instructions.
