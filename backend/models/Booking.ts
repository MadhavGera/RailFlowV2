import mongoose, { Schema, Document } from 'mongoose';

export type BookingStatus = 'CONFIRMED' | 'CANCELLED';

export interface IBooking extends Document {
  pnr: string;
  userId: string; // user email
  trainId: mongoose.Types.ObjectId;
  trainName: string;
  trainNumber: string;
  seatIds: mongoose.Types.ObjectId[];
  seatNumbers: string[];
  journeyDate: string;
  fromStationId: string;
  fromStationIndex: number;
  toStationId: string;
  toStationIndex: number;
  totalPrice: number;
  status: BookingStatus;
  timestamp: number;
}

const BookingSchema = new Schema<IBooking>(
  {
    pnr: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    trainId: { type: Schema.Types.ObjectId, ref: 'Train', required: true },
    trainName: { type: String, required: true },
    trainNumber: { type: String, required: true },
    seatIds: [{ type: Schema.Types.ObjectId, ref: 'Seat' }],
    seatNumbers: [{ type: String }],
    journeyDate: { type: String, required: true },
    fromStationId: { type: String, required: true },
    fromStationIndex: { type: Number, required: true },
    toStationId: { type: String, required: true },
    toStationIndex: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['CONFIRMED', 'CANCELLED'], default: 'CONFIRMED' },
    timestamp: { type: Number, default: () => Date.now() },
  },
  { timestamps: true }
);

// Index for smart boarding query: find bookings that overlap a segment
BookingSchema.index({ trainId: 1, journeyDate: 1, fromStationIndex: 1, toStationIndex: 1 });

// Index for user bookings lookup
BookingSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model<IBooking>('Booking', BookingSchema);
