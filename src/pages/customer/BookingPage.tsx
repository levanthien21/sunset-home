import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin, Calendar, Users, AlertCircle, Heart, Wine, Mail, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BRANCHES = [
  { id: 1, name: 'Cơ sở 1 (Sunset Vườn)', address: 'Đường Xuân Hồng, Tân Bình', img: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80', rooms: 2 },
  { id: 2, name: 'Cơ sở 2 (Sunset Biển)', address: 'Đường Bùi Đình Túy, Bình Thạnh', img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80', rooms: 3 },
];

const ROOMS = [
  { id: 101, branchId: 1, name: 'Phòng Standard', price: 600000, img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', features: ['Giường King Size', 'Ánh sáng tự nhiên', 'Smart TV'] },
  { id: 102, branchId: 1, name: 'Cinebox VIP', price: 900000, img: 'https://images.unsplash.com/photo-1588665046200-a4f664a781b0?auto=format&fit=crop&w=800&q=80', features: ['Máy chiếu siêu nét', 'Tài khoản Netflix Premium', 'Không gian cách âm'] },
  { id: 201, branchId: 2, name: 'Phòng Standard', price: 600000, img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80', features: ['Bồn tắm', 'Gương Led', 'Loa Bluetooth'] },
  { id: 202, branchId: 2, name: 'Bigbox VIP', price: 1200000, img: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80', features: ['Không gian cực rộng', 'Máy chiếu', 'Máy chơi game PS4'] },
  { id: 203, branchId: 2, name: 'Homestay Chill', price: 800000, img: 'https://images.unsplash.com/photo-1522771731478-4a1e948c3b99?auto=format&fit=crop&w=800&q=80', features: ['Ban công view phố', 'Khu vực bếp riêng', 'Bàn ăn lãng mạn'] },
];

const ADDONS = [
  { id: 'bbq', name: 'Set nướng BBQ sân thượng', price: 500000, icon: Wine, desc: 'Bao gồm bếp than, thịt bò Mỹ, hải sản và 2 ly vang đỏ.' },
  { id: 'decor', name: 'Trang trí phòng lãng mạn', price: 300000, icon: Heart, desc: 'Set up nến, hoa hồng thả bồn tắm và bóng bay.' }
];

export default function BookingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [branch, setBranch] = useState<number | null>(null);
  const [room, setRoom] = useState<number | null>(null);
  
  // Form State
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('qr');
  const [bookingType, setBookingType] = useState('full'); // 'reserve', 'deposit', 'full'
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Data Logic
  const filteredRooms = ROOMS.filter(r => r.branchId === branch);
  const selectedBranchDetails = BRANCHES.find(b => b.id === branch);
  const selectedRoomDetails = ROOMS.find(r => r.id === room);

  const [existingBookings, setExistingBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchDB = async () => {
      const { getBookings } = await import('../../utils/db');
      setExistingBookings(await getBookings());
    };
    fetchDB();
  }, []);

  const blockedDates = useMemo(() => {
    if (!selectedRoomDetails) return [];
    return existingBookings
      .filter((b: any) => b.roomName === selectedRoomDetails.name && b.status !== 'cancelled')
      .map((b: any) => ({
        start: new Date(b.checkIn).toLocaleDateString('vi-VN'),
        end: new Date(b.checkOut).toLocaleDateString('vi-VN')
      }));
  }, [selectedRoomDetails, existingBookings]);

  // Validation: Check for overlaps
  const overlapError = useMemo(() => {
    if (!checkIn || !checkOut || !selectedRoomDetails) return null;
    
    const newStart = new Date(checkIn).getTime();
    const newEnd = new Date(checkOut).getTime();
    
    if (newStart >= newEnd) return "Ngày trả phòng phải sau ngày nhận phòng.";

    const hasOverlap = existingBookings.some((b: any) => {
      if (b.roomName !== selectedRoomDetails.name) return false;
      if (b.status === 'cancelled') return false; // ignore cancelled
      
      const bStart = new Date(b.checkIn).getTime();
      const bEnd = new Date(b.checkOut).getTime();
      
      // Overlap logic: new booking starts before existing ends AND new booking ends after existing starts
      return newStart < bEnd && newEnd > bStart;
    });

    if (hasOverlap) return "Rất tiếc, phòng này đã có người đặt trong thời gian bạn chọn. Vui lòng chọn ngày khác!";
    return null;
  }, [checkIn, checkOut, selectedRoomDetails, existingBookings]);

  // Dynamic Pricing Calculation
  const { nights, roomTotal, weekendSurcharge } = useMemo(() => {
    if (!checkIn || !checkOut || !selectedRoomDetails || overlapError) return { nights: 0, roomTotal: 0, weekendSurcharge: 0 };
    
    let current = new Date(checkIn);
    const end = new Date(checkOut);
    let totalNights = 0;
    let surcharge = 0;
    
    while (current < end) {
      const day = current.getDay();
      // Phụ thu 200k cho tối Thứ 6 (5) và Thứ 7 (6)
      if (day === 5 || day === 6) {
        surcharge += 200000;
      }
      current.setDate(current.getDate() + 1);
      totalNights++;
    }
    
    return {
      nights: totalNights,
      roomTotal: totalNights * selectedRoomDetails.price,
      weekendSurcharge: surcharge
    };
  }, [checkIn, checkOut, selectedRoomDetails, overlapError]);

  const addonsTotal = selectedAddons.reduce((sum, addonId) => {
    const addon = ADDONS.find(a => a.id === addonId);
    return sum + (addon ? addon.price : 0);
  }, 0);

  const totalPrice = roomTotal + weekendSurcharge + addonsTotal;
  const amountToPay = bookingType === 'reserve' ? 0 : (bookingType === 'deposit' ? totalPrice * 0.5 : totalPrice);

  const isPhoneValid = /^(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(phone);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValid = name.trim().length > 2 && isPhoneValid && isEmailValid && checkIn && checkOut && nights > 0 && !overlapError;

  const handleToggleAddon = (id: string) => {
    setSelectedAddons(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const handleConfirmInfo = () => {
    if (!isValid) return;
    setStep(4); // Move to Payment Step
  };

  const handlePaymentSubmit = () => {
    setIsProcessing(true);
    
    setTimeout(async () => {
      const datePart = new Date().toISOString().slice(2,10).replace(/-/g, '');
      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      const newBookingId = `SUN-${datePart}-${randomPart}`;
      
      setBookingId(newBookingId);
      
      const newBooking = {
        bookingId: newBookingId,
        id: newBookingId,
        branchName: selectedBranchDetails?.name,
        roomName: selectedRoomDetails?.name,
        customerName: name,
        phone,
        email,
        checkIn,
        checkOut,
        guests,
        addons: selectedAddons,
        total: totalPrice,
        amountPaid: amountToPay,
        bookingType,
        status: 'pending',
        date: new Date().toISOString(),
        paymentMethod: bookingType === 'reserve' ? 'none' : paymentMethod
      };
      
      const { addBooking } = await import('../../utils/db');
      await addBooking(newBooking);

      // Tích hợp Gửi Email tự động bằng EmailJS
      try {
        if (import.meta.env.VITE_EMAILJS_SERVICE_ID) {
          const emailjs = (await import('@emailjs/browser')).default;
          await emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
            {
              to_email: email,
              to_name: name,
              booking_id: newBookingId,
              room_name: selectedRoomDetails?.name,
              branch_name: selectedBranchDetails?.name,
              check_in: new Date(checkIn).toLocaleDateString('vi-VN'),
              check_out: new Date(checkOut).toLocaleDateString('vi-VN'),
              total_price: totalPrice.toLocaleString() + 'đ',
              amount_paid: amountToPay.toLocaleString() + 'đ',
              amount_due: (totalPrice - amountToPay).toLocaleString() + 'đ'
            },
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY
          );
          console.log("Email đã được gửi thành công qua EmailJS!");
        } else {
          console.log("Đã bỏ qua gửi email thật do chưa cấu hình KEY trong file .env");
        }
      } catch (error: any) {
        console.error("Lỗi khi gửi email:", error);
        alert("Có lỗi xảy ra khi gửi vé điện tử (EmailJS): " + (error.text || error.message || JSON.stringify(error)));
      }

      setIsProcessing(false);
      setStep(5);
    }, 1500); // Giả lập call API 1.5s
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="bg-[#F9F8F6] min-h-screen font-sans flex flex-col pt-32 pb-24 text-[#1C1A17]"
    >
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 flex-1 flex flex-col xl:flex-row gap-16 lg:gap-24">
        
        {/* Left Content Area */}
        <div className="flex-1">
          {/* Header & Back */}
          <div className="flex items-center space-x-6 mb-12">
            <button 
              onClick={() => step > 1 ? setStep(step - 1) : navigate('/customer')}
              className="p-3 bg-white rounded-full border border-gray-200 hover:border-yellow-600 transition-all group shadow-sm"
            >
              <ArrowLeft size={16} className="text-gray-500 group-hover:text-yellow-600 transition-colors" />
            </button>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-2">Bước {step} / 3</p>
              <h1 className="text-3xl lg:text-4xl font-serif text-[#1C1A17]">Đặt Không Gian</h1>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {BRANCHES.map(b => (
                  <div 
                    key={b.id} 
                    onClick={() => { setBranch(b.id); setStep(2); setRoom(null); }}
                    className="group bg-white rounded-sm shadow-sm hover:shadow-xl border border-transparent hover:border-yellow-200 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
                  >
                    <div className="aspect-[4/5] overflow-hidden bg-gray-100 relative mb-6">
                      <img src={b.img} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-1000 ease-out" alt={b.name} />
                    </div>
                    <div className="px-6 pb-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif text-2xl text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">{b.name}</h3>
                        <p className="text-sm text-gray-500 flex items-center"><MapPin size={14} className="mr-2 opacity-50"/> {b.address}</p>
                      </div>
                      <div className="mt-6">
                        <span className="text-xs font-semibold text-yellow-600 flex items-center group-hover:translate-x-2 transition-transform">
                          Chọn cơ sở <ArrowRight size={16} className="ml-1" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-serif text-gray-900">Danh sách phòng tại {selectedBranchDetails?.name}</h2>
                </div>

                {filteredRooms.map(r => (
                  <div 
                    key={r.id} 
                    onClick={() => { setRoom(r.id); setStep(3); }}
                    className="group bg-white rounded-sm shadow-sm hover:shadow-xl border border-transparent hover:border-yellow-200 p-4 flex flex-col md:flex-row gap-8 cursor-pointer transition-all duration-300"
                  >
                    <div className="w-full md:w-80 aspect-[4/3] bg-gray-100 overflow-hidden shrink-0 rounded-sm">
                      <img src={r.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out" alt={r.name} />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-serif text-2xl lg:text-3xl text-gray-900 group-hover:text-yellow-600 transition-colors">{r.name}</h3>
                          <div className="text-right">
                            <span className="text-xl lg:text-2xl font-bold text-gray-900">{r.price.toLocaleString()}đ</span>
                            <span className="text-[10px] text-gray-500 block font-bold uppercase tracking-[0.2em] mt-1">/ Đêm</span>
                          </div>
                        </div>
                        <ul className="space-y-3 mt-6">
                          {r.features.map(f => (
                            <li key={f} className="text-sm text-gray-600 flex items-center">
                              <CheckCircle2 size={16} className="text-yellow-500 mr-2" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-8 flex justify-end">
                         <button className="px-6 py-2.5 bg-[#1C1A17] text-white text-xs uppercase tracking-widest font-semibold rounded-sm group-hover:bg-yellow-600 transition-colors">
                           Chọn phòng này
                         </button>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white p-8 lg:p-12 rounded-sm shadow-sm border border-gray-100"
              >
                <div className="space-y-16">
                  {/* Date & Guests Selection */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-6">1. Thời gian lưu trú</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#F9F8F6] p-6 rounded-sm border border-gray-100 mb-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 flex items-center"><Calendar size={12} className="mr-2"/> Nhận phòng</label>
                        <input 
                          type="date" 
                          value={checkIn}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setCheckIn(e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-sm focus:outline-none focus:border-yellow-500 bg-white shadow-sm" 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 flex items-center"><Calendar size={12} className="mr-2"/> Trả phòng</label>
                        <input 
                          type="date" 
                          value={checkOut}
                          min={checkIn || new Date().toISOString().split('T')[0]}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-sm focus:outline-none focus:border-yellow-500 bg-white shadow-sm" 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 flex items-center"><Users size={12} className="mr-2"/> Số khách</label>
                        <select 
                          value={guests} 
                          onChange={(e) => setGuests(Number(e.target.value))}
                          className="w-full p-3 border border-gray-200 rounded-sm focus:outline-none focus:border-yellow-500 bg-white shadow-sm appearance-none"
                        >
                          <option value={1}>1 Người lớn</option>
                          <option value={2}>2 Người lớn</option>
                          <option value={3}>3 Người lớn (Thêm đệm)</option>
                        </select>
                      </div>
                    </div>

                    {blockedDates.length > 0 ? (
                      <div className="bg-yellow-50/50 p-4 rounded-sm border border-yellow-200 mb-6">
                        <p className="text-xs font-bold text-yellow-800 uppercase tracking-widest mb-2">Các ngày đã kín phòng:</p>
                        <ul className="flex flex-wrap gap-2 text-sm text-yellow-700">
                          {blockedDates.map((b: any, i: number) => (
                            <li key={i} className="bg-white px-3 py-1 rounded-sm shadow-sm border border-yellow-100">
                              {b.start} <span className="text-yellow-400 mx-1">→</span> {b.end}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="bg-green-50/50 p-4 rounded-sm border border-green-200 mb-6 flex items-start text-green-700">
                        <CheckCircle2 size={16} className="mr-2 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest mb-1">Tin vui!</p>
                          <p className="text-sm">Phòng này hiện tại đang trống tất cả các ngày. Hãy nhanh tay đặt ngay!</p>
                        </div>
                      </div>
                    )}
                    
                    {overlapError && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex items-start text-red-600 bg-red-50 p-4 rounded-sm border border-red-200 text-sm">
                        <AlertCircle size={16} className="mr-2 shrink-0 mt-0.5" />
                        <p>{overlapError}</p>
                      </motion.div>
                    )}
                  </div>

                  {/* Addons Upselling */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-6">2. Trải nghiệm thêm</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {ADDONS.map(addon => {
                        const isSelected = selectedAddons.includes(addon.id);
                        const Icon = addon.icon;
                        return (
                          <div 
                            key={addon.id}
                            onClick={() => handleToggleAddon(addon.id)}
                            className={`p-6 border-2 rounded-sm cursor-pointer transition-all flex items-start ${isSelected ? 'border-yellow-500 bg-yellow-50/50' : 'border-gray-100 hover:border-yellow-200'}`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <Icon size={20} className={`mr-3 ${isSelected ? 'text-yellow-600' : 'text-gray-400'}`} />
                                <h4 className="font-semibold text-gray-900">{addon.name}</h4>
                              </div>
                              <p className="text-xs text-gray-500 mb-4 leading-relaxed">{addon.desc}</p>
                              <p className="text-sm font-bold text-yellow-600">+{addon.price.toLocaleString()}đ</p>
                            </div>
                            <div className={`w-5 h-5 ml-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-yellow-500 bg-yellow-500' : 'border-gray-300'}`}>
                              {isSelected && <CheckCircle2 size={12} strokeWidth={3} className="text-white" />}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-6">3. Thông tin cá nhân</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Họ và Tên (*)</label>
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Nhập tên của bạn"
                          className={`w-full p-4 border rounded-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 bg-[#F9F8F6] text-sm transition-colors ${name && name.trim().length <= 2 ? 'border-red-300' : 'border-gray-200'}`} 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Số Điện Thoại (*)</label>
                        <input 
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="0909..."
                          className={`w-full p-4 border rounded-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 bg-[#F9F8F6] text-sm transition-colors ${phone && !isPhoneValid ? 'border-red-300' : 'border-gray-200'}`} 
                        />
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Email xác nhận (*)</label>
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        className={`w-full p-4 border rounded-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 bg-[#F9F8F6] text-sm transition-colors ${email && !isEmailValid ? 'border-red-300' : 'border-gray-200'}`} 
                      />
                    </div>

                    <div className="space-y-3 mt-6">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Yêu cầu đặc biệt (Tuỳ chọn)</label>
                      <input 
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Ghi chú thêm..."
                        className="w-full p-4 border border-gray-200 rounded-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 bg-[#F9F8F6] text-sm transition-colors" 
                      />
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white p-8 lg:p-12 rounded-sm shadow-sm border border-gray-100"
              >
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-6">1. Chọn hình thức thanh toán</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <div 
                    onClick={() => setBookingType('reserve')}
                    className={`p-6 border-2 rounded-sm cursor-pointer transition-all flex flex-col ${bookingType === 'reserve' ? 'border-yellow-500 bg-yellow-50/50' : 'border-gray-100 hover:border-yellow-200'}`}
                  >
                    <h4 className="font-bold text-gray-900 mb-2">Đặt Chỗ</h4>
                    <p className="text-xs text-gray-500 mb-4 flex-1">Thanh toán 100% khi nhận phòng.</p>
                    <p className="font-bold text-yellow-600 text-lg">0 đ</p>
                  </div>
                  
                  <div 
                    onClick={() => setBookingType('deposit')}
                    className={`p-6 border-2 rounded-sm cursor-pointer transition-all flex flex-col ${bookingType === 'deposit' ? 'border-yellow-500 bg-yellow-50/50' : 'border-gray-100 hover:border-yellow-200'}`}
                  >
                    <h4 className="font-bold text-gray-900 mb-2">Cọc Giữ Chỗ (50%)</h4>
                    <p className="text-xs text-gray-500 mb-4 flex-1">Thanh toán 50% để giữ chắc chắn phòng.</p>
                    <p className="font-bold text-yellow-600 text-lg">{(totalPrice * 0.5).toLocaleString()} đ</p>
                  </div>

                  <div 
                    onClick={() => setBookingType('full')}
                    className={`p-6 border-2 rounded-sm cursor-pointer transition-all flex flex-col ${bookingType === 'full' ? 'border-yellow-500 bg-yellow-50/50' : 'border-gray-100 hover:border-yellow-200'}`}
                  >
                    <h4 className="font-bold text-gray-900 mb-2">Thanh Toán Trước</h4>
                    <p className="text-xs text-gray-500 mb-4 flex-1">Thanh toán 100% để thủ tục nhận phòng nhanh chóng.</p>
                    <p className="font-bold text-yellow-600 text-lg">{totalPrice.toLocaleString()} đ</p>
                  </div>
                </div>

                {bookingType !== 'reserve' && (
                  <>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-6">2. Phương thức thanh toán</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                      <div 
                        onClick={() => setPaymentMethod('qr')}
                        className={`p-6 border-2 rounded-sm cursor-pointer transition-all flex flex-col items-center justify-center text-center ${paymentMethod === 'qr' ? 'border-yellow-500 bg-yellow-50/50' : 'border-gray-100 hover:border-yellow-200'}`}
                      >
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600 font-bold text-xl">QR</div>
                        <h4 className="font-bold text-gray-900">Chuyển Khoản VietQR</h4>
                        <p className="text-xs text-gray-500 mt-2">Nhanh chóng, tự động duyệt</p>
                      </div>
                      
                      <div 
                        onClick={() => setPaymentMethod('momo')}
                        className={`p-6 border-2 rounded-sm cursor-pointer transition-all flex flex-col items-center justify-center text-center ${paymentMethod === 'momo' ? 'border-yellow-500 bg-yellow-50/50' : 'border-gray-100 hover:border-yellow-200'}`}
                      >
                        <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4 text-pink-600 font-bold text-xl">MoMo</div>
                        <h4 className="font-bold text-gray-900">Ví MoMo</h4>
                        <p className="text-xs text-gray-500 mt-2">Quét mã tiện lợi</p>
                      </div>
                    </div>
                  </>
                )}

                <div className="bg-[#F9F8F6] p-8 rounded-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                  {bookingType !== 'reserve' && (
                    <div className="w-48 h-48 bg-white border border-gray-200 shadow-sm p-2 flex items-center justify-center mb-6">
                      {/* Mock QR Code Image */}
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center border-4 border-gray-800 border-dashed">
                        <span className="text-xs font-bold text-gray-400 uppercase text-center">Mã QR Ảo<br/>{paymentMethod === 'qr' ? 'VietQR' : 'MoMo'}</span>
                      </div>
                    </div>
                  )}
                  
                  {bookingType !== 'reserve' ? (
                    <>
                      <h4 className="font-serif text-2xl text-gray-900 mb-2">Quét mã để thanh toán</h4>
                      <p className="text-sm text-gray-500 font-light mb-2">Số tiền cần thanh toán ngay:</p>
                    </>
                  ) : (
                    <>
                      <h4 className="font-serif text-2xl text-gray-900 mb-2">Xác nhận đặt chỗ</h4>
                      <p className="text-sm text-gray-500 font-light mb-2">Số tiền thanh toán khi nhận phòng:</p>
                    </>
                  )}
                  
                  <p className="font-serif text-3xl font-bold text-yellow-600 mb-6">{amountToPay > 0 ? amountToPay.toLocaleString() : totalPrice.toLocaleString()} đ</p>
                  
                  <div className="flex space-x-4">
                    <button 
                      onClick={() => setStep(3)}
                      className="px-8 py-3 text-gray-500 uppercase tracking-widest text-xs font-bold hover:text-gray-900 transition-colors"
                    >
                      Quay lại
                    </button>
                    <button 
                      onClick={handlePaymentSubmit}
                      disabled={isProcessing}
                      className="px-8 py-3 bg-[#1C1A17] text-white uppercase tracking-widest text-xs font-bold hover:bg-yellow-600 transition-colors shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isProcessing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang xử lý...
                        </>
                      ) : (
                        bookingType === 'reserve' ? 'Xác Nhận Đặt Chỗ' : 'Đã Thanh Toán'
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div 
                key="step5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center max-w-xl mx-auto"
              >
                <div className="w-24 h-24 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mb-8">
                  <CheckCircle2 size={48} className="text-green-500" />
                </div>
                <h2 className="text-4xl lg:text-5xl font-serif text-[#1C1A17] mb-6">Hoàn Tất Đặt Phòng</h2>
                <p className="text-gray-500 leading-relaxed mb-8 text-sm">
                  Cảm ơn bạn đã tin tưởng lựa chọn Sunset. Mã xác nhận đã được tạo. <br/>
                  Hệ thống đã tự động gửi vé điện tử đến email <strong className="text-gray-900">{email}</strong>.
                </p>
                
                <div className="w-full bg-white border border-gray-200 p-8 mb-8 text-left rounded-sm shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500"></div>
                  <div className="flex justify-between border-b border-gray-100 pb-4 mb-4">
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500">Mã Booking</span>
                    <span className="font-bold text-gray-900">{bookingId}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-4 mb-4">
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500">Khách hàng</span>
                    <span className="font-medium text-gray-900">{name}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-4 mb-4">
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500">Đã thanh toán ({bookingType === 'reserve' ? '0%' : (bookingType === 'deposit' ? '50%' : '100%')})</span>
                    <span className="font-serif text-xl font-bold text-yellow-600">{amountToPay.toLocaleString()}đ</span>
                  </div>
                  {amountToPay < totalPrice && (
                    <div className="flex justify-between pt-2">
                      <span className="text-xs uppercase font-bold tracking-[0.2em] text-gray-900">Còn lại thanh toán sau</span>
                      <span className="font-serif text-xl font-bold text-gray-900">{(totalPrice - amountToPay).toLocaleString()}đ</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                  <button 
                    onClick={() => {
                      const event = new CustomEvent('openEmailPreview');
                      window.dispatchEvent(event);
                    }}
                    className="px-8 py-4 bg-yellow-50 text-yellow-700 border border-yellow-200 uppercase tracking-[0.1em] text-xs font-bold hover:bg-yellow-100 transition-colors rounded-sm shadow-sm flex items-center justify-center"
                  >
                    <Mail size={16} className="mr-2" /> Xem trước Email (Demo)
                  </button>

                  <button 
                    onClick={() => navigate('/customer')}
                    className="px-8 py-4 bg-[#1C1A17] text-white uppercase tracking-[0.2em] text-xs font-bold hover:bg-yellow-600 transition-colors rounded-sm shadow-xl"
                  >
                    Trở Về Trang Chủ
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sticky Sidebar (Summary) */}
        {step < 4 && (
          <div className="w-full xl:w-[380px] shrink-0 mt-12 xl:mt-0">
            <div className="sticky top-32 bg-white rounded-sm shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
              <div className="bg-[#1C1A17] text-white p-6 text-center">
                <h3 className="font-serif text-xl tracking-wide">Tóm Tắt Đặt Phòng</h3>
              </div>
              <div className="p-8 space-y-8">
                
                {/* Room Info */}
                <div className={`${!selectedRoomDetails && 'opacity-50'}`}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">Không Gian</p>
                  <p className="font-bold text-lg text-gray-900">{selectedRoomDetails ? selectedRoomDetails.name : 'Chưa chọn'}</p>
                  <p className="text-xs text-gray-500 mt-2">{selectedBranchDetails?.name}</p>
                </div>

                {/* Date Info */}
                <div className={`${(!checkIn || !checkOut) && 'opacity-50'} border-t border-gray-100 pt-6`}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">Thời Gian</p>
                  {checkIn && checkOut ? (
                    <div>
                      <p className="text-gray-900 text-sm font-medium">
                        {new Date(checkIn).toLocaleDateString('vi-VN')} <span className="text-gray-300 mx-2">→</span> {new Date(checkOut).toLocaleDateString('vi-VN')}
                      </p>
                      <p className="text-yellow-600 text-xs mt-2 font-bold">{nights} đêm • {guests} khách</p>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic text-sm">Vui lòng chọn ngày</p>
                  )}
                </div>

                {/* Price Breakdown */}
                {selectedRoomDetails && nights > 0 && !overlapError && (
                  <div className="border-t border-gray-100 pt-6 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tiền phòng ({nights} đêm)</span>
                      <span className="font-medium text-gray-900">{roomTotal.toLocaleString()}đ</span>
                    </div>
                    {weekendSurcharge > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Phụ thu cuối tuần</span>
                        <span className="font-medium text-gray-900">+{weekendSurcharge.toLocaleString()}đ</span>
                      </div>
                    )}
                    {selectedAddons.map(addonId => {
                      const a = ADDONS.find(x => x.id === addonId);
                      return a ? (
                        <div key={a.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">{a.name}</span>
                          <span className="font-medium text-gray-900">+{a.price.toLocaleString()}đ</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}

                <div className="pt-8 border-t border-gray-900 flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-900 block mb-1">Tổng cộng</span>
                    <span className="text-[10px] text-gray-400">Đã bao gồm VAT</span>
                  </div>
                  <span className="text-2xl font-serif font-bold text-yellow-600">{totalPrice.toLocaleString()}đ</span>
                </div>

                {step === 3 && (
                  <div className="pt-4">
                    <button 
                      disabled={!isValid}
                      onClick={handleConfirmInfo}
                      className="w-full py-4 bg-yellow-600 text-white uppercase tracking-[0.2em] text-xs font-bold rounded-sm shadow-xl shadow-yellow-600/30 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-700 transition-all"
                    >
                      Tiếp tục Thanh Toán
                    </button>
                    {!isValid && !overlapError && (
                      <p className="text-[10px] text-gray-500 text-center mt-4 uppercase tracking-[0.1em] font-bold">Vui lòng điền thông tin (*) để tiếp tục</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
      <EmailPreviewModal 
        bookingId={bookingId} 
        name={name} 
        email={email} 
        roomName={selectedRoomDetails?.name} 
        branchName={selectedBranchDetails?.name}
        checkIn={checkIn}
        checkOut={checkOut}
        amountPaid={amountToPay}
        totalPrice={totalPrice}
      />
    </motion.div>
  );
}

function EmailPreviewModal({ bookingId, name, email, roomName, branchName, checkIn, checkOut, amountPaid, totalPrice }: any) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('openEmailPreview', handleOpen);
    return () => window.removeEventListener('openEmailPreview', handleOpen);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#f2f2f2] w-full max-w-2xl h-full md:h-auto max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl relative flex flex-col"
      >
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-700 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Email Client Header */}
        <div className="bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <p className="text-xs text-gray-500 font-medium mb-1">Tin nhắn mới</p>
          <h2 className="text-xl font-medium text-gray-900 mb-4">Xác nhận đặt phòng tại Sunset Home - {bookingId}</h2>
          <div className="flex items-center text-sm">
            <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold mr-3">S</div>
            <div>
              <p className="font-semibold text-gray-900">Sunset Home Booking &lt;noreply@sunsethome.vn&gt;</p>
              <p className="text-gray-500 text-xs">Tới: {email}</p>
            </div>
          </div>
        </div>

        {/* Email Content */}
        <div className="p-6 md:p-10 bg-white m-6 rounded-lg border border-gray-200 shadow-sm font-sans">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif tracking-[0.2em] uppercase text-yellow-600 mb-2">Sunset Home</h1>
            <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Boutique Homestay</p>
          </div>

          <h2 className="text-2xl font-serif text-gray-900 mb-4">Xin chào {name},</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Cảm ơn bạn đã lựa chọn <strong>Sunset Home</strong> cho kỳ nghỉ sắp tới. Chúng tôi rất vui mừng xác nhận đơn đặt phòng của bạn đã được ghi nhận thành công trên hệ thống. 
            Dưới đây là thông tin vé điện tử của bạn:
          </p>

          <div className="bg-[#F9F8F6] p-6 rounded-sm border border-gray-200 mb-8">
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
              <span className="text-gray-500 uppercase text-xs font-bold tracking-widest">Mã Booking</span>
              <span className="text-lg font-bold text-gray-900">{bookingId}</span>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Cơ sở:</span>
                <span className="font-semibold text-gray-900">{branchName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phòng:</span>
                <span className="font-semibold text-gray-900">{roomName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Nhận phòng:</span>
                <span className="font-semibold text-gray-900">{checkIn ? new Date(checkIn).toLocaleDateString('vi-VN') : ''} (Từ 14:00)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Trả phòng:</span>
                <span className="font-semibold text-gray-900">{checkOut ? new Date(checkOut).toLocaleDateString('vi-VN') : ''} (Trước 12:00)</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Tổng chi phí:</span>
                <span className="font-semibold text-gray-900">{totalPrice.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Đã thanh toán:</span>
                <span className="font-semibold text-green-600">{amountPaid.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold uppercase text-xs mt-1">Còn lại cần thanh toán:</span>
                <span className="font-bold text-red-600 text-lg">{(totalPrice - amountPaid).toLocaleString()}đ</span>
              </div>
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed mb-8">
            Khi đến nhận phòng, quý khách vui lòng đọc mã số Booking <strong>{bookingId}</strong> hoặc đưa email này cho nhân viên lễ tân.
            Nếu bạn có bất kỳ thắc mắc nào, xin vui lòng liên hệ hotline: <strong>0909 123 456</strong>.
          </p>

          <div className="text-center pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-xs font-light">
              Đây là email tự động, vui lòng không trả lời email này.<br/>
              © 2024 Sunset Home. All rights reserved.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
