import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
            <h2 className="text-[10px] md:text-xs uppercase tracking-[0.5em] text-[#D4AF37] mb-6 font-medium drop-shadow-md">Welcome to Sunset</h2>
            <h1 className="text-5xl md:text-7xl font-serif text-white mb-8 tracking-tight leading-tight drop-shadow-lg">
              Nơi khởi nguồn<br/><span className="italic font-light">những cảm xúc</span>
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-sm md:text-base text-white/90 max-w-lg mx-auto font-light leading-relaxed mb-12 tracking-wide drop-shadow-md"
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
      <section className="py-24 md:py-32 bg-[#0A1128] text-white overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-4xl mx-auto px-6 text-center"
        >
          <h3 className="text-[10px] font-bold tracking-[0.3em] text-[#D4AF37] uppercase mb-6">Câu chuyện của chúng tôi</h3>
          <h2 className="text-3xl md:text-5xl font-serif leading-tight mb-8">Nơi những <span className="italic font-light text-white/50">cảm xúc</span> được trân trọng</h2>
          <p className="text-sm md:text-base text-white/70 font-light leading-relaxed max-w-2xl mx-auto">
            Không chỉ là một nơi lưu trú, Sunset Home là sự kết tinh của nghệ thuật thiết kế và lòng hiếu khách. 
            Mỗi chi nhánh được chúng tôi chăm chút tỉ mỉ từng ánh đèn, từng góc nhỏ để mang lại cho bạn những phút giây thư giãn tuyệt đối giữa lòng phố thị.
          </p>
        </motion.div>
      </section>

      {/* 2. Amenities Section: The Utility */}
      <section className="py-24 bg-white text-[#0A1128]">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
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
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#F4F6F9] flex items-center justify-center mb-5 text-[#D4AF37] group-hover:bg-[#0A1128] group-hover:text-white transition-colors duration-500 shadow-sm border border-gray-100 group-hover:border-[#0A1128]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">{item.icon}</svg>
                </div>
                <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] mb-2 text-[#0A1128]">{item.title}</h4>
                <p className="text-xs text-gray-500 font-light">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Policies Section */}
      <section className="py-24 bg-[#F4F6F9]">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h3 className="text-[10px] font-bold tracking-[0.3em] text-[#D4AF37] uppercase mb-4">Lưu ý quan trọng</h3>
            <h2 className="text-3xl md:text-4xl font-serif text-[#0A1128]">Chính sách lưu trú</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            >
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#0A1128] mb-5">Thời gian</h4>
              <ul className="text-sm text-[#0A1128]/70 space-y-3">
                <li>Check-in: Từ 14:00</li>
                <li>Check-out: Trước 12:00</li>
                <li>Nhận phòng sớm (tùy tình trạng)</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#0A1128] mb-5">Không gian</h4>
              <ul className="text-sm text-[#0A1128]/70 space-y-3">
                <li>Không hút thuốc trong phòng</li>
                <li>Không mang theo thú cưng</li>
                <li>Giữ gìn không gian chung</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            >
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#0A1128] mb-5">Hoàn hủy</h4>
              <ul className="text-sm text-[#0A1128]/70 space-y-3">
                <li>Hủy miễn phí trước 48h</li>
                <li>Hỗ trợ dời lịch linh hoạt</li>
                <li>Bảo lưu giá trị tiền cọc</li>
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="mt-16 text-center"
          >
            <Link 
              to="/customer/policies" 
              className="inline-flex items-center text-[10px] uppercase tracking-[0.2em] font-bold text-[#0A1128] hover:text-[#D4AF37] transition-colors pb-1 border-b border-[#0A1128]/20 hover:border-[#D4AF37]"
            >
              Xem chi tiết chính sách
            </Link>
          </motion.div>
        </div>
      </section>

    </motion.div>
  );
}
