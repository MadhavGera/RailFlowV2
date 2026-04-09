import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Search, ArrowRightLeft } from 'lucide-react';
import { STATIONS } from '../constants';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const SearchWidget: React.FC = () => {
  const navigate = useNavigate();
  const [from, setFrom] = useState(STATIONS[0].id);
  const [to, setTo] = useState(STATIONS[4].id);
  
  // Custom Dropdown State
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);
  
  // Refs for clicking outside to close
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fromRef.current && !fromRef.current.contains(event.target as Node)) {
        setIsFromOpen(false);
      }
      if (toRef.current && !toRef.current.contains(event.target as Node)) {
        setIsToOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          <div ref={fromRef} className="flex-1 w-full relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MapPin className={`h-5 w-5 transition-colors ${isFromOpen ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'}`} />
            </div>
            
            {/* Custom Input Trigger */}
            <div
              onClick={() => {
                setIsFromOpen(!isFromOpen);
                setIsToOpen(false); // Close the other dropdown safely
              }}
              className="block w-full h-[58px] pl-12 pr-4 py-4 bg-slate-800/50 md:bg-transparent border border-slate-600 md:border-transparent rounded-xl md:rounded-l-full text-white cursor-pointer hover:bg-slate-800/80 md:hover:bg-transparent transition-colors flex items-center"
            >
              <span className="truncate">
                {STATIONS.find((s) => s.id === from)?.name} ({from})
              </span>
            </div>
            
            <label className="md:hidden absolute -top-2.5 left-4 bg-slate-900 px-2 text-xs text-blue-400 font-medium rounded">
              From
            </label>

            {/* Dropdown Menu */}
            {isFromOpen && (
              <ul className="absolute top-full left-0 mt-2 w-full min-w-[240px] z-50 bg-slate-800 rounded-xl border border-slate-600 max-h-60 overflow-y-auto shadow-2xl shadow-black/50 custom-scrollbar py-2">
                {STATIONS.map((s) => (
                  <li
                    key={s.id}
                    onClick={() => {
                      setFrom(s.id);
                      setIsFromOpen(false);
                    }}
                    className={`px-4 py-3 cursor-pointer transition-colors ${from === s.id ? 'bg-blue-600/20 text-blue-400 font-medium' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                  >
                    {s.name} <span className="text-slate-500 text-sm ml-1">({s.code})</span>
                  </li>
                ))}
              </ul>
            )}
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
          <div ref={toRef} className="flex-1 w-full relative group">
            <div className="absolute inset-y-0 left-0 pl-4 md:pl-8 flex items-center pointer-events-none">
              <MapPin className={`h-5 w-5 transition-colors ${isToOpen ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'}`} />
            </div>

            {/* Custom Input Trigger */}
            <div
              onClick={() => {
                setIsToOpen(!isToOpen);
                setIsFromOpen(false);
              }}
              className="block w-full h-[58px] pl-12 md:pl-16 pr-4 py-4 bg-slate-800/50 md:bg-transparent border border-slate-600 md:border-transparent md:border-l md:border-slate-700/50 md:rounded-none rounded-xl text-white cursor-pointer hover:bg-slate-800/80 md:hover:bg-transparent transition-colors flex items-center"
            >
              <span className="truncate">
                {STATIONS.find((s) => s.id === to)?.name} ({to})
              </span>
            </div>

            <label className="md:hidden absolute -top-2.5 left-4 bg-slate-900 px-2 text-xs text-blue-400 font-medium rounded">
              To
            </label>

            {/* Dropdown Menu */}
            {isToOpen && (
              <ul className="absolute top-full left-0 mt-2 w-full min-w-[240px] z-50 bg-slate-800 rounded-xl border border-slate-600 max-h-60 overflow-y-auto shadow-2xl shadow-black/50 custom-scrollbar py-2">
                {STATIONS.map((s) => (
                  <li
                    key={s.id}
                    onClick={() => {
                      setTo(s.id);
                      setIsToOpen(false);
                    }}
                    className={`px-4 py-3 cursor-pointer transition-colors ${to === s.id ? 'bg-blue-600/20 text-blue-400 font-medium' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                  >
                    {s.name} <span className="text-slate-500 text-sm ml-1">({s.code})</span>
                  </li>
                ))}
              </ul>
            )}
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
              className="relative block w-full h-[58px] pl-12 pr-4 py-4 bg-slate-800/50 md:bg-transparent border border-slate-600 md:border-transparent rounded-xl text-white focus:outline-none hover:bg-slate-800/80 md:hover:bg-transparent transition-colors cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:z-20"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full md:w-auto h-[58px] md:px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-bold rounded-xl md:rounded-full shadow-[0_0_20px_-5px_rgba(59,130,246,0.4)] transform transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 flex-shrink-0 md:ml-2"
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