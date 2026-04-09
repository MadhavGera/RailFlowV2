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
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  
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

  const filteredFromStations = STATIONS.filter(s => 
    s.name.toLowerCase().includes(fromSearch.toLowerCase()) || 
    s.code.toLowerCase().includes(fromSearch.toLowerCase())
  );

  const filteredToStations = STATIONS.filter(s => 
    s.name.toLowerCase().includes(toSearch.toLowerCase()) || 
    s.code.toLowerCase().includes(toSearch.toLowerCase())
  );

  return (
    <div className="w-full max-w-5xl mx-auto -mt-16 md:-mt-12 relative z-20 px-4">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl md:rounded-full p-3 md:p-4 shadow-[0_0_40px_-15px_rgba(59,130,246,0.3)]">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center relative h-full">
          
          {/* From Station */}
          <div ref={fromRef} className="flex-1 w-full relative group min-w-0">
            <div
              onClick={() => {
                setIsFromOpen(!isFromOpen);
                setIsToOpen(false);
                setFromSearch('');
              }}
              className="w-full h-[64px] px-6 bg-slate-800/50 md:bg-transparent border border-slate-600 md:border-transparent rounded-2xl md:rounded-l-full text-white cursor-pointer hover:bg-slate-800/80 md:hover:bg-slate-800/30 transition-all flex items-center justify-center gap-3"
            >
              <MapPin className={`h-5 w-5 flex-shrink-0 transition-colors ${isFromOpen ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'}`} />
              <span className="truncate font-medium text-lg">
                {STATIONS.find((s) => s.id === from)?.name} ({from})
              </span>
            </div>
            
            <label className="md:hidden absolute -top-2.5 left-4 bg-slate-900 px-2 text-xs text-blue-400 font-medium rounded">
              From
            </label>

            {/* Dropdown Menu */}
            {isFromOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-full min-w-[300px] z-50 bg-slate-800 rounded-2xl border border-slate-600 shadow-2xl shadow-black/50 overflow-hidden">
                <div className="p-2 border-b border-slate-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search departure station..."
                      value={fromSearch}
                      onChange={(e) => setFromSearch(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
                <ul className="max-h-60 overflow-y-auto custom-scrollbar py-1">
                  {filteredFromStations.length > 0 ? (
                    filteredFromStations.map((s) => (
                      <li
                        key={s.id}
                        onClick={() => {
                          setFrom(s.id);
                          setIsFromOpen(false);
                        }}
                        className={`px-4 py-3 cursor-pointer transition-colors flex items-center justify-between ${from === s.id ? 'bg-blue-600/20 text-blue-400 font-medium' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                      >
                        <span>{s.name}</span>
                        <span className="text-slate-500 text-xs font-mono uppercase bg-slate-900/50 px-2 py-0.5 rounded border border-slate-700/50">{s.code}</span>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-8 text-center text-slate-500 text-sm italic">No stations found</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="relative z-30 -my-2 md:my-0">
            <button
              type="button"
              onClick={handleSwap}
              className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white rounded-full transition-all duration-300 shadow-lg flex-shrink-0 rotate-90 md:rotate-0 hover:scale-110 active:scale-95"
              title="Swap stations"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>
          </div>

          {/* To Station */}
          <div ref={toRef} className="flex-1 w-full relative group min-w-0">
            <div
              onClick={() => {
                setIsToOpen(!isToOpen);
                setIsFromOpen(false);
                setToSearch('');
              }}
              className="w-full h-[64px] px-6 bg-slate-800/50 md:bg-transparent border border-slate-600 md:border-transparent rounded-2xl text-white cursor-pointer hover:bg-slate-800/80 md:hover:bg-slate-800/30 transition-all flex items-center justify-center gap-3"
            >
              <MapPin className={`h-5 w-5 flex-shrink-0 transition-colors ${isToOpen ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'}`} />
              <span className="truncate font-medium text-lg">
                {STATIONS.find((s) => s.id === to)?.name} ({to})
              </span>
            </div>

            <label className="md:hidden absolute -top-2.5 left-4 bg-slate-900 px-2 text-xs text-blue-400 font-medium rounded">
              To
            </label>

            {/* Dropdown Menu */}
            {isToOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-full min-w-[300px] z-50 bg-slate-800 rounded-2xl border border-slate-600 shadow-2xl shadow-black/50 overflow-hidden">
                <div className="p-2 border-b border-slate-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search arrival station..."
                      value={toSearch}
                      onChange={(e) => setToSearch(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
                <ul className="max-h-60 overflow-y-auto custom-scrollbar py-1">
                  {filteredToStations.length > 0 ? (
                    filteredToStations.map((s) => (
                      <li
                        key={s.id}
                        onClick={() => {
                          setTo(s.id);
                          setIsToOpen(false);
                        }}
                        className={`px-4 py-3 cursor-pointer transition-colors flex items-center justify-between ${to === s.id ? 'bg-blue-600/20 text-blue-400 font-medium' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                      >
                        <span>{s.name}</span>
                        <span className="text-slate-500 text-xs font-mono uppercase bg-slate-900/50 px-2 py-0.5 rounded border border-slate-700/50">{s.code}</span>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-8 text-center text-slate-500 text-sm italic">No stations found</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-10 bg-slate-700/50 mx-2"></div>

          {/* Date */}
          <div className="flex-1 w-full relative group min-w-0">
            <div className="w-full h-[64px] px-6 bg-slate-800/50 md:bg-transparent border border-slate-600 md:border-transparent rounded-2xl text-white hover:bg-slate-800/80 md:hover:bg-slate-800/30 transition-all flex items-center justify-center gap-3 cursor-pointer">
              <Calendar className="h-5 w-5 text-slate-300 group-hover:text-blue-400 transition-colors" />
              <span className="font-medium text-lg">
                {new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              </span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="w-full md:w-auto p-1">
            <button
              type="submit"
              className="w-full md:w-auto h-[56px] px-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl md:rounded-full shadow-lg shadow-blue-900/20 transform transition-all hover:scale-[1.05] active:scale-95 flex items-center justify-center gap-3"
            >
              <Search className="w-5 h-5" />
              <span>Search</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SearchWidget;