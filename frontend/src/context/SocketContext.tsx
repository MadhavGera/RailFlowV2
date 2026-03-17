import React, { createContext, useContext, useEffect, useState } from 'react';
import socket from '../services/socket';
import { Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket;
  socketId: string;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socketId, setSocketId] = useState<string>('');

  useEffect(() => {
    const onConnect = () => setSocketId(socket.id || '');
    socket.on('connect', onConnect);
    if (socket.connected) setSocketId(socket.id || '');
    return () => { socket.off('connect', onConnect); };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, socketId }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};
