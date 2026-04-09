import React, { useState } from 'react';
import { Calendar, MapPin, Search, ArrowRightLeft } from 'lucide-react';
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

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="w-full max-w-5xl mx-auto -mt-16 md:-mt-12 relative z-20 px-4">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl md:rounded-full p-3 md:p-4 shadow-[0_0_40px_-15px_rgba(59,130,246,0.3)]">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-2 md:gap-0 relative">
          
          {/* From Station */}
          <div className="flex-1 w-full relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 bg-slate-800/50 md:bg-transparent border border-slate-600 md:border-transparent rounded-xl md:rounded-l-full text-white appearance-none cursor-pointer focus:outline-none hover:bg-slate-800/80 md:hover:bg-transparent transition-colors"
            >
              {STATIONS.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-800">
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
            <label className="md:hidden absolute -top-2.5 left-4 bg-slate-900 px-2 text-xs text-blue-400 font-medium rounded">From</label>
          </div>

          {/* Swap Button */}
          <button
            type="button"
            onClick={handleSwap}
            className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white rounded-full transition-all duration-300 shadow-md flex-shrink-0 z-10 md:-mx-5 rotate-90 md:rotate-0"
            title="Swap stations"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </button>

          {/* To Station */}
          <div className="flex-1 w-full relative group">
            <div className="absolute inset-y-0 left-0 pl-4 md:pl-8 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="block w-full pl-12 md:pl-16 pr-4 py-4 bg-slate-800/50 md:bg-transparent border border-slate-600 md:border-transparent md:border-l md:border-slate-700/50 md:rounded-none rounded-xl text-white appearance-none cursor-pointer focus:outline-none hover:bg-slate-800/80 md:hover:bg-transparent transition-colors"
            >
              {STATIONS.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-800">
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
            <label className="md:hidden absolute -top-2.5 left-4 bg-slate-900 px-2 text-xs text-blue-400 font-medium rounded">To</label>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-10 bg-slate-700/50"></div>

          {/* Date */}
          <div className="flex-1 w-full relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <Calendar className="h-5 w-5 text-slate-300 group-hover:text-blue-400 group-focus-within:text-blue-400 transition-colors" />
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="relative block w-full pl-12 pr-4 py-4 bg-slate-800/50 md:bg-transparent border border-slate-600 md:border-transparent rounded-xl text-white focus:outline-none hover:bg-slate-800/80 md:hover:bg-transparent transition-colors cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:z-20"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full md:w-auto md:px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-bold rounded-xl md:rounded-full shadow-[0_0_20px_-5px_rgba(59,130,246,0.4)] transform transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 flex-shrink-0 md:ml-2"
          >
            <Search className="w-5 h-5" />
            <span className="md:hidden lg:inline">Search</span>
          </button>

        </form>
      </div>
    </div>
  );
};

export default SearchWidget;