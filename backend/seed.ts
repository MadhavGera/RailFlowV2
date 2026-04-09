/**
 * Run with: npm run seed
 * Seeds MongoDB with trains + seat inventory for the next 30 days.
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Train from './models/Train.js';
import Seat from './models/Seat.js';
import { connectDB } from './config/db.js';

// Updated to match your frontend stations!
const STATIONS = [
  { id: 'DEL', name: 'Delhi',   code: 'DEL', city: 'Delhi',   distanceFromStart: 0,   index: 0 },
  { id: 'AGR', name: 'Agra',    code: 'AGR', city: 'Agra',    distanceFromStart: 195, index: 1 },
  { id: 'GWL', name: 'Gwalior', code: 'GWL', city: 'Gwalior', distanceFromStart: 315, index: 2 },
  { id: 'JHS', name: 'Jhansi',  code: 'JHS', city: 'Jhansi',  distanceFromStart: 412, index: 3 },
  { id: 'BPL', name: 'Bhopal',  code: 'BPL', city: 'Bhopal',  distanceFromStart: 704, index: 4 },
  { id: 'IND', name: 'Indore',  code: 'IND', city: 'Indore',  distanceFromStart: 900, index: 5 },
  { id: 'BOM', name: 'Mumbai',  code: 'BOM', city: 'Mumbai',  distanceFromStart: 1400, index: 6 }
];

const TRAIN_DEFS = [
  // --- FORWARD ROUTES ---
  {
    trainNumber: '12301',
    trainName:   'Rajdhani Express',
    stations:    STATIONS, // Delhi -> Mumbai
    coaches:     [{ coachName: 'A1', totalSeats: 20 }, { coachName: 'A2', totalSeats: 20 }, { coachName: 'B1', totalSeats: 20 }],
    departureTime: '16:55',
    duration:    '8h 20m',
    basePrice:   1500,
  },
  {
    trainNumber: '12418',
    trainName:   'Jhansi-Bhopal Express',
    stations:    STATIONS.slice(2, 6), // Gwalior -> Indore
    coaches:     [{ coachName: 'A1', totalSeats: 20 }, { coachName: 'A2', totalSeats: 20 }],
    departureTime: '21:30',
    duration:    '4h 45m',
    basePrice:   900,
  },

  // --- REVERSE ROUTES ---
  {
    trainNumber: '12302',
    trainName:   'Return Rajdhani Express',
    stations:    [...STATIONS].reverse().map((s, i) => ({ ...s, index: i })), // Mumbai -> Delhi
    coaches:     [{ coachName: 'A1', totalSeats: 20 }, { coachName: 'A2', totalSeats: 20 }, { coachName: 'B1', totalSeats: 20 }],
    departureTime: '08:00',
    duration:    '8h 20m',
    basePrice:   1500,
  },
  {
    trainNumber: '12419',
    trainName:   'Bhopal-Jhansi Express',
    stations:    [...STATIONS.slice(2, 6)].reverse().map((s, i) => ({ ...s, index: i })), // Indore -> Gwalior
    coaches:     [{ coachName: 'A1', totalSeats: 20 }, { coachName: 'A2', totalSeats: 20 }],
    departureTime: '06:30',
    duration:    '4h 45m',
    basePrice:   900,
  }
];

const getSeatType = (i: number): 'WINDOW' | 'AISLE' | 'MIDDLE' => {
  if (i % 3 === 1) return 'WINDOW';
  if (i % 3 === 0) return 'AISLE';
  return 'MIDDLE';
};

// Generate YYYY-MM-DD strings for next 30 days
const getNext30Days = (): string[] => {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
};

async function seed() {
  await connectDB();

  console.log('🌱 Clearing existing data...');
  await Train.deleteMany({});
  await Seat.deleteMany({});

  console.log('🚂 Inserting trains...');
  const insertedTrains = await Train.insertMany(TRAIN_DEFS);

  const dates = getNext30Days();
  const allSeats: object[] = [];

  for (const train of insertedTrains) {
    for (const date of dates) {
      for (const coach of train.coaches) {
        for (let i = 1; i <= coach.totalSeats; i++) {
          allSeats.push({
            trainId: train._id,
            journeyDate: date,
            coachName: coach.coachName,
            seatNumber: `${coach.coachName}-${i}`,
            seatType: getSeatType(i),
            price: train.basePrice,
            status: 'AVAILABLE',
          });
        }
      }
    }
  }

  console.log(`💺 Inserting ${allSeats.length} seats... This might take a few seconds!`);
  await Seat.insertMany(allSeats);

  console.log('✅ Seed complete!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});