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

// --- STATIONS POOL ---
const ALL_STATIONS = [
  { id: 'DEL', name: 'Delhi', code: 'DEL', city: 'Delhi', distanceFromStart: 0 },
  { id: 'AGR', name: 'Agra', code: 'AGR', city: 'Agra', distanceFromStart: 200 },
  { id: 'GWL', name: 'Gwalior', code: 'GWL', city: 'Gwalior', distanceFromStart: 320 },
  { id: 'JHS', name: 'Jhansi', code: 'JHS', city: 'Jhansi', distanceFromStart: 410 },
  { id: 'LKO', name: 'Lucknow', code: 'LKO', city: 'Lucknow', distanceFromStart: 500 },
  { id: 'BSB', name: 'Varanasi', code: 'BSB', city: 'Varanasi', distanceFromStart: 800 },
  { id: 'HWH', name: 'Kolkata', code: 'HWH', city: 'Kolkata', distanceFromStart: 1500 },
  { id: 'BPL', name: 'Bhopal', code: 'BPL', city: 'Bhopal', distanceFromStart: 1800 },
  { id: 'IND', name: 'Indore', code: 'IND', city: 'Indore', distanceFromStart: 2000 },
  { id: 'JP', name: 'Jaipur', code: 'JP', city: 'Jaipur', distanceFromStart: 2300 },
  { id: 'ADI', name: 'Ahmedabad', code: 'ADI', city: 'Ahmedabad', distanceFromStart: 2800 },
  { id: 'BOM', name: 'Mumbai', code: 'BOM', city: 'Mumbai', distanceFromStart: 3300 },
  { id: 'PUNE', name: 'Pune', code: 'PUNE', city: 'Pune', distanceFromStart: 3450 },
  { id: 'SBC', name: 'Bengaluru', code: 'SBC', city: 'Bengaluru', distanceFromStart: 4400 },
  { id: 'MAS', name: 'Chennai', code: 'MAS', city: 'Chennai', distanceFromStart: 4750 }
];

// Helper to attach indices to a route
const createRoute = (stations: any[]) => {
  return stations.map((s, idx) => ({ ...s, index: idx }));
};

// --- ROUTE DEFINITIONS ---

// Route 1: The Central/Western Line
const ROUTE_DEL_BOM = createRoute(ALL_STATIONS.filter(s => ['DEL', 'AGR', 'GWL', 'JHS', 'BPL', 'IND', 'BOM', 'PUNE'].includes(s.id)));

// Route 2: The Western Line
const ROUTE_WEST = createRoute(ALL_STATIONS.filter(s => ['DEL', 'JP', 'ADI', 'BOM'].includes(s.id)));

// Route 3: The Eastern Line
const ROUTE_EAST = createRoute(ALL_STATIONS.filter(s => ['DEL', 'LKO', 'BSB', 'HWH'].includes(s.id)));

// Route 4: The Southern Line
const ROUTE_SOUTH = createRoute(ALL_STATIONS.filter(s => ['BOM', 'SBC', 'MAS'].includes(s.id)));

// ALL-INDIA UNIVERSAL ROUTE (Ensures connectivity for EVERYTHING)
const ROUTE_UNIVERSAL = createRoute(ALL_STATIONS);
const ROUTE_UNIVERSAL_REV = createRoute([...ALL_STATIONS].reverse().map((s, i) => ({...s, distanceFromStart: i * 500})));

// --- TRAIN DEFINITIONS ---
const TRAIN_DEFS = [
  // Universal Connected Trains (Guarantee search results)
  {
    trainNumber: '00001',
    trainName: 'Bharat Universal Express',
    stations: ROUTE_UNIVERSAL,
    coaches: [{ coachName: 'A1', totalSeats: 25 }, { coachName: 'B1', totalSeats: 25 }, { coachName: 'S1', totalSeats: 25 }],
    departureTime: '00:05',
    duration: '72h 00m',
    basePrice: 2500,
  },
  {
    trainNumber: '00002',
    trainName: 'Bharat Universal Return',
    stations: ROUTE_UNIVERSAL_REV,
    coaches: [{ coachName: 'A1', totalSeats: 25 }, { coachName: 'B1', totalSeats: 25 }, { coachName: 'S1', totalSeats: 25 }],
    departureTime: '12:00',
    duration: '72h 00m',
    basePrice: 2500,
  },

  // Original & Specific Trains
  {
    trainNumber: '12301',
    trainName: 'Rajdhani Express',
    stations: ROUTE_DEL_BOM.slice(0, 7),
    coaches: [{ coachName: 'A1', totalSeats: 20 }, { coachName: 'A2', totalSeats: 20 }, { coachName: 'B1', totalSeats: 20 }],
    departureTime: '16:55',
    duration: '8h 20m',
    basePrice: 1500,
  },
  {
    trainNumber: '12418',
    trainName: 'Jhansi-Bhopal Express',
    stations: ROUTE_DEL_BOM.slice(2, 6),
    coaches: [{ coachName: 'A1', totalSeats: 20 }, { coachName: 'A2', totalSeats: 20 }],
    departureTime: '21:30',
    duration: '4h 45m',
    basePrice: 900,
  },
  {
    trainNumber: '12002',
    trainName: 'Shatabdi Express',
    stations: ROUTE_DEL_BOM.slice(0, 4),
    coaches: [{ coachName: 'C1', totalSeats: 30 }, { coachName: 'C2', totalSeats: 30 }],
    departureTime: '06:00',
    duration: '4h 10m',
    basePrice: 1200,
  },
  {
    trainNumber: '12123',
    trainName: 'Deccan Queen',
    stations: ROUTE_DEL_BOM.slice(6, 8),
    coaches: [{ coachName: 'D1', totalSeats: 40 }],
    departureTime: '17:10',
    duration: '3h 15m',
    basePrice: 450,
  },
  {
    trainNumber: '12916',
    trainName: 'Ashram Express',
    stations: ROUTE_WEST,
    coaches: [{ coachName: 'S1', totalSeats: 20 }, { coachName: 'S2', totalSeats: 20 }, { coachName: 'B1', totalSeats: 15 }],
    departureTime: '15:20',
    duration: '16h 40m',
    basePrice: 1350,
  },
  {
    trainNumber: '12382',
    trainName: 'Poorva Express',
    stations: ROUTE_EAST,
    coaches: [{ coachName: 'A1', totalSeats: 25 }, { coachName: 'B1', totalSeats: 25 }],
    departureTime: '17:40',
    duration: '22h 15m',
    basePrice: 1800,
  },
  {
    trainNumber: '11301',
    trainName: 'Udyan Express',
    stations: ROUTE_SOUTH,
    coaches: [{ coachName: 'B1', totalSeats: 20 }, { coachName: 'B2', totalSeats: 20 }, { coachName: 'S1', totalSeats: 30 }],
    departureTime: '08:10',
    duration: '24h 00m',
    basePrice: 2100,
  }
];

const getSeatType = (i: number): 'WINDOW' | 'AISLE' | 'MIDDLE' => {
  if (i % 3 === 1) return 'WINDOW';
  if (i % 3 === 0) return 'AISLE';
  return 'MIDDLE';
};

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