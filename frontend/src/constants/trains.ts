import { STATIONS } from "./stations";

export const generateTrains = () => {
  const trains = [];

  for (let i = 0; i < 30; i++) {
    trains.push({
      id: `TR${1000 + i}`,
      trainNumber: `${12000 + i}`,
      trainName: `Express ${i + 1}`,
      departureTime: `${6 + (i % 10)}:00`,
      duration: `${4 + (i % 6)}h ${10 + (i % 40)}m`,
      basePrice: 500 + Math.floor(Math.random() * 500),
      availableSeats: 10 + Math.floor(Math.random() * 60),
      stations: STATIONS
    });
  }

  return trains;
};

export const TRAINS = generateTrains();