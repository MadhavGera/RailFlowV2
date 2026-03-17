export interface Station {
  id: string;
  name: string;
  code: string;
  city: string;
  distanceFromStart: number;
  index: number;
}

export enum SeatStatus {
  AVAILABLE = 'AVAILABLE',
  LOCKED = 'LOCKED',
  BOOKED = 'BOOKED',
  SELECTED = 'SELECTED',
}

export interface Seat {
  id: string;
  coachName: string;
  seatNumber: string;
  seatType: 'WINDOW' | 'AISLE' | 'MIDDLE';
  price: number;
  status: SeatStatus;
  lockedBy?: string;
}

export interface Train {
  id: string;
  trainNumber: string;
  trainName: string;
  stations: Station[];
  departureTime: string;
  duration: string;
  basePrice: number;
  availableSeats: number;
}

export interface SmartRecommendation {
  boardFrom: Station;
  availableSeats: number;
  reason: string;
}

export interface TrainSearchResult {
  trainId: string;
  trainName: string;
  trainNumber: string;
  availableSeats: number;
  suggestion: SmartRecommendation | null;
}

export interface Booking {
  id: string;
  pnr: string;
  userId: string;
  trainId: string;
  trainName: string;
  trainNumber: string;
  seatNumbers: string[];
  journeyDate: string;
  fromStationId: string;
  toStationId: string;
  totalPrice: number;
  status: 'CONFIRMED' | 'CANCELLED';
  timestamp: number;
}
