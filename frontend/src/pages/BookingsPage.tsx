import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Booking } from '../types';
import { Train, Calendar, Ticket, Clock, XCircle, Search, ChevronDown, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const BookingsPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { socket } = useSocket();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      api.bookings.getMyBookings()
        .then((data) => setBookings(data.bookings))
        .catch((err) => toast.error(err.message))
        .finally(() => setLoading(false));
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const handleCancel = async (e: React.MouseEvent, booking: Booking) => {
    e.stopPropagation();
    if (!confirm('Cancel this booking? This cannot be undone.')) return;

    setCancellingId(booking.id);
    try {
      const result = await api.bookings.cancel(booking.id) as any;

      // Update local state
      setBookings((prev) => prev.map((b) => b.id === booking.id ? { ...b, status: 'CANCELLED' } : b));
      toast.success('Booking cancelled successfully');

      // Broadcast seat release to all connected clients
      socket.emit('broadcast-cancelled', {
        seatNumbers: result.releasedSeats,
        trainId: booking.trainId,
        date: booking.journeyDate,
      });
    } catch (err: any) {
      toast.error(err.message || 'Cancellation failed');
    } finally {
      setCancellingId(null);
    }
  };

  const toggleExpand = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const filtered = bookings
    .filter((b) => {
      const q = searchQuery.toLowerCase();
      return b.trainName.toLowerCase().includes(q) || b.pnr?.toLowerCase().includes(q) || b.id.toLowerCase().includes(q);
    })
    .sort((a, b) => sortOrder === 'desc' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <Ticket className="w-12 h-12 text-slate-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Please Login</h2>
          <p className="text-slate-400">You need to be logged in to view your bookings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Ticket className="w-8 h-8 text-primary-500" /> My Bookings
          </h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by train or PNR..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-lg border border-slate-700">
              {(['desc', 'asc'] as const).map((order) => (
                <button
                  key={order}
                  onClick={() => setSortOrder(order)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${sortOrder === order ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {order === 'desc' ? 'Newest' : 'Oldest'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center">
            <Train className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No bookings yet</h3>
            <p className="text-slate-400 mb-8">Start your journey by searching for trains.</p>
            <Link to="/" className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl transition-colors">
              Find Trains
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((booking) => {
              const expanded = expandedIds.has(booking.id);
              return (
                <div
                  key={booking.id}
                  onClick={() => toggleExpand(booking.id)}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all cursor-pointer group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-primary-500/10 p-2 rounded text-primary-400">
                          <Train className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">
                            {booking.trainName}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded">#{booking.trainNumber}</span>
                            {booking.pnr && (
                              <span className="text-xs text-primary-400 font-mono bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20">
                                PNR: {booking.pnr}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-slate-400">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{booking.journeyDate}</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4" />{new Date(booking.timestamp).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        booking.status === 'CONFIRMED'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {booking.status}
                      </span>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {expanded && (
                    <div className="mt-6 pt-6 border-t border-slate-700/50 flex flex-col md:flex-row justify-between items-start gap-6">
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 uppercase font-bold mb-3">Seats ({booking.seatNumbers?.length || 0})</p>
                        <div className="flex flex-wrap gap-2">
                          {(booking.seatNumbers || []).map((sn) => (
                            <span key={sn} className="bg-slate-700 text-white text-xs px-3 py-1.5 rounded-lg font-mono border border-slate-600">
                              {sn}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-4 min-w-[180px]">
                        <div className="text-right">
                          <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total</p>
                          <span className="text-3xl font-bold text-white">₹{booking.totalPrice}</span>
                        </div>
                        {booking.status === 'CONFIRMED' && (
                          <button
                            onClick={(e) => handleCancel(e, booking)}
                            disabled={cancellingId === booking.id}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-xl border border-red-500/20 transition-all disabled:opacity-50"
                          >
                            {cancellingId === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                            {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsPage;
