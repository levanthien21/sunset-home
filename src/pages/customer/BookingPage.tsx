import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin, Users, Clock, CalendarDays, PlusCircle, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BRANCHES = [
  { id: 1, name: 'Chi nhánh 1 (Bến Lức)', address: 'Số 06 Block A3 Ehome Waterpoint Bến Lức', img: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80', hasRooms: true },
  { id: 2, name: 'Chi nhánh 2 (Hậu Nghĩa)', address: 'Số A3 Kdc Young Town Hậu Nghĩa', img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80', hasRooms: false },
];

const ROOMS = [
  {
    id: 101, branchId: 1, name: 'Room 3',
    features: ['Bồn tắm', 'Máy chiếu', 'Bếp (hạn chế dụng cụ)'],
    images: [
       '/images/room3_1.png',
       '/images/room3_2.png',
       '/images/room3_3.jpg',
       '/images/room3_4.png',
       '/images/room3_5.png',
       '/images/room3_6.jpg',
       '/images/room3_7.png'
    ],
    extraHourPrice: 50000,
    combos: [
      { id: '3h', name: 'Combo 3h', price: 270000 },
      { id: '5h', name: 'Combo 5h', price: 370000 },
      { id: '8h', name: '8 tiếng ngày', price: 529000 },
      { id: '10h', name: '10 tiếng đêm', price: 379000 },
    ]
  },
  {
    id: 102, branchId: 1, name: 'Room 2',
    features: ['View ban công', 'Tivi lớn', 'Bếp'],
    images: [
       '/images/room2_1.jpg',
       '/images/room2_2.jpg',
       '/images/room2_3.png',
       '/images/room2_4.jpg'
    ],
    extraHourPrice: 55000,
    combos: [
      { id: '2h', name: 'Combo 2h', price: 249000 },
      { id: '5h', name: 'Combo 5h', price: 409000 },
      { id: '8h', name: '8 tiếng ngày', price: 649000 },
      { id: '10h', name: '10 tiếng đêm', price: 519000 },
    ]
  },
  {
    id: 103, branchId: 1, name: 'Room 1',
    features: ['Tivi lớn', 'Gương toàn thân', 'KHÔNG bếp'],
    images: [
       '/images/room1_1.png',
       '/images/room1_2.png',
       '/images/room1_3.png',
       '/images/room1_4.png'
    ],
    extraHourPrice: 45000,
    combos: [
      { id: '3h', name: 'Combo 3h', price: 249000 },
      { id: '5h', name: 'Combo 5h', price: 339000 },
      { id: '8h', name: '8 tiếng ngày', price: 499000 },
      { id: '10h', name: '10 tiếng đêm', price: 355000 },
    ]
  }
];

export default function BookingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [branch, setBranch] = useState<number | null>(null);
  const [room, setRoom] = useState<number | null>(null);
  
  // Modal hiển thị ảnh
  const [lightbox, setLightbox] = useState<{images: string[], currentIndex: number} | null>(null);
  
  // Thời gian & Combo
  const [bookingDate, setBookingDate] = useState('');
  const [expectedTime, setExpectedTime] = useState('');
  const [combo, setCombo] = useState('');
  const [extraHours, setExtraHours] = useState(0);
  const [guests, setGuests] = useState(2);
  
  // Customer Info
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  const [bookingId, setBookingId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Data Logic
  const filteredRooms = ROOMS.filter(r => r.branchId === branch);
  const selectedBranchDetails = BRANCHES.find(b => b.id === branch);
  const selectedRoomDetails = ROOMS.find(r => r.id === room);
  const selectedComboDetails = selectedRoomDetails?.combos.find(c => c.id === combo);

  const [existingBookings, setExistingBookings] = useState<any[]>([]);

  useEffect(() => {
    // Read branch from URL if present
    const params = new URLSearchParams(window.location.search);
    const branchParam = params.get('branch');
    if (branchParam) {
      setBranch(parseInt(branchParam));
      setStep(2); // Skip directly to room selection
    }

    const fetchDB = async () => {
      try {
        const { getBookings } = await import('../../utils/db');
        setExistingBookings(await getBookings());
      } catch (e) {
        console.error(e);
      }
    };
    fetchDB();
  }, []);

  const { comboPrice, weekendSurcharge, extraHourTotal, guestSurcharge, totalPrice } = useMemo(() => {
    if (!selectedRoomDetails || !selectedComboDetails) return { comboPrice: 0, weekendSurcharge: 0, extraHourTotal: 0, guestSurcharge: 0, totalPrice: 0 };
    
    const base = selectedComboDetails.price;
    let weekend = 0;
    if (bookingDate) {
      const d = new Date(bookingDate);
      if (d.getDay() === 0 || d.getDay() === 6) weekend = 50000;
    }
    const extraH = extraHours * selectedRoomDetails.extraHourPrice;
    const extraG = guests > 2 ? (guests - 2) * 100000 : 0;

    return {
      comboPrice: base,
      weekendSurcharge: weekend,
      extraHourTotal: extraH,
      guestSurcharge: extraG,
      totalPrice: base + weekend + extraH + extraG
    };
  }, [bookingDate, extraHours, guests, selectedRoomDetails, selectedComboDetails]);

  // Luôn luôn thanh toán 100%
  const amountToPay = totalPrice;

  const isPhoneValid = /^(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(phone);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isStep2Valid = bookingDate && expectedTime && combo;
  const isStep3Valid = name.trim().length > 2 && isPhoneValid && isEmailValid;

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
        checkIn: `${bookingDate} ${expectedTime}`, // Packed for old schema
        checkOut: `${selectedComboDetails?.name}${extraHours > 0 ? ` (+${extraHours}h)` : ''}`, // Packed for old schema
        guests,
        addons: [],
        total: totalPrice,
        amountPaid: amountToPay,
        bookingType: 'full',
        status: 'pending',
        date: new Date().toISOString(),
        paymentMethod: 'qr'
      };
      
      try {
        const { addBooking } = await import('../../utils/db');
        await addBooking(newBooking);
      } catch(e) {}

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
              check_in: `${new Date(bookingDate).toLocaleDateString('vi-VN')} lúc ${expectedTime}`,
              check_out: `${selectedComboDetails?.name} ${extraHours > 0 ? `(+${extraHours}h)` : ''}`,
              total_price: totalPrice.toLocaleString() + 'đ',
              amount_paid: amountToPay.toLocaleString() + 'đ',
              amount_due: (totalPrice - amountToPay).toLocaleString() + 'đ'
            },
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY
          );
        }
      } catch (error: any) {
        console.error("Lỗi khi gửi email:", error);
      }

      setIsProcessing(false);
      setStep(5); // Success step
    }, 1500);
  };

  const isRoomAvailableToday = (roomName: string) => {
    const today = new Date().toISOString().split('T')[0];
    const bookingsToday = existingBookings.filter(b => b.roomName === roomName && b.checkIn?.startsWith(today) && b.status !== 'cancelled');
    return bookingsToday.length < 3; 
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Steps */}
        <div className="mb-8">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/')} className="flex items-center text-stone-500 hover:text-stone-900 mb-6">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại
          </button>
          
          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute left-0 top-1/2 w-full h-0.5 bg-stone-200 -z-10" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`flex flex-col items-center bg-stone-50 px-2 ${step >= i ? 'text-yellow-600' : 'text-stone-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold mb-2 ${step >= i ? 'bg-yellow-600 text-white' : 'bg-stone-200 text-stone-500'}`}>
                  {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
                </div>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6 text-center">Bạn muốn đến cơ sở nào?</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {BRANCHES.map(b => (
                  <button
                    key={b.id}
                    onClick={() => {
                      if (!b.hasRooms) return;
                      setBranch(b.id);
                      setRoom(null);
                      setStep(2);
                    }}
                    className={`text-left rounded-2xl overflow-hidden border-2 transition-all ${!b.hasRooms ? 'opacity-50 cursor-not-allowed' : 'hover:border-yellow-600 border-stone-200 bg-white'}`}
                  >
                    <div className="h-40 relative">
                      <img src={b.img} alt={b.name} className="w-full h-full object-cover" />
                      {!b.hasRooms && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-semibold px-4 py-2 bg-stone-900/80 rounded-full">Sắp ra mắt</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-stone-900">{b.name}</h3>
                      <p className="text-stone-500 text-sm flex items-start mt-2">
                        <MapPin className="w-4 h-4 mr-1 shrink-0 mt-0.5" />
                        {b.address}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">Chọn không gian của bạn</h2>
                <p className="text-stone-500">{selectedBranchDetails?.name}</p>
              </div>

              <div className="space-y-6">
                {filteredRooms.map(r => {
                  const isAvailable = isRoomAvailableToday(r.name);
                  const isSelected = room === r.id;
                  
                  return (
                    <div key={r.id} className={`bg-white rounded-2xl border-2 transition-all overflow-hidden ${isSelected ? 'border-yellow-600 shadow-md' : 'border-stone-200'}`}>
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-2/5 p-3">
                          <div className="relative h-48 md:h-full group">
                            <img 
                              src={r.images[0]} 
                              onClick={() => setLightbox({ images: r.images, currentIndex: 0 })}
                              className="w-full h-full object-cover rounded-xl cursor-pointer" 
                              alt={r.name} 
                            />
                            {r.images.length > 1 && (
                              <button 
                                onClick={() => setLightbox({ images: r.images, currentIndex: 0 })}
                                className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-black/90 transition-colors flex items-center shadow-lg backdrop-blur-sm"
                              >
                                Xem tất cả {r.images.length} ảnh
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="p-5 md:w-3/5 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-xl font-bold text-stone-900">{r.name}</h3>
                              {isAvailable ? (
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center">
                                  <Check className="w-3 h-3 mr-1" /> Hôm nay ({new Date().toLocaleDateString('vi-VN').substring(0,5)}): Trống
                                </span>
                              ) : (
                                <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                  Hôm nay: Kín lịch
                                </span>
                              )}
                            </div>
                            <ul className="space-y-2 mt-4">
                              {r.features.map((f, i) => (
                                <li key={i} className="flex items-center text-sm text-stone-600">
                                  <CheckCircle2 className="w-4 h-4 text-yellow-600 mr-2 shrink-0" />
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="mt-6 flex gap-3">
                            <button
                              onClick={() => { setRoom(r.id); setCombo(''); setStep(3); }}
                              className="w-full py-3 bg-stone-900 text-white font-semibold rounded-xl hover:bg-stone-800 transition"
                            >
                              Chọn phòng này
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-stone-200">
                <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">Chọn thời gian (Combo)</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Ngày nhận phòng</label>
                    <div className="relative">
                      <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-yellow-600 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Gói Combo của {selectedRoomDetails?.name}</label>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedRoomDetails?.combos.map(c => (
                        <button
                          key={c.id}
                          onClick={() => setCombo(c.id)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${combo === c.id ? 'border-yellow-600 bg-yellow-50' : 'border-stone-200 hover:border-stone-300'}`}
                        >
                          <div className="font-bold text-stone-900">{c.name}</div>
                          <div className="text-yellow-600 font-semibold">{c.price.toLocaleString()}đ</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">Giờ đến dự kiến</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
                        <input
                          type="time"
                          value={expectedTime}
                          onChange={(e) => setExpectedTime(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-yellow-600 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">Thêm giờ (+{(selectedRoomDetails?.extraHourPrice || 0).toLocaleString()}đ/h)</label>
                      <div className="relative">
                        <PlusCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={extraHours}
                          onChange={(e) => setExtraHours(parseInt(e.target.value) || 0)}
                          className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-yellow-600 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Số khách (Phụ thu 100k/người từ khách thứ 3)</label>
                    <div className="flex items-center space-x-4 bg-stone-50 p-2 rounded-xl border border-stone-200 w-fit">
                      <button onClick={() => guests > 1 && setGuests(guests - 1)} className="w-10 h-10 rounded-lg bg-white shadow flex items-center justify-center font-bold">-</button>
                      <span className="w-12 text-center font-bold">{guests}</span>
                      <button onClick={() => setGuests(guests + 1)} className="w-10 h-10 rounded-lg bg-white shadow flex items-center justify-center font-bold">+</button>
                    </div>
                  </div>
                  
                  <div className="bg-stone-50 p-4 rounded-xl space-y-2 text-sm text-stone-600">
                    <div className="flex justify-between">
                      <span>Giá Combo ({selectedComboDetails?.name || 'Chưa chọn'}):</span>
                      <span className="font-semibold text-stone-900">{comboPrice.toLocaleString()}đ</span>
                    </div>
                    {extraHourTotal > 0 && (
                      <div className="flex justify-between">
                        <span>Thêm {extraHours} giờ:</span>
                        <span className="font-semibold text-stone-900">{extraHourTotal.toLocaleString()}đ</span>
                      </div>
                    )}
                    {weekendSurcharge > 0 && (
                      <div className="flex justify-between">
                        <span>Phụ thu cuối tuần (T7, CN):</span>
                        <span className="font-semibold text-stone-900">{weekendSurcharge.toLocaleString()}đ</span>
                      </div>
                    )}
                    {guestSurcharge > 0 && (
                      <div className="flex justify-between">
                        <span>Phụ thu thêm {guests - 2} khách:</span>
                        <span className="font-semibold text-stone-900">{guestSurcharge.toLocaleString()}đ</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-lg text-stone-900">
                      <span>Tổng tạm tính:</span>
                      <span className="text-yellow-600">{totalPrice.toLocaleString()}đ</span>
                    </div>
                  </div>

                  <button
                    onClick={() => isStep2Valid && setStep(4)}
                    disabled={!isStep2Valid}
                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all ${
                      isStep2Valid ? 'bg-stone-900 text-white hover:bg-stone-800' : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    Tiếp tục
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-stone-200">
                    <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">Thông tin liên hệ</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-2">Họ và tên *</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Nguyễn Văn A"
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-yellow-600 outline-none"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-stone-700 mb-2">Số điện thoại *</label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="0901234567"
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-yellow-600 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-stone-700 mb-2">Email * (Để nhận vé điện tử)</label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nguyenvana@gmail.com"
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-yellow-600 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bỏ lựa chọn cọc/giữ chỗ, mặc định hiển thị thông báo thanh toán 100% */}
                  <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-stone-200">
                    <h2 className="text-xl font-serif font-bold text-stone-900 mb-4">Phương thức thanh toán</h2>
                    <div className="w-full p-4 rounded-xl border-2 border-yellow-600 bg-yellow-50 text-left flex items-start transition-all">
                      <div className="mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 shrink-0 border-yellow-600">
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-600" />
                      </div>
                      <div>
                        <div className="font-bold text-stone-900">Thanh toán 100%</div>
                        <div className="text-sm text-stone-500 mt-1">Quý khách vui lòng thanh toán toàn bộ qua mã QR để được giữ phòng chắc chắn nhất.</div>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="lg:col-span-1">
                  <div className="bg-stone-900 text-white rounded-3xl p-6 sticky top-24">
                    <h3 className="font-serif font-bold text-xl mb-4">Chi tiết đặt phòng</h3>
                    <div className="space-y-4 text-sm text-stone-300 mb-6">
                      <div className="flex items-start">
                        <MapPin className="w-5 h-5 mr-3 text-yellow-500 shrink-0" />
                        <div>
                          <p className="font-semibold text-white">{selectedRoomDetails?.name}</p>
                          <p>{selectedBranchDetails?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CalendarDays className="w-5 h-5 mr-3 text-yellow-500 shrink-0" />
                        <div>
                          <p className="font-semibold text-white">{new Date(bookingDate).toLocaleDateString('vi-VN')}</p>
                          <p>Giờ đến: {expectedTime}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Clock className="w-5 h-5 mr-3 text-yellow-500 shrink-0" />
                        <div>
                          <p className="font-semibold text-white">Gói: {selectedComboDetails?.name}</p>
                          <p>Thêm giờ: {extraHours}h</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-5 h-5 mr-3 text-yellow-500 shrink-0" />
                        <span className="font-semibold text-white">{guests} khách</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-stone-700 pt-4 mb-6">
                      <div className="flex justify-between text-lg font-bold text-white mb-2">
                        <span>Cần thanh toán</span>
                        <span className="text-yellow-500">{amountToPay.toLocaleString()}đ</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 mb-6 flex flex-col items-center text-stone-900">
                      <img 
                        src={`https://api.vietqr.io/image/970436-0909123456-11kRsXo.jpg?amount=${amountToPay}&addInfo=Thanh toan Sunset Home`}
                        alt="VietQR" 
                        className="w-48 h-48 rounded-lg mb-2"
                      />
                      <p className="text-xs font-bold text-center">Quét mã QR để thanh toán {amountToPay.toLocaleString()}đ</p>
                    </div>

                    <button
                      onClick={handlePaymentSubmit}
                      disabled={!isStep3Valid || isProcessing}
                      className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all ${
                        isStep3Valid && !isProcessing ? 'bg-yellow-600 text-white hover:bg-yellow-500' : 'bg-stone-700 text-stone-500 cursor-not-allowed'
                      }`}
                    >
                      {isProcessing ? 'Đang xử lý...' : 'Tôi đã chuyển khoản'}
                    </button>
                    {!isStep3Valid && (
                      <p className="text-xs text-center text-red-400 mt-3">* Vui lòng điền đầy đủ và chính xác thông tin liên hệ</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center bg-white p-10 rounded-3xl shadow-sm border border-stone-200">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">Hoàn tất thành công!</h2>
              <p className="text-stone-600 mb-8">
                Cảm ơn bạn đã chọn Sunset Home. Mã đặt phòng <strong>{bookingId}</strong> đã được lưu trên hệ thống và vé điện tử đã được gửi tới email của bạn.
              </p>
              
              <button
                onClick={() => navigate('/')}
                className="w-full py-4 bg-stone-900 text-white font-bold rounded-xl hover:bg-stone-800 transition"
              >
                Về trang chủ
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal Zoom Ảnh */}
      {/* Modal Zoom Ảnh */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
            onClick={() => setLightbox(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors z-50"
              onClick={() => setLightbox(null)}
            >
              <X className="w-8 h-8" />
            </button>

            {lightbox.images.length > 1 && (
              <button 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 z-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox({
                    ...lightbox,
                    currentIndex: lightbox.currentIndex === 0 ? lightbox.images.length - 1 : lightbox.currentIndex - 1
                  });
                }}
              >
                <ArrowLeft className="w-10 h-10" />
              </button>
            )}

            <motion.img 
              key={lightbox.currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              src={lightbox.images[lightbox.currentIndex]} 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              alt="Phong To" 
              onClick={(e) => e.stopPropagation()} 
            />

            {lightbox.images.length > 1 && (
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 z-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox({
                    ...lightbox,
                    currentIndex: lightbox.currentIndex === lightbox.images.length - 1 ? 0 : lightbox.currentIndex + 1
                  });
                }}
              >
                <ArrowRight className="w-10 h-10" />
              </button>
            )}
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium tracking-widest bg-black/50 px-4 py-2 rounded-full">
              {lightbox.currentIndex + 1} / {lightbox.images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
