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
