import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, TrendingUp, Train, Users, IndianRupee, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

type DashboardData = {
  revenueAnalytics: { _id: string; totalRevenue: number; totalTicketsSold: number; trainName: string; trainNumber: string }[];
  busiestRoutes: { fromStation: string; toStation: string; count: number }[];
  frequentFlyers: { email: string; name: string; trips: number; totalSpent: number }[];
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.admin.getDashboard();
        setData(response);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.role === 'admin') {
      fetchDashboard();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-red-400 bg-slate-800/50 border border-slate-700 rounded-xl p-5 text-center">
          <h2 className="text-2xl font-bold mb-2 text-white">Access Denied</h2>
          <p>You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-red-400 bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Calculate totals for stat cards
  const totalRevenue = data.revenueAnalytics.reduce((sum, item) => sum + item.totalRevenue, 0);
  const totalTickets = data.revenueAnalytics.reduce((sum, item) => sum + item.totalTicketsSold, 0);
  const activeUsers = data.frequentFlyers.length;

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition-all flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl text-white font-bold">Admin Analytics Dashboard</h1>
        </div>

        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 flex items-center space-x-4">
            <div className="p-3 bg-green-500/10 rounded-full">
              <IndianRupee className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total System Revenue</p>
              <h2 className="text-2xl text-white font-bold">₹{totalRevenue.toLocaleString()}</h2>
            </div>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 flex items-center space-x-4">
            <div className="p-3 bg-blue-500/10 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Tickets Sold</p>
              <h2 className="text-2xl text-white font-bold">{totalTickets}</h2>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 flex items-center space-x-4">
            <div className="p-3 bg-purple-500/10 rounded-full">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Top Active Users</p>
              <h2 className="text-2xl text-white font-bold">{activeUsers}</h2>
            </div>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Busiest Routes */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center space-x-2 mb-6">
              <Train className="w-5 h-5 text-indigo-400" />
              <h3 className="text-xl text-white font-bold">Busiest Routes</h3>
            </div>
            
            <div className="space-y-4">
              {data.busiestRoutes.map((route, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-800/80 p-4 rounded-lg border border-slate-700/50">
                  <div className="flex flex-col">
                    <span className="text-white font-medium">{route.fromStation} &rarr; {route.toStation}</span>
                    <span className="text-slate-500 text-sm mt-1">Total Bookings</span>
                  </div>
                  <span className="text-indigo-400 font-bold text-lg">{route.count}</span>
                </div>
              ))}
              {data.busiestRoutes.length === 0 && (
                <p className="text-slate-500 text-sm italic">No route data available.</p>
              )}
            </div>
          </div>

          {/* Right Column: Top Passengers */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center space-x-2 mb-6">
              <Users className="w-5 h-5 text-emerald-400" />
              <h3 className="text-xl text-white font-bold">Top Passengers</h3>
            </div>
            
            <div className="space-y-4">
              {data.frequentFlyers.map((user, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-800/80 p-4 rounded-lg border border-slate-700/50">
                  <div className="flex flex-col">
                    <span className="text-white font-medium">{user.name}</span>
                    <span className="text-slate-500 text-sm mt-1">{user.email}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-emerald-400 font-bold">₹{user.totalSpent.toLocaleString()}</span>
                    <span className="text-slate-500 text-sm">{user.trips} trips</span>
                  </div>
                </div>
              ))}
              {data.frequentFlyers.length === 0 && (
                <p className="text-slate-500 text-sm italic">No passenger data available.</p>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
