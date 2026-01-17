import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { jobRouter } from './routes/jobs.js';
import { planRouter } from './routes/plans.js';
import { setupWebSocket } from './websocket.js';

const PORT = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3001;

const app = express();
const server = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/jobs', jobRouter);
app.use('/api/plans', planRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket setup
const wss = new WebSocketServer({ server });
setupWebSocket(wss);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
