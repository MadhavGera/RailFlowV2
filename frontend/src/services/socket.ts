import { io, Socket } from 'socket.io-client';

// Vite proxy forwards /socket.io → backend:5000
const URL = import.meta.env.VITE_API_URL || window.location.origin;

export const socket: Socket = io(URL, {
  autoConnect: true,
  withCredentials: true,
});

export default socket;
