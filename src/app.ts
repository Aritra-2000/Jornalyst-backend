import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import tradeRouter from './route/tradeRouter';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(cors());

app.use('/api/v1', tradeRouter);

app.listen(PORT, () => {
  console.log(`HTTP server listening on http://localhost:${PORT}`);
});
