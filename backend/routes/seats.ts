import { Router, Request, Response } from 'express';
import Seat from '../models/Seat.js';
import Booking from '../models/Booking.js';

const router = Router();

// GET /api/seats?trainId=xxx&date=2024-12-01
router.get('/', async (req: Request, res: Response) => {
  try {
    const { trainId, date, fromIndex, toIndex } = req.query;
    
    // Using journeyDate to match the database schema
    let seats = await Seat.find({ trainId, journeyDate: date });

    // 👇 THE FIX: Convert to plain object AND map _id to id for React!
    let processedSeats = seats.map((s) => ({
      ...s.toObject(),
      id: s._id.toString() 
    }));

    // ⚡ THE SMART UI OVERRIDE
    // (Check against 'undefined' string which happens sometimes in URL params)
    if (fromIndex !== undefined && toIndex !== undefined && fromIndex !== 'undefined' && toIndex !== 'undefined') {
      const userFrom = Number(fromIndex);
      const userTo = Number(toIndex);
      
      // Fetch all confirmed bookings for this train on this date
      const bookings = await Booking.find({ trainId, journeyDate: date, status: 'CONFIRMED' });

      processedSeats = processedSeats.map((seat) => {
        if (seat.status === 'BOOKED') {
          // Find all bookings that include this specific seat (Safe ObjectId comparison)
          const seatBookings = bookings.filter(b => 
            b.seatIds.some((id: any) => id.toString() === seat._id.toString()) // Keep checking against _id here
          );

          // Formula: Overlap happens if (ExistingStart < UserEnd) AND (ExistingEnd > UserStart)
          const hasOverlap = seatBookings.some(b => 
            (b.fromStationIndex < userTo) && (b.toStationIndex > userFrom)
          );

          // If there is NO overlap, the seat is visually AVAILABLE for this specific user!
          if (!hasOverlap) {
            return { ...seat, status: 'AVAILABLE' };
          }
        }
        return seat;
      });
    }

    // Group by coach for the UI
    const byCoach = processedSeats.reduce((acc: any, seat: any) => {
      if (!acc[seat.coach]) acc[seat.coach] = [];
      acc[seat.coach].push(seat);
      return acc;
    }, {});

    res.json({ seats: processedSeats, byCoach });
  } catch (err) {
    console.error('Seat fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch seats' });
  }
});

export default router;