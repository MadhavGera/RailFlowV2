import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import paymentRoutes from './routes/payments.js'

dotenv.config();

import { connectDB } from './config/db.js';
import { registerSocketHandlers } from './services/socketHandlers.js';
import authRoutes from './routes/auth.js';
import trainRoutes from './routes/trains.js';
import seatRoutes from './routes/seats.js';
import bookingRoutes from './routes/bookings.js';

async function startServer() {
  await connectDB();

  const app = express();
  const httpServer = createServer(app);
  const PORT = Number(process.env.PORT) || 5000;
  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

  // --- Socket.IO ---
  const io = new Server(httpServer, {
    cors: {
      origin: CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });
  registerSocketHandlers(io);

  // --- Middleware ---
  app.use(cors({ origin: CLIENT_URL, credentials: true }));
  app.use(cookieParser());
  app.use(express.json());

  // --- Routes ---
  app.use('/api/auth', authRoutes);
  app.use('/api/trains', trainRoutes);
  app.use('/api/seats', seatRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/payments', paymentRoutes)

  // Health check
  app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
  app.get('/health', (req, res) => {
    res.status(200).send('Backend is awake!');
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚂 RailFlow Backend running on http://localhost:${PORT}`);
    console.log(`   Client URL: ${CLIENT_URL}`);
  });
}

startServer();
