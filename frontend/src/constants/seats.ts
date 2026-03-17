export const SEAT_STATUS = {
  AVAILABLE: "AVAILABLE",
  LOCKED: "LOCKED",
  BOOKED: "BOOKED"
};

export const COACH_LAYOUT = {
  Sleeper: 72,
  AC3: 64,
  AC2: 54
};

export const COACH_TYPES = [
  "Sleeper",
  "AC3",
  "AC2"
];

export const generateSeatNumbers = (total: number) => {
  return Array.from({ length: total }, (_, i) => i + 1);
};