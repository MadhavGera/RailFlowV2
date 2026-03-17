import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import Booking from '../models/Booking.js';
import Seat from '../models/Seat.js';
import redis from '../config/redis.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/bookings  — user's booking history (Phase 7)
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await Booking.find({ userId: req.user!.email }).sort({ timestamp: -1 });
    
    // 👇 Map MongoDB's _id to the frontend's expected id property
    const formattedBookings = bookings.map((b) => ({
      ...b.toObject(),
      id: b._id.toString(),
    }));

    res.json({ bookings: formattedBookings });
  } catch {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// POST /api/bookings/confirm  — atomic booking (Phase 5)
router.post('/confirm', requireAuth, async (req: AuthRequest, res: Response) => {
  const { seatIds, trainId, trainName, trainNumber, journeyDate, fromStationId, fromStationIndex, toStationId, toStationIndex } = req.body;

  if (!seatIds?.length || !trainId || !journeyDate)
    return res.status(400).json({ error: 'Missing required booking fields' });

  const userSocketId = req.body.socketId; // passed from frontend to verify lock ownership
  const userId = req.user!.email;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Verify Redis locks belong to this user (by socket ID or userId)
    for (const seatId of seatIds) {
      // Find seat to get its seatNumber
      const seat = await Seat.findById(seatId);
      if (!seat) throw new Error(`Seat ${seatId} not found`);

      const lockKey = `lock:seat:${trainId}:${journeyDate}:${seat.seatNumber}`;
      const lockHolder = await redis.get(lockKey);

      // Accept lock if held by this socket OR this userId
      if (!lockHolder || (lockHolder !== userSocketId && lockHolder !== userId)) {
        throw new Error(`Lock expired or not held for seat ${seat.seatNumber}. Please re-select.`);
      }
    }

    // 2. Update seat statuses to BOOKED in MongoDB (atomic)
    await Seat.updateMany(
      { _id: { $in: seatIds }, status: { $ne: 'BOOKED' } },
      { $set: { status: 'BOOKED' } },
      { session }
    );

    // 3. Fetch seats to compute price and seat numbers
    const seats = await Seat.find({ _id: { $in: seatIds } }).session(session);
    const totalPrice = seats.reduce((sum, s) => sum + s.price, 0);
    const seatNumbers = seats.map((s) => s.seatNumber);

    // 4. Create Booking record with PNR
    const pnr = uuidv4().slice(0, 8).toUpperCase();
    const [booking] = await Booking.create(
      [
        {
          pnr,
          userId,
          trainId,
          trainName,
          trainNumber,
          seatIds,
          seatNumbers,
          journeyDate,
          fromStationId,
          fromStationIndex,
          toStationId,
          toStationIndex,
          totalPrice,
          status: 'CONFIRMED',
          timestamp: Date.now(),
        },
      ],
      { session }
    );

    // 5. Commit transaction
    await session.commitTransaction();

    // 6. Clear Redis locks
    for (const seat of seats) {
      const lockKey = `lock:seat:${trainId}:${journeyDate}:${seat.seatNumber}`;
      await redis.del(lockKey);
    }

    res.status(201).json({
      booking: {
        id: booking._id,
        pnr: booking.pnr,
        seatNumbers,
        totalPrice,
        status: booking.status,
      },
    });
  } catch (err: any) {
    await session.abortTransaction();
    console.error('Booking confirmation error:', err.message);
    res.status(400).json({ error: err.message || 'Booking failed' });
  } finally {
    session.endSession();
  }
});

// POST /api/bookings/cancel  — Phase 8
router.post('/cancel', requireAuth, async (req: AuthRequest, res: Response) => {
  const { bookingId } = req.body;
  const userId = req.user!.email;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findOne({ _id: bookingId, userId }).session(session);
    if (!booking) throw new Error('Booking not found');
    if (booking.status === 'CANCELLED') throw new Error('Booking already cancelled');

    // Mark booking cancelled
    booking.status = 'CANCELLED';
    await booking.save({ session });

    // Release seats back to AVAILABLE
    await Seat.updateMany(
      { _id: { $in: booking.seatIds } },
      { $set: { status: 'AVAILABLE' } },
      { session }
    );

    await session.commitTransaction();

    res.json({ success: true, bookingId, releasedSeats: booking.seatNumbers });
  } catch (err: any) {
    await session.abortTransaction();
    res.status(400).json({ error: err.message || 'Cancellation failed' });
  } finally {
    session.endSession();
  }
});

export default router;
