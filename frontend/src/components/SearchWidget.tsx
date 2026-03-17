import React, { useState } from 'react';
import { Calendar, MapPin, Search } from 'lucide-react';
import { STATIONS } from '../constants';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const SearchWidget: React.FC = () => {
  const navigate = useNavigate();
  const [from, setFrom] = useState(STATIONS[0].id);
  const [to, setTo] = useState(STATIONS[4].id);
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (from === to) {
      toast.error("Source and Destination stations cannot be the same.");
      return;
    }

    navigate(`/trains?from=${from}&to=${to}&date=${date}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto -mt-24 relative z-20 px-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">

          {/* From Station */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
            </div>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="block w-full pl-10 pr-4 py-4 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
            >
              {STATIONS.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-800">
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
            <label className="absolute -top-2.5 left-4 bg-[#0f172a] px-2 text-xs text-primary-400 font-medium rounded">
              From Station
            </label>
          </div>

          {/* To Station */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
            </div>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="block w-full pl-10 pr-4 py-4 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
            >
              {STATIONS.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-800">
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
            <label className="absolute -top-2.5 left-4 bg-[#0f172a] px-2 text-xs text-primary-400 font-medium rounded">
              To Station
            </label>
          </div>

          {/* Date */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="block w-full pl-10 pr-4 py-3.5 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
            />
            <label className="absolute -top-2.5 left-4 bg-[#0f172a] px-2 text-xs text-primary-400 font-medium rounded">
              Journey Date
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Search Trains
          </button>

        </form>
      </div>
    </div>
  );
};

export default SearchWidget;