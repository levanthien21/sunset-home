import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Wine, Tv } from 'lucide-react';
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
        // Fallback demo data
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
            src="https://images.unsplash.com/photo-1522771731478-4a1e948c3b99?auto=format&fit=crop&w=2000&q=80" 
            alt="Hero" 
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A17]/80 via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center px-6 w-full max-w-4xl mx-auto mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <h2 className="text-xs uppercase tracking-[0.4em] text-yellow-500 mb-6 font-bold">Boutique Homestay</h2>
            <h1 className="text-5xl md:text-7xl font-serif text-white mb-8 tracking-tight leading-tight">
              Nơi khởi nguồn<br/><span className="italic font-light">những cảm xúc</span>
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-sm md:text-base text-white/90 max-w-lg mx-auto font-light leading-relaxed mb-10 tracking-wide"
          >
            Tận hưởng không gian lãng mạn, tinh tế được thiết kế dành riêng cho những kỷ niệm khó quên tại Sài Gòn.
          </motion.p>
          
          {/* VỊ TRÍ CHÍNH GIỮA: CÁC NÚT MẠNG XÃ HỘI (LOGO THẬT) NHƯ YÊU CẦU */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex items-center justify-center space-x-5 mb-12"
          >
            {/* Facebook */}
            <a href="#" className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-[#1877F2] hover:border-[#1877F2] transition-all duration-300 shadow-lg">
              <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg>
            </a>
            {/* Instagram */}
            <a href="#" className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:border-transparent transition-all duration-300 shadow-lg">
              <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="w-5 h-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
            </a>
            {/* TikTok */}
            <a href="#" className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-black hover:border-black transition-all duration-300 shadow-lg">
              <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.66-.6 3.32-1.72 4.54-1.12 1.22-2.73 1.95-4.42 2.05-1.68.1-3.41-.33-4.78-1.34-1.37-1.02-2.31-2.58-2.61-4.28-.29-1.68-.01-3.48.9-4.96.9-1.47 2.4-2.5 4.09-2.91 1.68-.4 3.48-.19 5.01.62V9.75c-2.45-.66-5.18-.36-7.39 1.1-2.2 1.45-3.56 3.9-3.79 6.49-.22 2.58.74 5.2 2.62 7.03 1.88 1.83 4.55 2.72 7.15 2.45 2.59-.28 5.01-1.63 6.64-3.66 1.63-2.03 2.43-4.66 2.24-7.25V.02h-4.01z"/></svg>
            </a>
            {/* Threads */}
            <a href="#" className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-black transition-all duration-300 shadow-lg">
              <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-2.5-7.5v-1A2.5 2.5 0 0 1 12 9a2.5 2.5 0 0 1 2.5 2.5v1A2.5 2.5 0 0 1 12 15a2.5 2.5 0 0 1-2.5-2.5zm1 0A1.5 1.5 0 0 0 12 14a1.5 1.5 0 0 0 1.5-1.5v-1A1.5 1.5 0 0 0 12 10a1.5 1.5 0 0 0-1.5 1.5v1z"/></svg>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 sm:gap-6 w-full max-w-[280px] sm:max-w-none mx-auto flex-wrap"
          >
            {branches.map((branch, idx) => (
              <Link 
                key={branch.id}
                to={`/customer/booking?branch=${branch.id}`}
                className={`inline-flex items-center justify-center px-6 py-4 uppercase tracking-[0.1em] text-[11px] font-bold shadow-xl transition-all rounded-sm w-full sm:w-auto ${
                  idx === 0 
                    ? 'bg-yellow-600 text-white hover:bg-yellow-500 shadow-yellow-600/30' 
                    : 'bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20'
                }`}
              >
                {branch.name} <ArrowRight size={14} className="ml-2" />
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Intro Section */}
      {/* Branches Preview */}
      <section className="py-24 bg-[#1C1A17] text-white" id="experiences">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-white/10 pb-8">
            <div>
              <h3 className="text-xs font-bold tracking-[0.2em] text-yellow-500 uppercase mb-4">Các chi nhánh</h3>
              <h2 className="text-4xl lg:text-5xl font-serif">Lựa chọn chốn về</h2>
            </div>
            <Link to="/customer/booking" className="hidden md:flex items-center text-xs uppercase tracking-[0.2em] font-medium text-yellow-500 hover:text-white transition-colors">
              Xem tất cả <ArrowRight size={14} className="ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {branches.map((branch: any) => (
              <Link to={`/customer/booking?branch=${branch.id}`} key={branch.id} className="group block">
                <div className="aspect-[4/3] overflow-hidden rounded-sm mb-6 relative">
                  <img src={branch.img} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-1000 ease-out" alt={branch.name} />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                  {!branch.has_rooms && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-semibold px-4 py-2 bg-stone-900/80 rounded-full">Sắp ra mắt</span>
                    </div>
                  )}
                </div>
                <h3 className="text-2xl font-serif text-white mb-2 group-hover:text-yellow-500 transition-colors">{branch.name}</h3>
                <p className="text-white/60 text-sm">{branch.address}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </motion.div>
  );
}
