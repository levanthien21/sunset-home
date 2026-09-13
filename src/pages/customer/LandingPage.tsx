import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [featuredRooms, setFeaturedRooms] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { getBranches, getRooms } = await import('../../utils/db');
      const data = await getBranches();
      if (data && data.length > 0) {
        setBranches(data);
      } else {
        setBranches([
          { id: 1, name: 'Chi nhánh 1 (Bến Lức)', address: 'Số 06 Block A3 Ehome Waterpoint', img: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80' },
          { id: 2, name: 'Chi nhánh 2 (Hậu Nghĩa)', address: 'Số A3 Kdc young town Hậu Nghĩa', img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80' }
        ]);
      }
      
      const roomsData = await getRooms();
      if (roomsData && roomsData.length > 0) {
        setFeaturedRooms(roomsData.slice(0, 3));
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

      {/* Featured Rooms */}
      {featuredRooms.length > 0 && (
        <section className="py-24 bg-white" id="rooms">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-16">
              <h3 className="text-xs font-bold tracking-[0.2em] text-yellow-600 uppercase mb-4">Không Gian Đặc Sắc</h3>
              <h2 className="text-4xl lg:text-5xl font-serif text-[#1C1A17]">Các Hạng Phòng Nổi Bật</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredRooms.map((room) => (
                <div key={room.id} className="bg-white rounded-sm overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300 group">
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img 
                      src={room.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"} 
                      alt={room.name} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-sm shadow-sm">
                      <span className="text-xs font-bold text-gray-900">{room.price_extra_hour ? room.price_extra_hour.toLocaleString() : '0'}đ / <span className="font-light">Thêm</span></span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-serif text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">{room.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {room.features && room.features.slice(0, 3).map((f: string, i: number) => (
                        <span key={i} className="text-[10px] uppercase tracking-wider bg-gray-50 text-gray-600 px-2 py-1 rounded-sm">{f}</span>
                      ))}
                    </div>
                    <Link to={`/customer/booking?room=${room.id}`} className="block text-center w-full bg-[#1C1A17] text-white py-3 text-xs uppercase tracking-widest font-bold hover:bg-yellow-600 transition-colors">
                      Đặt Phòng Ngay
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </motion.div>
  );
}
