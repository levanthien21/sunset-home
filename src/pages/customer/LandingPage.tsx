import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { PhoneCall, MessageCircle } from 'lucide-react';

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
      className="bg-[#F9F8F6] relative"
    >
      {/* Floating Hotline Icons */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-4">
        <a href="tel:0987654321" className="w-12 h-12 bg-[#B8860B] rounded-full flex items-center justify-center text-white shadow-lg shadow-black/20 hover:scale-110 hover:bg-[#a07409] transition-transform flex-shrink-0 animate-bounce">
          <PhoneCall className="w-5 h-5" />
        </a>
        <a href="https://zalo.me/0987654321" target="_blank" rel="noreferrer" className="w-12 h-12 bg-[#0068FF] rounded-full flex items-center justify-center text-white shadow-lg shadow-black/20 hover:scale-110 hover:bg-[#0055d4] transition-transform flex-shrink-0">
          <MessageCircle className="w-5 h-5" />
        </a>
      </div>

      {/* Hero Section */}
      <section className="relative h-[90vh] md:h-screen flex flex-col justify-center items-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?auto=format&fit=crop&w=2000&q=80" 
            alt="Hero" 
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="relative z-10 text-center px-6 w-full max-w-4xl mx-auto mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <h2 className="text-[9px] md:text-[10px] uppercase tracking-[0.5em] text-[#D4AF37] mb-4 md:mb-6 font-medium drop-shadow-md">Welcome to Sunset</h2>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif text-white mb-6 md:mb-8 tracking-tight leading-tight drop-shadow-lg">
              Nơi khởi nguồn<br/><span className="italic font-light">những cảm xúc</span>
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-xs sm:text-sm md:text-base text-white/90 max-w-lg mx-auto font-light leading-relaxed mb-10 md:mb-12 tracking-wide drop-shadow-md"
          >
            Tận hưởng không gian lãng mạn, tinh tế được thiết kế dành riêng cho những kỷ niệm khó quên tại Sài Gòn.
          </motion.p>
          
          {/* Social Icons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex items-center justify-center space-x-4 mb-8 md:mb-12 hidden"
          >
            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-[#1877F2] hover:border-[#1877F2] transition-all duration-300 shadow-lg">
              <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg>
            </a>
            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-[#0068FF] hover:border-[#0068FF] transition-all duration-300 shadow-lg">
              <span className="text-[10px] font-bold tracking-wider">Zalo</span>
            </a>
            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-black hover:border-black transition-all duration-300 shadow-lg">
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

      {/* 1. Intro Section: The Bridge */}
      <section className="py-20 md:py-32 bg-[#FCF9F2] text-[#1C1A17] overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-4xl mx-auto px-6 text-center"
        >
          <h3 className="text-[9px] md:text-[10px] font-bold tracking-[0.3em] text-[#B8860B] uppercase mb-4 md:mb-6">Câu chuyện của chúng tôi</h3>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-serif leading-tight mb-6 md:mb-8">Nơi những <span className="italic font-light text-gray-400">cảm xúc</span> được trân trọng</h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-700 font-light leading-relaxed max-w-2xl mx-auto">
            Không chỉ là một nơi lưu trú, Sunset Home là sự kết tinh của nghệ thuật thiết kế và lòng hiếu khách. 
            Mỗi chi nhánh được chúng tôi chăm chút tỉ mỉ từng ánh đèn, từng góc nhỏ để mang lại cho bạn những phút giây thư giãn tuyệt đối giữa lòng phố thị.
          </p>
        </motion.div>
      </section>

      {/* 2. Amenities Section: The Utility */}
      <section className="py-20 md:py-24 bg-white text-[#1C1A17]">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 text-center">
            {[
              { icon: <><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></>, title: "Smart TV", desc: "Tích hợp Netflix 4K" },
              { icon: <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>, title: "Bồn Tắm", desc: "Thư giãn tối đa" },
              { icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>, title: "Riêng Tư", desc: "An ninh 24/7" },
              { icon: <><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></>, title: "Linh Hoạt", desc: "Check-in mọi lúc" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                className="flex flex-col items-center group"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#FCF9F2] flex items-center justify-center mb-4 md:mb-5 text-[#B8860B] group-hover:bg-[#1C1A17] group-hover:text-[#FCF9F2] transition-colors duration-500 shadow-sm border border-[#F5EDD6] group-hover:border-[#1C1A17]">
                  <svg width="20" height="20" className="md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">{item.icon}</svg>
                </div>
                <h4 className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] mb-1 md:mb-2 text-[#1C1A17]">{item.title}</h4>
                <p className="text-[10px] md:text-xs text-gray-500 font-light px-2">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Policies Section */}
      <section className="py-20 md:py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row gap-12 md:gap-20">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="md:w-1/3 flex flex-col items-start text-left"
          >
            <h3 className="text-[9px] md:text-[10px] font-bold tracking-[0.3em] text-[#B8860B] uppercase mb-3 md:mb-4">Lưu ý quan trọng</h3>
            <h2 className="text-2xl md:text-4xl font-serif text-[#1C1A17] mb-4">Quy định<br/>lưu trú</h2>
            <p className="text-xs md:text-sm text-gray-500 font-light leading-relaxed mb-8">
              Nhằm đảm bảo trải nghiệm nghỉ dưỡng hoàn hảo nhất, quý khách vui lòng lưu ý các quy định chung của Sunset Home.
            </p>
            <Link 
              to="/customer/policies" 
              className="inline-flex items-center text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-[#1C1A17] hover:text-[#B8860B] transition-colors pb-1 border-b border-[#1C1A17]/20 hover:border-[#B8860B]"
            >
              Xem chi tiết toàn bộ
            </Link>
          </motion.div>

          <div className="md:w-2/3 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="py-6 border-t border-[#1C1A17]/10 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6"
            >
              <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#1C1A17] sm:w-1/3">Thời gian</h4>
              <p className="text-xs md:text-sm text-gray-600 font-light sm:w-2/3">Nhận phòng từ 14:00 — Trả phòng trước 12:00.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="py-6 border-t border-[#1C1A17]/10 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6"
            >
              <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#1C1A17] sm:w-1/3">Không gian</h4>
              <p className="text-xs md:text-sm text-gray-600 font-light sm:w-2/3">Không khói thuốc, không thú cưng và tiệc tùng ồn ào.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              className="py-6 border-y border-[#1C1A17]/10 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6"
            >
              <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#1C1A17] sm:w-1/3">Hoàn hủy</h4>
              <p className="text-xs md:text-sm text-gray-600 font-light sm:w-2/3">Miễn phí hủy trước 48h. Hỗ trợ dời lịch linh hoạt.</p>
            </motion.div>
          </div>
        </div>
      </section>

    </motion.div>
  );
}
