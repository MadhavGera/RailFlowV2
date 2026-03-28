import React, { useState } from 'react';
import { Train, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import { toast } from 'react-toastify';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.info("Signed out successfully");
  };
  const today = new Date().toISOString().split('T')[0];


  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 shadow-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary-600 group-hover:bg-primary-500 transition-colors p-2 rounded-lg shadow-lg shadow-primary-900/20">
              <Train className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-indigo-300 group-hover:from-primary-300 group-hover:to-indigo-200 transition-all">
              RailFlow
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              to={`/search?from=DEL&to=BPL&date=${today}`}
              className="text-slate-300 hover:text-white transition-colors font-medium">
              Find Trains
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/bookings" className="text-slate-300 hover:text-white transition-colors text-sm font-medium hover:drop-shadow-md">My Bookings</Link>
                <div className="flex items-center gap-2 text-white">
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-white/10 shadow-lg" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-xs font-bold shadow-lg shadow-primary-900/20 cursor-default border border-white/10">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium hidden sm:block text-slate-200">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700 group-hover:bg-slate-700 group-hover:border-slate-600 flex items-center justify-center transition-all">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Login</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </>
  );
};

export default Navbar;