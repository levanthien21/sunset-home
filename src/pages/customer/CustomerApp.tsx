import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

import LandingPage from './LandingPage';
import BookingPage from './BookingPage';
import PoliciesPage from './PoliciesPage';

function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === '/customer' || location.pathname === '/customer/';
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
        <Link to="/customer" className="flex-shrink-0 flex flex-col">
          <h1 className="text-xl md:text-2xl font-serif tracking-[0.25em] uppercase font-light">Sunset</h1>
          <span className="text-[9px] uppercase tracking-[0.3em] opacity-70 mt-1">Boutique Homestay</span>
        </Link>

        {/* Center - Navigation */}
        <div className="hidden md:flex flex-1 justify-center items-center space-x-12">
          <Link to="/customer" className="text-[11px] uppercase tracking-[0.2em] font-medium hover:text-yellow-500 transition-colors">
            Trang chủ
          </Link>
          <Link to="/customer/policies" className="text-[11px] uppercase tracking-[0.2em] font-medium hover:text-yellow-500 transition-colors">
            Chính sách
          </Link>
        </div>

        {/* Right - Action */}
        <div className="flex-shrink-0 flex justify-end items-center">
          <Link 
            to="/customer/booking" 
            className={`px-4 py-2 md:px-7 md:py-2.5 text-[9px] md:text-[11px] uppercase tracking-[0.2em] transition-all border ${
              isSolid 
                ? 'border-[#1C1A17] text-[#1C1A17] hover:bg-[#1C1A17] hover:text-white' 
                : 'border-white/60 text-white hover:bg-white hover:text-[#1C1A17]'
            }`}
          >
            Đặt Phòng
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function CustomerApp() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F9F8F6] text-[#1C1A17] selection:bg-yellow-200">
      <Navbar />
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/policies" element={<PoliciesPage />} />
          </Routes>
        </AnimatePresence>
      </div>
      
      {/* Footer */}
      <footer className="bg-[#1C1A17] text-white pt-20 pb-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-serif mb-6 text-yellow-500">Sunset Home</h3>
            <p className="text-gray-400 font-light max-w-sm leading-relaxed text-sm">
              Trải nghiệm không gian sống tinh tế và đẳng cấp. Nơi khởi nguồn của những kỷ niệm lãng mạn tại Sài Gòn.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm tracking-widest uppercase">Liên Hệ & Hỗ Trợ</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li>0909 123 456</li>
              <li><Link to="/customer/policies" className="hover:text-yellow-500 transition-colors">Chính sách & Quy định</Link></li>
              <li><a href="#map" className="hover:text-yellow-500 transition-colors">Bản đồ chỉ đường</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm tracking-widest uppercase">Kết Nối</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-yellow-500 transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-yellow-500 transition-colors">Facebook</a></li>
              <li><a href="#" className="hover:text-yellow-500 transition-colors">TikTok</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-16 pt-8 border-t border-white/10 text-center text-gray-500 text-xs">
          <p>© 2024 Sunset Home. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
