import mongoose, { Schema, Document } from 'mongoose';

export type SeatType = 'WINDOW' | 'AISLE' | 'MIDDLE';
export type SeatStatus = 'AVAILABLE' | 'LOCKED' | 'BOOKED';

export interface ISeat extends Document {
  trainId: mongoose.Types.ObjectId;
  journeyDate: string; // 'YYYY-MM-DD'
  coachName: string;
  seatNumber: string; // e.g. 'A1-5'
  seatType: SeatType;
  price: number;
  status: SeatStatus;
}

const SeatSchema = new Schema<ISeat>(
  {
    trainId: { type: Schema.Types.ObjectId, ref: 'Train', required: true },
    journeyDate: { type: String, required: true },
    coachName: { type: String, required: true },
    seatNumber: { type: String, required: true },
    seatType: { type: String, enum: ['WINDOW', 'AISLE', 'MIDDLE'], required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ['AVAILABLE', 'LOCKED', 'BOOKED'], default: 'AVAILABLE' },
  },
  { timestamps: true }
);

// Compound index: a seat is unique per train + date + coach + number
SeatSchema.index({ trainId: 1, journeyDate: 1, coachName: 1, seatNumber: 1 }, { unique: true });

// Fast lookup for seat availability queries
SeatSchema.index({ trainId: 1, journeyDate: 1, status: 1 });

export default mongoose.model<ISeat>('Seat', SeatSchema);
