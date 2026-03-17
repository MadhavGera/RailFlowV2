import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SeatLayout from '../components/SeatLayout';
import LoginModal from '../components/LoginModal';
import { Clock, CheckCircle, Loader2, Copy } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Seat, Train } from '../types';
import { toast } from 'react-toastify';
import api from '../services/api';

const useQuery = () => new URLSearchParams(useLocation().search);

const BookingPage: React.FC = () => {
  const { trainId } = useParams<{ trainId: string }>();
  const query = useQuery();
  const fromId = query.get('from') || '';
  const toId = query.get('to') || '';
  const date = query.get('date') || new Date().toISOString().split('T')[0];

  const navigate = useNavigate();
  const { socket, socketId } = useSocket();
  const { user } = useAuth();

  const [train, setTrain] = useState<Train | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(true);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmedPNR, setConfirmedPNR] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(600);

  // Load train + seats sequentially from API
  useEffect(() => {
    if (!trainId) return;
    const load = async () => {
      setLoadingSeats(true);
      try {
        // 1. Fetch train first to get the station array
        const trainData = await api.trains.getById(trainId);
        setTrain(trainData.train);

        // 2. Safely find the stations using either id or _id
        const fromStation = trainData.train.stations.find((s: any) => s.id === fromId || s._id === fromId);
        const toStation = trainData.train.stations.find((s: any) => s.id === toId || s._id === toId);

        // 3. Fetch seats dynamically using the exact route indexes
        const seatData = await api.seats.getByTrainAndDate(
          trainId, 
          date, 
          fromStation?.index, 
          toStation?.index
        );
        setSeats(seatData.seats);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load booking details');
      } finally {
        setLoadingSeats(false);
      }
    };
    load();
  }, [trainId, date, fromId, toId]);

  // Socket error listener
  useEffect(() => {
    socket.on('error', ({ message }: { message: string }) => toast.error(message));
    socket.on('seat-lock-failed', ({ seatNumber, message }: { seatNumber: string; message: string }) => {
      toast.warning(`Seat ${seatNumber}: ${message}`);
    });
    return () => {
      socket.off('error');
      socket.off('seat-lock-failed');
    };
  }, [socket]);

  // Countdown timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (selectedSeatIds.length > 0 && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (selectedSeatIds.length === 0) {
      setTimeLeft(600);
    }
    return () => clearInterval(timer);
  }, [selectedSeatIds.length, timeLeft]);

  // Timer expiry
  useEffect(() => {
    if (timeLeft === 0 && selectedSeatIds.length > 0) {
      selectedSeats.forEach((s) => {
        socket.emit('unlock-seat', { seatId: s.id, seatNumber: s.seatNumber, trainId, date });
      });
      setSelectedSeatIds([]);
      setSelectedSeats([]);
      toast.warning('Reservation timer expired. Seats released.');
      setTimeLeft(600);
    }
  }, [timeLeft]);

  const handleToggleSeat = (seat: Seat) => {
    const isSelected = selectedSeatIds.includes(seat.id);
    if (isSelected) {
      socket.emit('unlock-seat', { seatId: seat.id, seatNumber: seat.seatNumber, trainId, date });
      setSelectedSeatIds((prev) => prev.filter((id) => id !== seat.id));
      setSelectedSeats((prev) => prev.filter((s) => s.id !== seat.id));
    } else {
      socket.emit('lock-seat', { seatId: seat.id, seatNumber: seat.seatNumber, trainId, date });
      setSelectedSeatIds((prev) => [...prev, seat.id]);
      setSelectedSeats((prev) => [...prev, seat]);
    }
  };

  const handleConfirmBooking = async () => {
    if (!user) {
      toast.info('Please login to complete your booking');
      setIsLoginModalOpen(true);
      return;
    }
    if (!train || selectedSeatIds.length === 0) return;

    const fromStation = train.stations.find((s: any) => s.id === fromId || s._id === fromId);
    const toStation = train.stations.find((s: any) => s.id === toId || s._id === toId);

    if (!fromStation || !toStation) {
      toast.error('Invalid journey stations. Please go back and search again.');
      return;
    }

    setIsConfirming(true);
    try {
      const result = await api.bookings.confirm({
        seatIds: selectedSeatIds,
        socketId,
        trainId: trainId,
        trainName: train.trainName,
        trainNumber: train.trainNumber,
        journeyDate: date,
        fromStationId: fromStation.id || fromStation._id,
        fromStationIndex: fromStation.index,
        toStationId: toStation.id || toStation._id,
        toStationIndex: toStation.index,
      }) as any;

      // Broadcast BOOKED status to all clients via socket
      socket.emit('broadcast-booked', {
        seatNumbers: result.booking.seatNumbers,
        trainId: train.id,
        date,
      });

      setConfirmedPNR(result.booking.pnr);
      setSelectedSeatIds([]);
      setSelectedSeats([]);
    } catch (err: any) {
      toast.error(err.message || 'Booking failed. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  // --- SUCCESS SCREEN ---
  if (confirmedPNR) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/40">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
            <p className="text-slate-300 mb-6">
              Your seats have been successfully reserved, {user?.name}.
            </p>
            <div className="bg-slate-900/50 rounded-xl p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">PNR Number</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-mono font-bold text-lg">{confirmedPNR}</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(confirmedPNR); toast.success('PNR copied!'); }}
                    className="text-slate-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-sm">Train</span>
                <span className="text-white text-sm">{train?.trainName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-sm">Journey Date</span>
                <span className="text-white text-sm">{date}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/bookings')}
                className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-colors"
              >
                View My Bookings
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Seat Layout */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white">{train?.trainName}</h1>
                <p className="text-slate-400 text-sm">#{train?.trainNumber} · {date}</p>
              </div>
              {selectedSeatIds.length > 0 && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                  timeLeft < 120 ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}>
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                </div>
              )}
            </div>

            {loadingSeats ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
              </div>
            ) : (
              <SeatLayout
                seats={seats}
                selectedSeatIds={selectedSeatIds}
                socketId={socketId}
                onToggleSeat={handleToggleSeat}
              />
            )}
          </div>

          {/* Booking Summary */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 sticky top-24">
              <h2 className="font-bold text-white text-lg mb-4">Booking Summary</h2>

              {selectedSeats.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">Select seats from the layout to continue.</p>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {selectedSeats.map((s) => (
                      <div key={s.id} className="flex justify-between text-sm">
                        <span className="text-slate-300 font-mono">{s.seatNumber}</span>
                        <span className="text-white font-medium">₹{s.price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-700 pt-3 flex justify-between">
                    <span className="text-slate-300 font-medium">Total</span>
                    <span className="text-2xl font-bold text-green-400">₹{totalPrice}</span>
                  </div>
                  <button
                    onClick={handleConfirmBooking}
                    disabled={isConfirming}
                    className="w-full py-3 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isConfirming ? <><Loader2 className="w-4 h-4 animate-spin" /> Confirming...</> : 'Confirm Booking'}
                  </button>
                </div>
              )}

              {/* Legend */}
              <div className="mt-6 pt-4 border-t border-slate-700 space-y-2">
                {[
                  { color: 'bg-slate-700', label: 'Available' },
                  { color: 'bg-primary-600', label: 'Selected by you' },
                  { color: 'bg-yellow-500/60', label: 'Locked by others' },
                  { color: 'bg-slate-900', label: 'Booked' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2 text-xs text-slate-400">
                    <div className={`w-4 h-4 rounded ${color} border border-slate-600`} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
};

export default BookingPage;