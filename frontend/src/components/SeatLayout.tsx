import React, { useEffect, useState } from 'react';
import { Seat, SeatStatus } from '../types';
import { useSocket } from '../context/SocketContext';

interface SeatLayoutProps {
  seats: Seat[];
  selectedSeatIds: string[];
  socketId: string;
  onToggleSeat: (seat: Seat) => void;
}

const getSeatCode = (type: string): string => {
  const t = type.toUpperCase();
  if (t.includes('WINDOW')) return 'W';
  if (t.includes('AISLE')) return 'A';
  if (t.includes('SIDE_LOWER') || t.includes('SIDE LOWER') || t.includes('SIDELOWER')) return 'SL';
  if (t.includes('LOWER')) return 'LB';
  if (t.includes('MIDDLE')) return 'MB';
  if (t.includes('UPPER')) return 'UB';
  return t.substring(0, 2);
};

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

    if (socket) {
      socket.on('seat-status-update', handleStatusUpdate);
      socket.on('seat-locked', handleMyLock);
      socket.on('seat-unlocked', handleMyUnlock);

      return () => {
        socket.off('seat-status-update', handleStatusUpdate);
        socket.off('seat-locked', handleMyLock);
        socket.off('seat-unlocked', handleMyUnlock);
      };
    }
  }, [socket, socketId]);

  const handleClick = (seat: Seat) => {
    if (seat.status === SeatStatus.BOOKED) return;
    if (seat.status === SeatStatus.LOCKED && seat.lockedBy !== socketId) return;
    onToggleSeat(seat);
  };

  const isSelectedSeat = (seat: Seat) => {
    return selectedSeatIds.includes(seat.id) || (seat.status === SeatStatus.LOCKED && seat.lockedBy === socketId);
  };

  const getSeatStyle = (seat: Seat): string => {
    if (isSelectedSeat(seat)) {
      return 'bg-blue-600 border-blue-500 text-white cursor-pointer hover:bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105';
    }
    switch (seat.status) {
      case SeatStatus.BOOKED:
        return 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed';
      case SeatStatus.LOCKED:
        return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400 cursor-not-allowed';
      default:
        return 'bg-slate-700 border-slate-600 text-slate-200 cursor-pointer hover:bg-slate-600 hover:border-slate-500 hover:-translate-y-0.5';
    }
  };

  const getSeatCodeColor = (seat: Seat): string => {
    if (isSelectedSeat(seat)) return 'text-white';
    if (seat.status === SeatStatus.AVAILABLE) return 'text-slate-400';
    return 'text-slate-500';
  };

  // Group by coach
  const byCoach = seatStates.reduce((acc, seat) => {
    if (!acc[seat.coachName]) acc[seat.coachName] = [];
    acc[seat.coachName].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  return (
    <div className="space-y-8">
      {Object.entries(byCoach).map(([coachName, coachSeats]) => {
        // Chunk seats into rows of 5 to structure our aisles naturally
        const rows = [];
        for (let i = 0; i < coachSeats.length; i += 5) {
          rows.push(coachSeats.slice(i, i + 5));
        }

        return (
          <div key={coachName} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-white text-xl">
                Coach <span className="text-blue-400">{coachName}</span>
              </h3>
              <span className="text-sm font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full shadow-inner">
                {coachSeats.filter((s) => s.status === SeatStatus.AVAILABLE).length} Available
              </span>
            </div>

            {/* Structured Seat Grid */}
            <div className="flex flex-col gap-3 overflow-x-auto pb-6 items-center">
              {rows.map((row, rIdx) => (
                <div 
                  key={rIdx} 
                  className={`flex gap-3 justify-center ${rIdx % 2 === 1 && rIdx !== rows.length - 1 ? 'mb-6' : ''}`}
                >
                  {row.map((seat, cIdx) => (
                    <button
                      key={seat.id}
                      onClick={() => handleClick(seat)}
                      title={`Seat ${seat.seatNumber.split('-')[1]} • ${seat.seatType} • ₹${seat.price}`}
                      className={`relative w-14 h-14 flex flex-col items-center justify-center rounded-xl border transition-all duration-300 ${getSeatStyle(seat)} ${cIdx === 2 ? 'mr-12' : ''}`}
                    >
                      <span className="font-mono font-bold text-sm tracking-tight mb-0.5">
                        {seat.seatNumber.split('-')[1]}
                      </span>
                      <span className={`text-[10px] font-bold opacity-80 ${getSeatCodeColor(seat)}`}>
                        {getSeatCode(seat.seatType)}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {/* Expanded Legend */}
            <div className="mt-4 pt-6 border-t border-slate-700/50 flex flex-col gap-4">
              
              {/* Status Legend */}
              <div className="flex flex-wrap gap-4 justify-center text-sm text-slate-400">
                <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-700 border border-slate-600"></div> Available</span>
                <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-600 border border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div> Selected</span>
                <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-800"></div> Booked</span>
                <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40"></div> Locked/Pending</span>
              </div>

              {/* Type Legend */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center text-sm text-slate-400">
                <span className="flex items-center gap-1"><span className="text-white font-bold bg-slate-700 px-1.5 py-0.5 rounded text-xs">W</span> - Window</span>
                <span className="flex items-center gap-1"><span className="text-white font-bold bg-slate-700 px-1.5 py-0.5 rounded text-xs">A</span> - Aisle</span>
                <span className="flex items-center gap-1"><span className="text-white font-bold bg-slate-700 px-1.5 py-0.5 rounded text-xs">MB</span> - Middle Berth</span>
                <span className="flex items-center gap-1"><span className="text-white font-bold bg-slate-700 px-1.5 py-0.5 rounded text-xs">LB</span> - Lower Berth</span>
                <span className="flex items-center gap-1"><span className="text-white font-bold bg-slate-700 px-1.5 py-0.5 rounded text-xs">UB</span> - Upper Berth</span>
                <span className="flex items-center gap-1"><span className="text-white font-bold bg-slate-700 px-1.5 py-0.5 rounded text-xs">SL</span> - Side Lower</span>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SeatLayout;
