import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [branches, setBranches] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { getBranches } = await import('../../utils/db');
      const data = await getBranches();
      if (data && data.length > 0) {
        setBranches(data);
      } else {
        setBranches([
          { id: 1, name: 'Chi nhánh 1 (Bến Lức)', address: 'Số 06 Block A3 Ehome Waterpoint', img: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80' },
          { id: 2, name: 'Chi nhánh 2 (Hậu Nghĩa)', address: 'Số A3 Kdc young town Hậu Nghĩa', img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80' }
        ]);
      }
    };
    load();
  }, []);
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="bg-[#F9F8F6]"
    >
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col justify-center items-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?auto=format&fit=crop&w=2000&q=80" 
            alt="Hero" 
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A17] via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center px-6 w-full max-w-4xl mx-auto mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <h2 className="text-[10px] md:text-xs uppercase tracking-[0.5em] text-white/60 mb-6 font-medium">Welcome to Sunset</h2>
            <h1 className="text-5xl md:text-7xl font-serif text-white mb-8 tracking-tight leading-tight">
              Nơi khởi nguồn<br/><span className="italic font-light">những cảm xúc</span>
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-sm md:text-base text-white/80 max-w-lg mx-auto font-light leading-relaxed mb-12 tracking-wide"
          >
            Tận hưởng không gian lãng mạn, tinh tế được thiết kế dành riêng cho những kỷ niệm khó quên tại Sài Gòn.
          </motion.p>
          
          {/* Social Icons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex items-center justify-center space-x-4 mb-12"
          >
            {/* Facebook */}
            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-[#1877F2] hover:border-[#1877F2] transition-all duration-300">
              <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg>
            </a>
            {/* Zalo */}
            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-[#0068FF] hover:border-[#0068FF] transition-all duration-300">
              <span className="text-[10px] font-bold tracking-wider">Zalo</span>
            </a>
            {/* TikTok */}
            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-black hover:border-black transition-all duration-300">
              <svg viewBox="0 0 448 512" fill="currentColor" className="w-4 h-4"><path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/></svg>
            </a>
          </motion.div>

          {/* Quick Branch Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
          >
            {branches.map((branch) => (
              <Link 
                key={branch.id}
                to={`/customer/booking?branch=${branch.id}`}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/5 backdrop-blur-md border border-white/20 text-white text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-white hover:text-black hover:scale-105 transition-all duration-300"
              >
                {branch.name}
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Branches Layout */}
      <section className="py-32 bg-white" id="experiences">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20">
            <div className="max-w-2xl">
              <h3 className="text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase mb-4">Các chi nhánh</h3>
              <h2 className="text-4xl lg:text-6xl font-serif text-[#1C1A17] leading-tight">Lựa chọn<br/><span className="italic text-gray-400">chốn về</span></h2>
            </div>
            <Link to="/customer/booking" className="hidden md:flex items-center text-xs uppercase tracking-[0.2em] font-bold text-[#1C1A17] hover:opacity-50 transition-opacity pb-4 border-b border-black/20 hover:border-black">
              Xem tất cả <ArrowRight size={14} className="ml-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
            {branches.map((branch: any, index: number) => (
              <Link to={`/customer/booking?branch=${branch.id}`} key={branch.id} className={`group block ${index % 2 !== 0 ? 'md:mt-24' : ''}`}>
                <div className="aspect-[3/4] overflow-hidden mb-8 relative">
                  <img src={branch.img} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-[1.5s] ease-out" alt={branch.name} />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-700"></div>
                  {!branch.has_rooms && (
                    <div className="absolute top-6 left-6">
                      <span className="text-white text-[9px] uppercase tracking-widest font-bold px-4 py-2 bg-black/60 backdrop-blur-md rounded-sm">Sắp ra mắt</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-serif text-[#1C1A17] mb-3 group-hover:text-gray-500 transition-colors duration-500">{branch.name}</h3>
                    <p className="text-gray-500 text-sm font-light max-w-sm leading-relaxed">{branch.address}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-[#1C1A17] group-hover:text-white group-hover:border-[#1C1A17] transition-all duration-500">
                    <ArrowRight size={14} className="transform -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </motion.div>
  );
}
