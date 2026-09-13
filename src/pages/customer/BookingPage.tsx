import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin, Users, Clock, CalendarDays, PlusCircle, X, ChevronRight, BedDouble, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateBookingStatus } from '../../utils/db';

export default function BookingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [branch, setBranch] = useState<number | null>(null);
  const [room, setRoom] = useState<string | null>(null);
  
  const [branches, setBranches] = useState<any[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  
  // Modal hiển thị ảnh
  const [lightbox, setLightbox] = useState<{images: string[], currentIndex: number} | null>(null);
  
  // Thời gian & Combo
  const [bookingDate, setBookingDate] = useState(() => {
    const d = new Date();
    // Adjust to Vietnam timezone (UTC+7) for accurate local date
    const vnTime = new Date(d.getTime() + (7 * 60 * 60 * 1000));
    return vnTime.toISOString().split('T')[0];
  });
  const [expectedTime, setExpectedTime] = useState('');
  const [combo, setCombo] = useState('');
  const [extraHours, setExtraHours] = useState(0);
  const [guests, setGuests] = useState(2);
  
  // Customer Info
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  
  const [bookingId, setBookingId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Data Logic
  const filteredRooms = rooms.filter(r => r.branchId === branch);
  const selectedBranchDetails = branches.find(b => b.id === branch);
  const selectedRoomDetails = rooms.find(r => r.id === room);
  const selectedComboDetails = selectedRoomDetails?.combos.find((c: any) => c.id === combo);

  const [existingBookings, setExistingBookings] = useState<any[]>([]);

  useEffect(() => {
    // Read branch from URL if present
    const params = new URLSearchParams(window.location.search);
    const branchParam = params.get('branch');
    const dateParam = params.get('date');
    
    if (dateParam) {
      setBookingDate(dateParam);
    }
    
    if (branchParam) {
      setBranch(parseInt(branchParam));
      setStep(2); // Skip directly to room selection
    }

    const fetchDB = async () => {
      setIsLoadingRooms(true);
      setIsLoadingBranches(true);
      try {
        const { getBookings, getRooms, getBranches } = await import('../../utils/db');
        
        const [bookingsData, dbBranches, dbRooms] = await Promise.all([
          getBookings(),
          getBranches(),
          getRooms()
        ]);
        
        setExistingBookings(bookingsData);
        
        if (dbBranches && dbBranches.length > 0) {
          setBranches(dbBranches);
        }
        
        if (dbRooms && dbRooms.length > 0) {
          const formattedRooms = dbRooms.map((r: any) => ({
            ...r,
            branchId: r.branch_id,
            extraHourPrice: Number(r.extra_hour_price),
            combos: [
              ...(r.combos || []),
              { id: 'test-5k', name: 'Gói Test Thanh Toán 5k', price: 5000 }
            ]
          }));
          setRooms(formattedRooms);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingRooms(false);
        setIsLoadingBranches(false);
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

  const isTimeValid = useMemo(() => {
    if (!bookingDate || !expectedTime) return false;
    const now = new Date();
    const [year, month, day] = bookingDate.split('-').map(Number);
    const [hours, minutes] = expectedTime.split(':').map(Number);
    const selectedDate = new Date(year, month - 1, day, hours, minutes);
    return selectedDate >= now;
  }, [bookingDate, expectedTime]);

  const isPhoneValid = /^(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(phone);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isStep2Valid = bookingDate && expectedTime && combo && isTimeValid;
  const isStep3Valid = name.trim().length > 2 && isPhoneValid && isEmailValid;

  const handlePaymentSubmit = async () => {
    setIsProcessing(true);
    
    try {
      const { getBookings, addBooking } = await import('../../utils/db');
      
      // 1. Kiểm tra chống đặt trùng phòng (Double Booking)
      const allBookings = await getBookings();
      const sameDayBookings = allBookings.filter((b: any) => 
        b.roomName === selectedRoomDetails?.name && 
        b.checkIn?.startsWith(bookingDate) && 
        b.status !== 'cancelled'
      );

      // Nếu phòng đã được đặt 3 lần trong ngày, coi như kín lịch
      if (sameDayBookings.length >= 3) {
        alert('Rất tiếc! Phòng này vừa được khách khác đặt hết lịch trong ngày. Vui lòng chọn phòng hoặc ngày khác.');
        setIsProcessing(false);
        setStep(2);
        return;
      }

      // Nếu trùng chính xác giờ nhận phòng
      const hasExactTimeOverlap = sameDayBookings.some((b: any) => b.checkIn === `${bookingDate} ${expectedTime}`);
      if (hasExactTimeOverlap) {
        alert('Rất tiếc! Đã có khách khác vừa nhanh tay đặt phòng vào khung giờ này. Vui lòng chọn giờ đến khác.');
        setIsProcessing(false);
        return;
      }
      
      // 2. Tạo Booking
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
        checkIn: `${bookingDate} ${expectedTime}`, 
        checkOut: `${selectedComboDetails?.name}${extraHours > 0 ? ` (+${extraHours}h)` : ''}`, 
        guests,
        addons: [],
        total: totalPrice,
        amountPaid: amountToPay,
        bookingType: 'full',
        status: 'pending',
        date: new Date().toISOString(),
        paymentMethod: 'qr',
        note
      };
      
      await addBooking(newBooking);

      // 3. Gửi Email
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

      // 4. Redirect to PayOS
      try {
        const { createPayOSPaymentLink } = await import('../../utils/payos');
        const orderInfo = `Homestay Booking ${newBookingId}`;
        const payosOrderCode = parseInt(Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000)); // Generate unique number < 2^53
        
        // Cập nhật booking với mã order của PayOS để dễ tra cứu
        await updateBookingStatus(newBookingId, 'pending_payment');
        
        const paymentUrl = await createPayOSPaymentLink(amountToPay, payosOrderCode, orderInfo);
        
        // Chuyển hướng sang PayOS
        window.location.href = paymentUrl;
      } catch (err) {
        console.error("Lỗi tạo link PayOS:", err);
        setIsProcessing(false);
        setStep(4);
      }
    } catch (e) {
      console.error(e);
      alert('Có lỗi xảy ra trong quá trình đặt phòng. Vui lòng thử lại!');
      setIsProcessing(false);
    }
  };

  const isRoomAvailableToday = (roomName: string) => {
    const today = new Date().toISOString().split('T')[0];
    const bookingsToday = existingBookings.filter(b => b.roomName === roomName && b.checkIn?.startsWith(today) && b.status !== 'cancelled');
    return bookingsToday.length < 3; 
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-28 md:pt-32 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Steps */}
        <div className="mb-8">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/')} className="flex items-center text-stone-500 hover:text-stone-900 mb-6">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại
          </button>
          
          <div className="flex items-center justify-between mb-8 max-w-md mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div className={`flex flex-col items-center ${step >= i ? 'text-yellow-600' : 'text-stone-400'}`}>
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold mb-1 md:mb-2 text-xs md:text-base transition-all duration-300 ${step >= i ? 'bg-yellow-600 text-white shadow-md shadow-yellow-600/30' : 'bg-stone-200 text-stone-500'}`}>
                    {step > i ? <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" /> : i}
                  </div>
                </div>
                {i < 3 && (
                  <div className={`mx-4 md:mx-12 ${step > i ? 'text-yellow-600' : 'text-stone-300'}`}>
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6 text-center">Bạn muốn đến cơ sở nào?</h2>
              
              {isLoadingBranches ? (
                <div className="flex justify-center items-center py-20">
                  <div className="w-10 h-10 border-4 border-stone-200 border-t-yellow-600 rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {branches.map((b: any) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        if (!b.has_rooms) return;
                        setBranch(b.id);
                        setRoom(null);
                        setStep(2);
                      }}
                      className={`text-left rounded-2xl overflow-hidden border-2 transition-all ${!b.has_rooms ? 'opacity-50 cursor-not-allowed' : 'hover:border-yellow-600 border-stone-200 bg-white'}`}
                    >
                      <div className="h-40 relative">
                        <img src={b.img} alt={b.name} className="w-full h-full object-cover" />
                        {!b.has_rooms && (
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
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">Chọn không gian của bạn</h2>
              </div>

              <div className="bg-white rounded-3xl p-3 shadow-md border border-stone-100 mb-10 max-w-2xl mx-auto">
                <div className="flex-1 w-full bg-stone-50 hover:bg-stone-100 transition-colors rounded-2xl p-4 flex items-center relative cursor-pointer group">
                  <div className="bg-white p-2.5 rounded-xl shadow-sm text-yellow-600 mr-4 group-hover:scale-110 transition-transform">
                    <CalendarDays className="w-6 h-6" />
                  </div>
                  <div className="flex-1 flex flex-col">
                     <span className="text-[11px] uppercase font-bold text-stone-500 tracking-wider mb-0.5">Ngày nhận phòng</span>
                     <input
                       type="date"
                       min={new Date().toISOString().split('T')[0]}
                       value={bookingDate}
                       onChange={(e) => setBookingDate(e.target.value)}
                       className="w-full bg-transparent border-none outline-none text-stone-900 font-bold text-base md:text-lg cursor-pointer appearance-none"
                     />
                  </div>
                </div>
              </div>

              {isLoadingRooms ? (
                <div className="flex justify-center items-center py-20">
                  <div className="w-10 h-10 border-4 border-stone-200 border-t-yellow-600 rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {[...filteredRooms].sort((a, b) => a.name.localeCompare(b.name)).map(r => {
                  const isAvailable = bookingDate ? true : isRoomAvailableToday(r.name);
                  const isSelected = room === r.id;
                  
                  return (
                    <div key={r.id} className={`bg-white rounded-2xl md:rounded-3xl transition-all overflow-hidden shadow-sm hover:shadow-xl border flex flex-col ${isSelected ? 'border-yellow-600 ring-1 ring-yellow-600' : 'border-stone-200'}`}>
                      <div className="flex flex-row h-full items-stretch">
                        <div className="w-[42%] md:w-5/12 lg:w-2/5 min-h-[220px] md:min-h-[280px] relative group shrink-0 overflow-hidden">
                          <img 
                            src={r.images[0]} 
                            onClick={() => setLightbox({ images: r.images, currentIndex: 0 })}
                            className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-700" 
                            alt={r.name} 
                          />
                          {r.images.length > 1 && (
                            <button 
                              onClick={() => setLightbox({ images: r.images, currentIndex: 0 })}
                              className="absolute bottom-2 right-2 md:bottom-3 md:right-3 bg-black/60 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-[10px] md:text-xs font-semibold hover:bg-black/80 transition-colors flex items-center shadow-lg backdrop-blur-md z-10"
                            >
                              Xem {r.images.length} ảnh
                            </button>
                          )}
                          <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10">
                            {isAvailable ? (
                              <span className="px-2 py-1 md:px-3 md:py-1.5 bg-green-500/90 text-white backdrop-blur-md text-[10px] uppercase tracking-wider font-bold rounded-full shadow-md">
                                {bookingDate ? 'Đang trống' : 'Hôm nay: Trống'}
                              </span>
                            ) : (
                              <span className="px-2 py-1 md:px-3 md:py-1.5 bg-red-500/90 text-white backdrop-blur-md text-[10px] uppercase tracking-wider font-bold rounded-full shadow-md">
                                Kín lịch
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="p-4 md:p-5 lg:p-6 flex flex-col justify-between flex-1 w-[58%] md:w-7/12 lg:w-3/5">
                          <div>
                            <div className="flex justify-between items-start mb-3 md:mb-4 gap-2">
                              <div className="flex-1">
                                <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-900 leading-tight">{r.name}</h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <span className="text-[10px] font-medium bg-stone-100 text-stone-600 px-2 py-1.5 rounded-lg flex items-center">
                                    <Users className="w-3 h-3 mr-1" /> Tối đa 4 Khách
                                  </span>
                                  <span className="text-[10px] font-medium bg-stone-100 text-stone-600 px-2 py-1.5 rounded-lg flex items-center">
                                    <BedDouble className="w-3 h-3 mr-1" /> 1 Giường lớn
                                  </span>
                                </div>
                              </div>
                              {r.combos && r.combos.length > 0 && (
                                <div className="text-right shrink-0 bg-stone-50 p-2 rounded-xl border border-stone-100">
                                  <div className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded mb-1 inline-block shadow-sm">Ưu đãi 25%</div>
                                  <p className="text-[10px] md:text-xs text-stone-400 line-through">
                                    {(Math.min(...r.combos.map((c: any) => c.price)) * 1.33).toLocaleString()}đ
                                  </p>
                                  <p className="text-yellow-600 font-bold text-base md:text-lg leading-none mt-0.5">
                                    {Math.min(...r.combos.map((c: any) => c.price)).toLocaleString()}đ
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col gap-2.5 md:gap-3 mb-4 md:mb-5">
                              <div className="flex flex-wrap items-center justify-between gap-1">
                                <div className="flex items-center text-stone-500 text-[11px]">
                                  <MapPin className="w-3 h-3 mr-1 text-stone-400" />
                                  <span className="line-clamp-1">{selectedBranchDetails?.name}</span>
                                </div>
                                <button 
                                  onClick={() => window.open('https://maps.google.com/?q=' + encodeURIComponent(selectedBranchDetails?.address || ''), '_blank')}
                                  className="text-[11px] font-bold text-blue-600 hover:underline flex items-center bg-blue-50 px-2 py-1 rounded-md shrink-0"
                                >
                                  Xem bản đồ <ChevronRight className="w-2.5 h-2.5 ml-0.5" />
                                </button>
                              </div>
                              <div className="bg-green-50 border border-green-100 rounded-lg md:rounded-xl p-2.5 md:p-3 w-full shadow-sm">
                                 <p className="text-[11px] text-green-700 font-bold flex items-start mb-1">
                                   <Check className="w-3.5 h-3.5 mr-1.5 mt-0.5 shrink-0"/> Miễn phí hủy trước 7 ngày
                                 </p>
                                 <p className="text-[11px] text-green-700 font-bold flex items-start">
                                   <Check className="w-3.5 h-3.5 mr-1.5 mt-0.5 shrink-0"/> Giữ chỗ thanh toán qua QR
                                 </p>
                              </div>
                            </div>

                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-2 md:gap-y-3 mt-2">
                              {r.features.map((f: any, i: any) => (
                                <li key={i} className="flex items-center text-[11px] md:text-[12px] text-stone-600">
                                  <div className="w-4 h-4 rounded-full bg-yellow-50 flex items-center justify-center mr-1.5 md:mr-2 shrink-0">
                                    <CheckCircle2 className="w-3 h-3 text-yellow-600" />
                                  </div>
                                  <span className="truncate" title={f}>{f}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="mt-4 md:mt-8 flex justify-end">
                            <button
                              onClick={() => {
                                if (!bookingDate) {
                                  alert('Vui lòng chọn ngày nhận phòng trước!');
                                  return;
                                }
                                setRoom(r.id); 
                                setCombo(''); 
                                setStep(3); 
                              }}
                              className="w-full sm:w-auto px-5 py-3 md:px-8 md:py-3.5 bg-stone-900 text-white text-sm font-bold rounded-xl hover:bg-stone-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
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
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
                {/* Left Column: Form */}
                <div className="lg:col-span-2 space-y-6 md:space-y-8">
                  {/* Section 1: Thời gian & Combo */}
                  <div className="bg-white rounded-xl md:rounded-3xl p-4 md:p-8 shadow-sm border border-stone-200">
                    <h2 className="text-lg md:text-2xl font-serif font-bold text-stone-900 mb-4 md:mb-6 flex items-center">
                      <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center mr-2 md:mr-3 text-xs md:text-sm">1</span> 
                      Thời gian & Gói phòng
                    </h2>
                    
                    <div className="space-y-4 md:space-y-6">
                      <div>
                        <label className="block text-xs md:text-sm font-semibold text-stone-900 mb-1.5 md:mb-2">Chọn gói (Combo)</label>
                        <div className="grid grid-cols-2 gap-2 md:gap-3">
                          {selectedRoomDetails?.combos.map((c: any) => (
                            <button
                              key={c.id}
                              onClick={() => setCombo(c.id)}
                              className={`relative p-2.5 md:p-4 rounded-xl border-2 text-left transition-all overflow-hidden ${combo === c.id ? 'border-yellow-600 bg-yellow-50 shadow-sm' : 'border-stone-200 bg-white hover:border-stone-300'}`}
                            >
                              {combo === c.id && (
                                <div className="absolute top-1 right-1 md:top-2 md:right-2 text-yellow-600">
                                  <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </div>
                              )}
                              <div className={`font-bold text-xs md:text-base ${combo === c.id ? 'text-yellow-700' : 'text-stone-900'}`}>{c.name}</div>
                              <div className={`${combo === c.id ? 'text-yellow-600' : 'text-stone-500'} font-semibold text-[10px] md:text-sm mt-0.5`}>{c.price.toLocaleString()}đ</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 md:gap-4">
                        <div>
                          <label className="block text-xs md:text-sm font-semibold text-stone-900 mb-1.5 md:mb-2">Giờ đến</label>
                          <div className={`relative w-full bg-stone-50 border ${expectedTime && !isTimeValid ? 'border-red-400 focus-within:ring-red-500' : 'border-stone-200 focus-within:ring-yellow-600'} rounded-xl focus-within:bg-white focus-within:ring-2 transition-all`}>
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 w-4 h-4 md:w-5 md:h-5 pointer-events-none z-10" />
                            <input
                              type="time"
                              value={expectedTime}
                              onChange={(e) => setExpectedTime(e.target.value)}
                              className={`w-full min-w-0 pl-9 md:pl-11 pr-3 py-2.5 md:py-3 bg-transparent outline-none border-none block box-border text-base cursor-pointer appearance-none relative z-20 ${!expectedTime ? 'text-transparent' : 'text-stone-900'}`}
                            />
                            {!expectedTime && (
                              <span className="absolute left-9 md:left-11 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none z-10 text-base">
                                Chọn giờ...
                              </span>
                            )}
                          </div>
                          {expectedTime && !isTimeValid && (
                            <p className="text-[10px] md:text-xs text-red-500 mt-1 font-medium">* Giờ đã qua</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs md:text-sm font-semibold text-stone-900 mb-1.5 md:mb-2 truncate" title={`Thêm giờ (+${(selectedRoomDetails?.extraHourPrice || 0).toLocaleString()}đ/h)`}>
                            Thêm giờ (+{(selectedRoomDetails?.extraHourPrice || 0).toLocaleString()}đ)
                          </label>
                          <div className="relative w-full bg-stone-50 border border-stone-200 rounded-xl focus-within:bg-white focus-within:ring-2 focus-within:ring-yellow-600/50 focus-within:border-yellow-600 transition-all">
                            <PlusCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 w-4 h-4 md:w-5 md:h-5 pointer-events-none z-10" />
                            <input
                              type="number"
                              min="0"
                              max="10"
                              value={extraHours}
                              onChange={(e) => setExtraHours(parseInt(e.target.value) || 0)}
                              className="w-full min-w-0 pl-9 md:pl-11 pr-3 py-2.5 md:py-3 bg-transparent outline-none border-none block box-border text-base appearance-none text-stone-900 relative z-20"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 md:p-4 border border-stone-200 rounded-xl bg-stone-50">
                        <div>
                          <p className="font-semibold text-stone-900 text-xs md:text-sm">Số khách</p>
                          <p className="text-[10px] md:text-xs text-stone-500 mt-0.5">Phụ thu 100k từ người thứ 3</p>
                        </div>
                        <div className="flex items-center bg-white p-1 rounded-lg border border-stone-200 shadow-sm">
                          <button onClick={() => guests > 1 && setGuests(guests - 1)} className="w-7 h-7 md:w-9 md:h-9 rounded-md flex items-center justify-center font-bold text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors">-</button>
                          <span className="w-8 md:w-10 text-center font-bold text-stone-900 text-sm md:text-base">{guests}</span>
                          <button onClick={() => setGuests(guests + 1)} className="w-7 h-7 md:w-9 md:h-9 rounded-md flex items-center justify-center font-bold text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors">+</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Thông tin liên hệ */}
                  <div className={`bg-white rounded-xl md:rounded-3xl p-4 md:p-8 shadow-sm border transition-all ${!isStep2Valid ? 'opacity-50 pointer-events-none border-stone-200' : 'border-stone-200'}`}>
                    <h2 className="text-lg md:text-2xl font-serif font-bold text-stone-900 mb-4 md:mb-6 flex items-center">
                      <span className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center mr-2 md:mr-3 text-xs md:text-sm ${isStep2Valid ? 'bg-yellow-100 text-yellow-700' : 'bg-stone-100 text-stone-400'}`}>2</span> 
                      Thông tin liên hệ
                    </h2>
                    <div className="space-y-3 md:space-y-4">
                      <div>
                        <label className="block text-xs md:text-sm font-semibold text-stone-700 mb-1.5 md:mb-2">Họ và tên *</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Nguyễn Văn A"
                          className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-yellow-600/50 focus:border-yellow-600 outline-none transition-all text-base"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-3 md:gap-4">
                        <div>
                          <label className="block text-xs md:text-sm font-semibold text-stone-700 mb-1.5 md:mb-2">Số điện thoại *</label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="0901234567"
                            className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-yellow-600/50 focus:border-yellow-600 outline-none transition-all text-base"
                          />
                        </div>
                        <div>
                          <label className="block text-xs md:text-sm font-semibold text-stone-700 mb-1.5 md:mb-2">Email * (Để nhận vé điện tử)</label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nguyenvana@gmail.com"
                            className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-yellow-600/50 focus:border-yellow-600 outline-none transition-all text-base"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-semibold text-stone-700 mb-1.5 md:mb-2">Ghi chú (Không bắt buộc)</label>
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Yêu cầu đặc biệt, lưu ý thêm cho homestay..."
                          rows={2}
                          className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-yellow-600/50 focus:border-yellow-600 outline-none transition-all text-base resize-none"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Order Summary & Checkout */}
                <div className="lg:col-span-1">
                  <div className="bg-stone-900 rounded-xl md:rounded-3xl p-5 md:p-6 sticky top-24 shadow-2xl border border-stone-800 text-stone-100">
                    <h3 className="font-serif font-bold text-lg md:text-xl text-white mb-5 md:mb-6 flex items-center">
                      <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-yellow-600/20 text-yellow-500 flex items-center justify-center mr-2 md:mr-3 text-xs md:text-sm">3</span> 
                      Chi tiết thanh toán
                    </h3>
                    
                    <div className="mb-5 md:mb-6 border-b border-stone-700/50 pb-5">
                      <h4 className="font-bold text-lg md:text-xl text-white leading-tight">{selectedRoomDetails?.name}</h4>
                      <p className="text-xs md:text-sm text-stone-400 mt-1.5 flex items-start">
                         <MapPin className="w-3.5 h-3.5 mr-1.5 mt-0.5 shrink-0 text-yellow-600" /> {selectedBranchDetails?.name}
                      </p>
                    </div>

                    <div className="space-y-3 text-sm text-stone-300 mb-5 md:mb-6 bg-stone-800/40 p-4 rounded-xl border border-stone-700/50">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center"><CalendarDays className="w-4 h-4 mr-2 text-stone-500" /> Ngày nhận</span>
                        <span className="font-bold text-white">{new Date(bookingDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center"><Clock className="w-4 h-4 mr-2 text-stone-500" /> Giờ đến</span>
                        <span className="font-bold text-white">{expectedTime || '--:--'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center"><Users className="w-4 h-4 mr-2 text-stone-500" /> Số khách</span>
                        <span className="font-bold text-white">{guests}</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-dashed border-stone-700 pt-5 md:pt-6 mb-5 md:mb-6 space-y-3 text-sm text-stone-400">
                      <div className="flex justify-between items-center">
                        <span>Gói: {selectedComboDetails?.name || 'Chưa chọn'}</span>
                        <span className="font-medium text-white">{comboPrice.toLocaleString()}đ</span>
                      </div>
                      {extraHourTotal > 0 && (
                        <div className="flex justify-between items-center">
                          <span>Phụ thu thêm giờ ({extraHours}h)</span>
                          <span className="font-medium text-white">{extraHourTotal.toLocaleString()}đ</span>
                        </div>
                      )}
                      {weekendSurcharge > 0 && (
                        <div className="flex justify-between items-center">
                          <span>Phụ thu cuối tuần</span>
                          <span className="font-medium text-white">{weekendSurcharge.toLocaleString()}đ</span>
                        </div>
                      )}
                      {guestSurcharge > 0 && (
                        <div className="flex justify-between items-center">
                          <span>Phụ thu khách</span>
                          <span className="font-medium text-white">{guestSurcharge.toLocaleString()}đ</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-end pt-3">
                        <span className="text-white font-bold text-base">Tổng cộng:</span>
                        <span className="text-yellow-500 font-bold text-2xl md:text-3xl leading-none">{amountToPay.toLocaleString()}đ</span>
                      </div>
                    </div>

                    {isStep2Valid && isStep3Valid ? (
                      <div className="bg-stone-800/80 border border-stone-700 rounded-2xl p-4 md:p-5 mb-5 md:mb-6 flex flex-col items-center animate-in fade-in duration-500">
                        <p className="text-xs font-bold text-center mb-3 text-stone-400 uppercase tracking-wide">Phương thức thanh toán</p>
                        <div className="bg-white p-2 rounded-xl shadow-md border border-stone-100 mb-3 w-full flex justify-center items-center h-20">
                          {/* PayOS Logo Mock */}
                          <div className="text-2xl font-bold flex items-center tracking-tight">
                            <span className="text-[#132A3E]">Pay</span>
                            <span className="text-[#00C292]">OS</span>
                          </div>
                        </div>
                        <p className="text-xs text-stone-400 text-center px-2">Hệ thống sẽ chuyển hướng bạn sang cổng thanh toán thông minh của PayOS.</p>
                      </div>
                    ) : (
                      <div className="bg-stone-800/50 rounded-2xl p-6 mb-5 md:mb-6 flex flex-col items-center text-center border border-dashed border-stone-700">
                        <div className="w-12 h-12 rounded-full bg-stone-700 flex items-center justify-center mb-3">
                          <CheckCircle2 className="w-6 h-6 text-stone-500" />
                        </div>
                        <p className="text-sm text-stone-400">Vui lòng điền đầy đủ thông tin bên trái để tiếp tục thanh toán.</p>
                      </div>
                    )}

                    <button
                      onClick={handlePaymentSubmit}
                      disabled={!isStep2Valid || !isStep3Valid || isProcessing}
                      className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all ${
                        isStep2Valid && isStep3Valid && !isProcessing ? 'bg-[#132A3E] text-white hover:bg-black shadow-lg shadow-[#132A3E]/30' : 'bg-stone-800 text-stone-600 cursor-not-allowed'
                      }`}
                    >
                      {isProcessing ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "Thanh toán qua PayOS"
                      )}
                    </button>
                    {(!isStep2Valid || !isStep3Valid) && (
                      <p className="text-xs text-center text-stone-500 mt-3">* Vui lòng hoàn thiện các thông tin bên trái</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center bg-white p-10 rounded-3xl shadow-sm border border-stone-200">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">Hoàn tất thành công!</h2>
              <p className="text-stone-600 mb-8">
                Cảm ơn bạn đã chọn Sunset Home. Mã đặt phòng <strong>{bookingId}</strong> đã được lưu trên hệ thống và vé điện tử đã được gửi tới email của bạn.
              </p>
              
              <button
                onClick={() => {
                  setStep(1);
                  setBranch(null);
                  navigate('/');
                }}
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
