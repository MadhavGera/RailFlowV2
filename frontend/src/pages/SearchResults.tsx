import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useLocation, Link } from 'react-router-dom';
import TrainCard from '../components/TrainCard';
import { ArrowLeft, Loader2 } from 'lucide-react';
import api from '../services/api';
import { Train, TrainSearchResult } from '../types';

const useQuery = () => new URLSearchParams(useLocation().search);

const SearchResults: React.FC = () => {
  const query = useQuery();
  const fromId = query.get('from') || '';
  const toId = query.get('to') || '';
  const date = query.get('date') || '';

  const [trains, setTrains] = useState<Train[]>([]);
  const [smartResults, setSmartResults] = useState<TrainSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrains = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch real data from your backend API
        const [searchData, smartData] = await Promise.all([
          api.trains.search(fromId, toId, date),
          api.trains.smartSearch(fromId, toId, date),
        ]);
        setTrains(searchData.trains);
        setSmartResults(smartData.results);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch trains');
      } finally {
        setLoading(false);
      }
    };
    if (fromId && toId && date) fetchTrains();
  }, [fromId, toId, date]);

  // Map smart search results by trainId for easy lookup
  const smartByTrainId = smartResults.reduce((acc, r) => {
    acc[r.trainId] = r;
    return acc;
  }, {} as Record<string, TrainSearchResult>);

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center text-slate-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Search
        </Link>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 sticky top-24">
              <h2 className="font-bold text-white mb-4">Journey Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500">From</p>
                  <p className="text-white font-medium">{fromId}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">To</p>
                  <p className="text-white font-medium">{toId}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Date</p>
                  <p className="text-white font-medium">{date}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 space-y-4">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-red-700/30">
                <p className="text-red-400">{error}</p>
              </div>
            ) : trains.length === 0 ? (
              <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-slate-700 border-dashed">
                <p className="text-slate-400">No trains found for this route.</p>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-white">{trains.length} Trains Found</h1>
                {trains.map((train) => (
                  <TrainCard
                    key={train.id}
                    train={train}
                    smartResult={smartByTrainId[train.id] || null}
                    fromId={fromId}
                    toId={toId}
                    date={date}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;