import React from 'react';
import Navbar from '../components/Navbar';
import SearchWidget from '../components/SearchWidget';
import { ShieldCheck, Zap, Globe } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[500px] w-full overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-[#0f172a] to-[#0f172a] z-0"></div>
        <div className="absolute inset-0 opacity-[0.15] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1474487548417-781cb714c2f3?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent"></div>

        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col items-center justify-center text-center -mt-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight relative z-10">
            Travel <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Smarter</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl">
            Experience the next generation of railway booking with real-time seat locking and smart boarding recommendations.
          </p>
        </div>
      </div>

      {/* Search Widget (Overlaps Hero) */}
      <SearchWidget />

      {/* Features */}
      <div className="container mx-auto px-4 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Zap className="w-8 h-8" />}
            title="Real-Time Locking"
            desc="No more double bookings. Seats are locked instantly across all users the moment you select them."
          />
          <FeatureCard 
            icon={<Globe className="w-8 h-8" />}
            title="Smart Recommendations"
            desc="Direct train full? Our AI suggests alternative boarding stations to get you a confirmed seat."
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-8 h-8" />}
            title="Secure Transaction"
            desc="Bank-grade security with atomic database transactions ensuring your ticket is 100% confirmed."
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 transition-all duration-300 hover:-translate-y-2 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10">
    <div className="inline-flex mb-4 bg-blue-500/10 text-blue-400 p-3 rounded-full">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

export default Home;