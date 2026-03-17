import React from 'react';
import { Train, TrainSearchResult } from '../types';
import { ArrowRight, Clock, Zap, Train as TrainIcon, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TrainCardProps {
  train: Train;
  smartResult: TrainSearchResult | null;
  fromId: string;
  toId: string;
  date: string;
}

const TrainCard: React.FC<TrainCardProps> = ({ train, smartResult, fromId, toId, date }) => {
  const suggestion = smartResult?.suggestion;
  const isFullWithSuggestion = smartResult?.availableSeats === 0 && suggestion;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-primary-500/50 transition-all shadow-lg group">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        {/* Train Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-slate-700 p-2 rounded text-primary-400">
              <TrainIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors">
                {train.trainName}
              </h3>
              <span className="text-xs text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded">
                #{train.trainNumber}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-300 mt-2">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white">{train.departureTime}</span>
              <span className="text-xs text-slate-500">Departure</span>
            </div>
            <div className="flex flex-col items-center px-2">
              <span className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {train.duration}
              </span>
              <div className="w-16 h-0.5 bg-slate-600 relative">
                <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-slate-500" />
                <div className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-slate-500" />
              </div>
            </div>
          </div>

          {/* Available seats pill */}
          <div className="mt-3 flex items-center gap-2">
            <div className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${
              train.availableSeats > 10
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : train.availableSeats > 0
                ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              <Users className="w-3 h-3" />
              {train.availableSeats > 0 ? `${train.availableSeats} seats available` : 'Fully Booked'}
            </div>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex flex-col items-end gap-3 min-w-[160px]">
          <div className="text-right">
            <span className="text-2xl font-bold text-green-400">₹{train.basePrice}</span>
            <p className="text-xs text-slate-400">per person</p>
          </div>

          {isFullWithSuggestion ? (
            <div className="w-full space-y-2">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-2">
                <Zap className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-yellow-400 uppercase tracking-wide">Smart Recommendation</p>
                  <p className="text-xs text-yellow-200 mt-1 leading-snug">
                    Board from <span className="font-bold text-white">{suggestion!.boardFrom.name}</span> — {suggestion!.availableSeats} seats available
                  </p>
                </div>
              </div>
              <Link
                to={`/booking/${train.id}?from=${suggestion!.boardFrom.id}&to=${toId}&date=${date}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-yellow-600/80 hover:bg-yellow-600 text-white font-medium rounded-lg transition-all text-sm"
              >
                Board from {suggestion!.boardFrom.code} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <Link
              to={`/booking/${train.id}?from=${fromId}&to=${toId}&date=${date}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-primary-900/20"
            >
              View Seats <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Route stations on hover */}
      <div className="max-h-0 group-hover:max-h-20 overflow-hidden transition-all duration-500 opacity-0 group-hover:opacity-100">
        <div className="pt-4 mt-4 border-t border-slate-700/50">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {train.stations.map((station, idx) => {
              const isSearch = station.id === fromId || station.id === toId;
              return (
                <div key={station.id} className="flex items-center flex-shrink-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full mb-1 ${isSearch ? 'bg-primary-500 ring-4 ring-primary-500/20' : 'bg-slate-600'}`} />
                    <span className={`text-[10px] ${isSearch ? 'text-white font-bold' : 'text-slate-500'}`}>{station.code}</span>
                  </div>
                  {idx < train.stations.length - 1 && <div className="w-6 h-0.5 bg-slate-700 mx-0.5" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainCard;
