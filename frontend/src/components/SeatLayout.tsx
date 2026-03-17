import React, { useEffect, useState } from 'react';
import { Seat, SeatStatus } from '../types';
import { useSocket } from '../context/SocketContext';

interface SeatLayoutProps {
  seats: Seat[];
  selectedSeatIds: string[];
  socketId: string;
  onToggleSeat: (seat: Seat) => void;
}

const SeatLayout: React.FC<SeatLayoutProps> = ({ seats, selectedSeatIds, socketId, onToggleSeat }) => {
  const { socket } = useSocket();
  const [seatStates, setSeatStates] = useState<Seat[]>(seats);

  // Sync when seats prop changes (initial load)
  useEffect(() => {
    setSeatStates(seats);
  }, [seats]);

  // Real-time socket updates
  useEffect(() => {
    const handleStatusUpdate = ({ seatNumber, status, lockedBy }: { seatNumber: string; status: SeatStatus; lockedBy?: string }) => {
      setSeatStates((prev) =>
        prev.map((s) =>
          s.seatNumber === seatNumber
            ? { ...s, status, lockedBy: status === SeatStatus.AVAILABLE ? undefined : lockedBy }
            : s
        )
      );
    };

    // Feedback for this user's own lock/unlock actions
    const handleMyLock = ({ seatNumber }: { seatNumber: string }) => {
      setSeatStates((prev) =>
        prev.map((s) => s.seatNumber === seatNumber ? { ...s, status: SeatStatus.LOCKED, lockedBy: socketId } : s)
      );
    };

    const handleMyUnlock = ({ seatNumber }: { seatNumber: string }) => {
      setSeatStates((prev) =>
        prev.map((s) => s.seatNumber === seatNumber ? { ...s, status: SeatStatus.AVAILABLE, lockedBy: undefined } : s)
      );
    };

    socket.on('seat-status-update', handleStatusUpdate);
    socket.on('seat-locked', handleMyLock);
    socket.on('seat-unlocked', handleMyUnlock);

    return () => {
      socket.off('seat-status-update', handleStatusUpdate);
      socket.off('seat-locked', handleMyLock);
      socket.off('seat-unlocked', handleMyUnlock);
    };
  }, [socket, socketId]);

  const handleClick = (seat: Seat) => {
    if (seat.status === SeatStatus.BOOKED) return;
    if (seat.status === SeatStatus.LOCKED && seat.lockedBy !== socketId) return;
    onToggleSeat(seat);
  };

  const getSeatStyle = (seat: Seat): string => {
    const isSelected = selectedSeatIds.includes(seat.id);
    if (isSelected || (seat.status === SeatStatus.LOCKED && seat.lockedBy === socketId)) {
      return 'bg-primary-600 border-primary-500 text-white cursor-pointer hover:bg-primary-500';
    }
    switch (seat.status) {
      case SeatStatus.BOOKED:
        return 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed';
      case SeatStatus.LOCKED:
        return 'bg-yellow-500/30 border-yellow-500/50 text-yellow-300 cursor-not-allowed';
      default:
        return 'bg-slate-700 border-slate-600 text-slate-200 cursor-pointer hover:bg-slate-600 hover:border-slate-500';
    }
  };

  // Group by coach
  const byCoach = seatStates.reduce((acc, seat) => {
    if (!acc[seat.coachName]) acc[seat.coachName] = [];
    acc[seat.coachName].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  return (
    <div className="space-y-8">
      {Object.entries(byCoach).map(([coachName, coachSeats]) => (
        <div key={coachName} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-lg">Coach {coachName}</h3>
            <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-full">
              {coachSeats.filter((s) => s.status === SeatStatus.AVAILABLE).length} available
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {coachSeats.map((seat) => (
              <button
                key={seat.id}
                onClick={() => handleClick(seat)}
                title={`${seat.seatNumber} · ${seat.seatType} · ₹${seat.price}`}
                className={`p-2 rounded-lg border text-xs font-mono font-medium transition-all ${getSeatStyle(seat)}`}
              >
                {seat.seatNumber.split('-')[1]}
              </button>
            ))}
          </div>

          <div className="mt-3 flex gap-4 text-xs text-slate-500">
            <span>W = Window</span>
            <span>A = Aisle</span>
            <span>M = Middle</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SeatLayout;
