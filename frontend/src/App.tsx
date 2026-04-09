import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import BookingPage from './pages/BookingPage';
import BookingsPage from './pages/BookingsPage';
import AdminDashboard from './pages/AdminDashboard';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => {
  return (
    <HashRouter>
      <SocketProvider>
        <AuthProvider>
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            theme="dark"
            toastClassName="!bg-slate-800 !text-slate-100 !border !border-slate-700"
          />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/trains" element={<SearchResults />} />
            <Route path="/booking/:trainId" element={<BookingPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </AuthProvider>
      </SocketProvider>
    </HashRouter>
  );
};

export default App;
