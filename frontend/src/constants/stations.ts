export const STATIONS = [
  { id: "DEL", name: "Delhi", code: "DEL", index: 0 },
  { id: "AGR", name: "Agra", code: "AGR", index: 1 },
  { id: "GWL", name: "Gwalior", code: "GWL", index: 2 },
  { id: "JHS", name: "Jhansi", code: "JHS", index: 3 },
  { id: "BPL", name: "Bhopal", code: "BPL", index: 4 },
  { id: "IND", name: "Indore", code: "IND", index: 5 },
  { id: "BOM", name: "Mumbai", code: "BOM", index: 6 }
];

export const getStationIndex = (name: string) => {
  const station = STATIONS.find(s => s.name === name);
  return station ? station.index : -1;
};

export const SEAT_STATUS = {
  AVAILABLE: "AVAILABLE",
  LOCKED: "LOCKED",
  BOOKED: "BOOKED"
};