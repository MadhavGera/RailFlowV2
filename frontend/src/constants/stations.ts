export const STATIONS = [
  // Original Route
  { id: "DEL", name: "Delhi", code: "DEL", index: 0 },
  { id: "AGR", name: "Agra", code: "AGR", index: 1 },
  { id: "GWL", name: "Gwalior", code: "GWL", index: 2 },
  { id: "JHS", name: "Jhansi", code: "JHS", index: 3 },
  { id: "BPL", name: "Bhopal", code: "BPL", index: 4 },
  { id: "IND", name: "Indore", code: "IND", index: 5 },
  { id: "BOM", name: "Mumbai", code: "BOM", index: 6 },
  { id: "PUNE", name: "Pune", code: "PUNE", index: 7 },
  
  // Western Route
  { id: "JP", name: "Jaipur", code: "JP", index: 8 },
  { id: "ADI", name: "Ahmedabad", code: "ADI", index: 9 },
  
  // Eastern Route
  { id: "LKO", name: "Lucknow", code: "LKO", index: 10 },
  { id: "BSB", name: "Varanasi", code: "BSB", index: 11 },
  { id: "HWH", name: "Kolkata", code: "HWH", index: 12 },
  
  // Southern Route
  { id: "SBC", name: "Bengaluru", code: "SBC", index: 13 },
  { id: "MAS", name: "Chennai", code: "MAS", index: 14 }
];

export const getStationIndex = (name: string) => {
  const station = STATIONS.find(s => s.name === name || s.id === name || s.code === name);
  return station ? station.index : -1;
};

export const SEAT_STATUS = {
  AVAILABLE: "AVAILABLE",
  LOCKED: "LOCKED",
  BOOKED: "BOOKED"
};