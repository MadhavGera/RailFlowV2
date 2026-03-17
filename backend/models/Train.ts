import mongoose, { Schema, Document } from 'mongoose';

export interface IStation {
  id: string;
  name: string;
  code: string;
  city: string;
  distanceFromStart: number;
  index: number;
}

export interface ICoach {
  coachName: string;
  totalSeats: number;
}

export interface ITrain extends Document {
  trainNumber: string;
  trainName: string;
  stations: IStation[];
  coaches: ICoach[];
  departureTime: string;
  duration: string;
  basePrice: number;
}

const StationSchema = new Schema<IStation>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  city: { type: String, required: true },
  distanceFromStart: { type: Number, required: true },
  index: { type: Number, required: true },
});

const CoachSchema = new Schema<ICoach>({
  coachName: { type: String, required: true },
  totalSeats: { type: Number, required: true },
});

const TrainSchema = new Schema<ITrain>(
  {
    trainNumber: { type: String, required: true, unique: true },
    trainName: { type: String, required: true },
    stations: [StationSchema],
    coaches: [CoachSchema],
    departureTime: { type: String, required: true },
    duration: { type: String, required: true },
    basePrice: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ITrain>('Train', TrainSchema);
