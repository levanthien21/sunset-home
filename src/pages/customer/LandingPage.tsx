import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Wine, Tv } from 'lucide-react';

export default function LandingPage() {
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
          >
            <Link 
              to="/customer/booking" 
              className="inline-flex items-center space-x-4 px-10 py-4 bg-yellow-600 text-white uppercase tracking-[0.2em] text-xs font-bold hover:bg-yellow-500 shadow-xl shadow-yellow-600/30 transition-all rounded-sm"
            >
              <span>Đặt phòng ngay</span>
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto" id="spaces">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center">
          <div className="lg:col-span-5 relative">
            <div className="aspect-[3/4] overflow-hidden rounded-t-full border-4 border-white shadow-2xl">
              <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80" alt="Space" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-yellow-600/10 rounded-full blur-3xl"></div>
          </div>
          <div className="lg:col-span-7 lg:pl-10">
            <h3 className="text-xs font-bold tracking-[0.2em] text-yellow-600 uppercase mb-4">Triết lý thiết kế</h3>
            <h2 className="text-4xl lg:text-5xl font-serif text-[#1C1A17] mb-8 leading-snug">Vẻ đẹp rực rỡ<br/>trong từng khoảnh khắc</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Mỗi căn hộ tại Sunset đều được chăm chút tỉ mỉ mang âm hưởng ấm áp. Không gian ngập tràn ánh sáng tự nhiên pha lẫn sắc vàng hoàng hôn sẽ làm nổi bật lên những cảm xúc chân thật nhất của bạn.
            </p>
            <div className="grid grid-cols-2 gap-8 mt-12 border-t border-gray-200 pt-12">
              <div>
                <Tv size={28} className="text-yellow-600 mb-4" />
                <h4 className="font-bold text-[#1C1A17] mb-2">Tiện nghi hiện đại</h4>
                <p className="text-sm text-gray-500">Màn hình rộng xịn sò, âm thanh chất lượng cao cho buổi tối lãng mạn.</p>
              </div>
              <div>
                <Wine size={28} className="text-yellow-600 mb-4" />
                <h4 className="font-bold text-[#1C1A17] mb-2">Trải nghiệm cá nhân</h4>
                <p className="text-sm text-gray-500">Dịch vụ setup riêng tư, hoa hồng, rượu vang và không gian cực chill.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Branches Preview */}
      <section className="py-24 bg-[#1C1A17] text-white" id="experiences">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-white/10 pb-8">
            <div>
              <h3 className="text-xs font-bold tracking-[0.2em] text-yellow-500 uppercase mb-4">Các chi nhánh</h3>
              <h2 className="text-4xl lg:text-5xl font-serif">Lựa chọn chốn về</h2>
            </div>
            <Link to="/customer/booking" className="hidden md:flex items-center text-xs uppercase tracking-[0.2em] font-medium text-yellow-500 hover:text-white transition-colors">
              Xem tất cả phòng <ArrowRight size={14} className="ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              { id: 1, name: 'Sunset Vườn (Tân Bình)', desc: 'Không gian ngập tràn sắc xanh.', img: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80' },
              { id: 2, name: 'Sunset Biển (Bình Thạnh)', desc: 'Làn gió nhiệt đới mát mẻ.', img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80' }
            ].map(branch => (
              <Link to="/customer/booking" key={branch.id} className="group block">
                <div className="aspect-[4/3] overflow-hidden rounded-sm mb-6 relative">
                  <img src={branch.img} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-1000 ease-out" alt={branch.name} />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                </div>
                <h3 className="text-2xl font-serif text-white mb-2 group-hover:text-yellow-500 transition-colors">{branch.name}</h3>
                <p className="text-white/60 text-sm">{branch.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24 bg-white" id="gallery">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center mb-16">
          <h3 className="text-xs font-bold tracking-[0.2em] text-yellow-600 uppercase mb-4">Thư viện ảnh</h3>
          <h2 className="text-4xl lg:text-5xl font-serif text-[#1C1A17]">Góc Nhìn Khác Biệt</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 px-2 md:px-6 max-w-7xl mx-auto">
          <div className="col-span-2 row-span-2 overflow-hidden rounded-sm group">
            <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80" alt="Villa Interior" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="overflow-hidden rounded-sm group aspect-square">
            <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80" alt="Bedroom" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="overflow-hidden rounded-sm group aspect-square">
            <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80" alt="Bathroom" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="overflow-hidden rounded-sm group aspect-[2/1] col-span-2">
            <img src="https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=1200&q=80" alt="Living Room" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-24 bg-[#F9F8F6]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <h3 className="text-xs font-bold tracking-[0.2em] text-yellow-600 uppercase mb-4">Cảm nhận</h3>
          <h2 className="text-4xl lg:text-5xl font-serif text-[#1C1A17] mb-16">Khách Hàng Nói Gì?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              { name: "Minh Anh", review: "Phòng Cinebox ở Tân Bình cực kỳ đỉnh. Máy chiếu nét, không gian riêng tư. Tuyệt vời cho ngày kỷ niệm!" },
              { name: "Hoàng Tôn", review: "Setup phòng lãng mạn đúng ý mình. Bạn gái mình rất thích bồn tắm và view ban công ở chi nhánh Bình Thạnh." },
              { name: "Thu Thủy", review: "Thích nhất là sự sạch sẽ và mùi hương tinh dầu thoang thoảng khi vừa bước vào. Chắc chắn sẽ quay lại." }
            ].map((r, i) => (
              <div key={i} className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm hover:shadow-md transition-shadow">
                <div className="flex text-yellow-500 mb-4">
                  {'★★★★★'.split('').map((star, idx) => <span key={idx}>{star}</span>)}
                </div>
                <p className="text-gray-600 font-light italic mb-6">"{r.review}"</p>
                <p className="font-bold text-sm tracking-widest uppercase text-gray-900">— {r.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section id="map" className="h-[60vh] relative border-t border-gray-200">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.1251390453535!2d106.65434191480112!3d10.793796592309873!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752934142f1b4d%3A0x6d90d8a9e403d58!2sSunset%20Home%20-%20Boutique%20Homestay!5e0!3m2!1svi!2s!4v1680000000000!5m2!1svi!2s" 
          className="w-full h-full border-0" 
          allowFullScreen={false} 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          title="Sunset Home Location Map"
        ></iframe>
        <div className="absolute top-10 left-10 md:left-auto md:right-10 bg-white p-6 shadow-xl rounded-sm max-w-sm border-l-4 border-yellow-600">
          <h3 className="font-serif text-2xl text-gray-900 mb-2">Sunset Vườn</h3>
          <p className="text-sm text-gray-600 font-light mb-4">Đường Xuân Hồng, Phường 12, Quận Tân Bình, TP.HCM</p>
          <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="text-xs uppercase tracking-[0.1em] font-bold text-yellow-600 hover:text-yellow-700">Chỉ đường qua Google Maps</a>
        </div>
      </section>

    </motion.div>
  );
}
