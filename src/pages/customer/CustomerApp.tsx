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
            className={`px-5 py-2.5 md:px-8 md:py-3 text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold rounded-full transition-all duration-300 border ${
              isSolid 
                ? 'bg-[#1C1A17] text-white border-[#1C1A17] hover:bg-yellow-600 hover:border-yellow-600 hover:shadow-lg hover:shadow-yellow-600/30 hover:-translate-y-0.5' 
                : 'bg-white/10 backdrop-blur-md text-white border-white/50 hover:bg-white hover:text-[#1C1A17] hover:shadow-lg hover:shadow-white/20 hover:-translate-y-0.5'
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
      {/* Minimalist Luxury Footer */}
      <footer className="bg-white text-[#1C1A17] pt-24 pb-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-serif mb-2 tracking-[0.2em] uppercase">Sunset</h3>
            <p className="text-[9px] uppercase tracking-[0.3em] text-gray-400 mb-8">Boutique Homestay</p>
            <p className="text-gray-500 font-light max-w-sm leading-relaxed text-xs">
              Đánh thức mọi giác quan trong không gian lãng mạn, nơi mỗi góc nhỏ đều được chăm chút tỉ mỉ để tạo nên những kỷ niệm khó quên tại trung tâm thành phố.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-[10px] tracking-widest uppercase text-gray-400">Liên Hệ</h4>
            <ul className="space-y-4 text-gray-600 text-xs font-medium">
              <li><a href="tel:1900xxxx" className="hover:text-black transition-colors">1900 xxxx</a></li>
              <li><a href="mailto:hello@sunsethome.vn" className="hover:text-black transition-colors">hello@sunsethome.vn</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Zalo Official</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-[10px] tracking-widest uppercase text-gray-400">Khám Phá</h4>
            <ul className="space-y-4 text-gray-600 text-xs font-medium">
              <li><Link to="/customer" className="hover:text-black transition-colors">Trang chủ</Link></li>
              <li><Link to="/customer/booking" className="hover:text-black transition-colors">Đặt phòng</Link></li>
              <li><Link to="/customer/policies" className="hover:text-black transition-colors">Chính sách</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-20 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-gray-400 text-[10px] tracking-widest uppercase">
          <p>© 2024 Sunset. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-black transition-colors">Instagram</a>
            <a href="#" className="hover:text-black transition-colors">Facebook</a>
            <a href="#" className="hover:text-black transition-colors">TikTok</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
