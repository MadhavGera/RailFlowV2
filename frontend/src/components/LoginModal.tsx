import React, { useState, useEffect } from 'react';
import { X, Mail, User as UserIcon, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const { login, signup, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      
      // Allow messages from Localhost (dev) and Render (production backend)
      if (!origin.includes('localhost') && !origin.includes('onrender.com')) {
        return;
      }
      
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        refreshUser();
        toast.success("Successfully connected with Google!");
        onClose();
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [refreshUser, onClose]);

  const handleGoogleLogin = async () => {
    try {
      // 👇 Use the api service instead of raw fetch!
      const { url } = await api.auth.googleUrl();

      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const authWindow = window.open(
        url,
        'google_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!authWindow) {
        alert('Please allow popups for this site to connect your account.');
      }
    } catch (error) {
      console.error('OAuth error:', error);
      toast.error("Failed to initiate Google Login");
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!isLogin) {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
        await signup(name, email, password);
        toast.success(`Welcome to RailFlow, ${name}!`);
      } else {
        await login(email, password);
        toast.success(`Welcome back!`);
      }

      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setError('');
      onClose();
    } catch (err: any) {
      const msg = err.message || "An error occurred";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with Glass Effect */}
      <div
        className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Decorative background blobs */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-400 mb-6">
            {isLogin ? 'Enter your details to access your bookings.' : 'Join RailFlow for smart travel.'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400 ml-1">Full Name</label>
                <div className="relative group">
                  <UserIcon className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder-slate-600"
                    placeholder="John Doe"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder-slate-600"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder-slate-600"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400 ml-1">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder-slate-600"
                    placeholder="••••••••"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-primary-900/20 transform transition-all active:scale-95 mt-4 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Processing...
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#0f172a] text-slate-400">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={toggleMode}
                className="text-primary-400 hover:text-primary-300 font-medium hover:underline focus:outline-none transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;