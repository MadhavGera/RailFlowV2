import { Server, Socket } from 'socket.io';
import redis from '../config/redis.js';

const LOCK_TTL = 600; // 10 minutes in seconds

export const registerSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('🔌 Client connected:', socket.id);

    // --- LOCK SEAT ---
    // Redis key: lock:seat:{trainId}:{date}:{seatNumber}
    // Value: socket.id (or userId if authenticated)
    socket.on('lock-seat', async ({ seatId, seatNumber, trainId, date }) => {
      const lockKey = `lock:seat:${trainId}:${date}:${seatNumber}`;
      const userId = socket.id;

      try {
        // NX = only set if not exists, EX = TTL in seconds
        const result = await redis.set(lockKey, userId, 'EX', LOCK_TTL, 'NX');

        if (result === 'OK') {
          // Lock acquired — tell this user and broadcast to all others
          socket.emit('seat-locked', { seatId, seatNumber, status: 'success' });
          socket.broadcast.emit('seat-status-update', {
            seatId,
            seatNumber,
            status: 'LOCKED',
            lockedBy: userId,
          });
        } else {
          // Already locked — check if it's by this socket (refresh)
          const currentHolder = await redis.get(lockKey);
          if (currentHolder === userId) {
            await redis.expire(lockKey, LOCK_TTL);
            socket.emit('seat-locked', { seatId, seatNumber, status: 'success' });
          } else {
            socket.emit('seat-lock-failed', {
              seatId,
              seatNumber,
              message: 'Seat is already selected by another user',
            });
          }
        }
      } catch (err) {
        console.error('Redis lock error:', err);
        socket.emit('error', { message: 'Could not lock seat. Please try again.' });
      }
    });

    // --- UNLOCK SEAT ---
    socket.on('unlock-seat', async ({ seatId, seatNumber, trainId, date }) => {
      const lockKey = `lock:seat:${trainId}:${date}:${seatNumber}`;
      const userId = socket.id;

      try {
        const currentHolder = await redis.get(lockKey);
        if (currentHolder === userId) {
          await redis.del(lockKey);
          socket.emit('seat-unlocked', { seatId, seatNumber, status: 'success' });
          socket.broadcast.emit('seat-status-update', {
            seatId,
            seatNumber,
            status: 'AVAILABLE',
          });
        }
      } catch (err) {
        console.error('Redis unlock error:', err);
      }
    });

    // --- BOOKING CONFIRMED via HTTP (broadcast only) ---
    // The actual booking logic is in POST /api/bookings/confirm (REST)
    // The frontend calls HTTP confirm, then emits this event to broadcast seat updates
    socket.on('broadcast-booked', ({ seatNumbers, trainId, date }) => {
      seatNumbers.forEach((seatNumber: string) => {
        io.emit('seat-status-update', {
          seatNumber,
          trainId,
          date,
          status: 'BOOKED',
        });
      });
    });

    // --- BOOKING CANCELLED via HTTP (broadcast only) ---
    socket.on('broadcast-cancelled', ({ seatNumbers, trainId, date }) => {
      seatNumbers.forEach((seatNumber: string) => {
        io.emit('seat-status-update', {
          seatNumber,
          trainId,
          date,
          status: 'AVAILABLE',
        });
      });
    });

    // --- DISCONNECT: release all locks held by this socket ---
    socket.on('disconnect', async () => {
      console.log('🔌 Client disconnected:', socket.id);
      // Note: Redis TTL handles cleanup automatically within 10 minutes.
      // For instant cleanup on disconnect, we'd need to track keys per socket.
      // This is left as a production enhancement.
    });
  });
};
