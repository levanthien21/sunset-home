import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ProfilePage from './ProfilePage';

import LandingPage from './LandingPage';
import BookingPage from './BookingPage';
import PoliciesPage from './PoliciesPage';

function Navbar() {
  const location = useLocation();
  const { user } = useAuth();
  const isHome = location.pathname === '/' || location.pathname === '';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isSolid = !isHome || scrolled;

  return (
    <nav className={`fixed w-full z-50 transition-all duration-700 ${isSolid ? 'bg-white shadow-sm border-b border-gray-100 py-4 text-gray-900' : 'bg-transparent py-6 text-white'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
        {/* Left - Logo */}
        <Link to="/" className="flex-shrink-0 flex flex-col">
          <h1 className="text-xl md:text-2xl font-serif tracking-[0.25em] uppercase font-light">Sunset</h1>
          <span className="text-[9px] uppercase tracking-[0.3em] opacity-70 mt-1">Boutique Homestay</span>
        </Link>

        {/* Center - Navigation */}
        <div className="hidden md:flex flex-1 justify-center items-center space-x-12">
          <Link to="/" className="text-[11px] uppercase tracking-[0.2em] font-medium hover:text-yellow-500 transition-colors">
            Trang chủ
          </Link>
          <Link to="/policies" className="text-[11px] uppercase tracking-[0.2em] font-medium hover:text-yellow-500 transition-colors">
            Chính sách
          </Link>
        </div>

        {/* Right - Action */}
        <div className="flex-shrink-0 flex justify-end items-center space-x-4">
          {user ? (
            <Link to="/profile" className="flex items-center space-x-2 text-sm hover:text-yellow-500 transition-colors">
              <UserIcon size={18} />
              <span className="hidden md:inline font-medium">{user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
            </Link>
          ) : (
            <Link to="/login" className="text-[11px] uppercase tracking-[0.2em] font-medium hover:text-yellow-500 transition-colors hidden md:block">
              Đăng nhập
            </Link>
          )}

          <Link 
            to="/booking" 
            className={`px-5 py-2.5 md:px-8 md:py-3 text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold rounded-full transition-all duration-300 border animate-[pulse_3s_infinite] hover:animate-none ${
              isSolid 
                ? 'bg-[#1C1A17] text-white border-[#1C1A17] hover:bg-yellow-600 hover:border-yellow-600 shadow-md hover:shadow-[0_0_20px_rgba(202,138,4,0.4)] hover:-translate-y-0.5' 
                : 'bg-white/10 backdrop-blur-md text-white border-white/50 hover:bg-white hover:text-[#1C1A17] shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] hover:-translate-y-0.5'
            }`}
          >
            Đặt Phòng
          </Link>
        </div>
      </div>
    </nav>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function CustomerApp() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F9F8F6] text-[#1C1A17] selection:bg-yellow-200">
      <ScrollToTop />
      <Navbar />
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/policies" element={<PoliciesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </AnimatePresence>
      </div>
      
      {/* Footer */}
      {/* Minimalist Luxury Footer */}
      <footer className="bg-[#1C1A17] text-white pt-16 md:pt-24 pb-8 md:pb-12 border-t border-[#1C1A17]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12">
          
          {/* Brand - 5 cols on desktop */}
          <div className="md:col-span-5">
            <h3 className="text-xl md:text-2xl font-serif mb-2 tracking-[0.2em] uppercase text-white">Sunset</h3>
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-white/50 mb-6">Boutique Homestay</p>
            <p className="text-white/60 font-light max-w-sm leading-relaxed text-xs md:text-sm">
              Đánh thức mọi giác quan trong không gian lãng mạn, nơi mỗi góc nhỏ đều được chăm chút tỉ mỉ để tạo nên những kỷ niệm khó quên tại trung tâm thành phố.
            </p>
          </div>
          
          {/* Khám Phá - 3 cols on desktop */}
          <div className="md:col-span-3">
            <h4 className="font-bold mb-5 text-[10px] md:text-xs tracking-widest uppercase text-white/40">Khám Phá</h4>
            <ul className="space-y-3 text-white/70 text-xs md:text-sm font-medium">
              <li><Link to="/" className="hover:text-[#B8860B] transition-colors">Trang chủ</Link></li>
              <li><Link to="/booking" className="hover:text-[#B8860B] transition-colors">Hệ thống phòng</Link></li>
              <li><Link to="/policies" className="hover:text-[#B8860B] transition-colors">Quy định chung</Link></li>
            </ul>
          </div>

          {/* Liên Hệ - 4 cols on desktop */}
          <div className="md:col-span-4">
            <h4 className="font-bold mb-5 text-[10px] md:text-xs tracking-widest uppercase text-white/40">Liên Hệ</h4>
            <ul className="space-y-3 text-white/70 text-xs md:text-sm font-light">
              <li className="flex items-start">
                <span className="w-16 flex-shrink-0 font-medium text-white/40">Hotline:</span>
                <a href="tel:1900xxxx" className="hover:text-[#B8860B] transition-colors font-medium">1900 xxxx</a>
              </li>
              <li className="flex items-start">
                <span className="w-16 flex-shrink-0 font-medium text-white/40">Email:</span>
                <a href="mailto:hello@sunsethome.vn" className="hover:text-[#B8860B] transition-colors">hello@sunsethome.vn</a>
              </li>
              <li className="flex items-start">
                <span className="w-16 flex-shrink-0 font-medium text-white/40">Zalo:</span>
                <a href="#" className="hover:text-[#B8860B] transition-colors">Zalo Official</a>
              </li>
            </ul>
          </div>
          
        </div>
        
        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-16 md:mt-20 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-white/40 text-[9px] md:text-[10px] tracking-widest uppercase gap-4">
          <p>© 2024 Sunset Homestay. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-white transition-colors">Facebook</a>
            <a href="#" className="hover:text-white transition-colors">TikTok</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
