import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin, Users, Clock, CalendarDays, PlusCircle, X, ChevronRight, BedDouble, Check, Wifi, Snowflake, Droplets } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

export default function BookingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const [cccd, setCccd] = useState('');
  const [cccdDate, setCccdDate] = useState('');
  const [dob, setDob] = useState('');
  const [note, setNote] = useState('');
  
  const [bookingId, setBookingId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Data Logic
  const filteredRooms = rooms.filter(r => r.branchId === branch && r.status !== 'maintenance');
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
      setStep(2);
    }
  }, []);

  useEffect(() => {
    if (user) {
      if (!name) setName(user.user_metadata?.full_name || '');
      if (!email) setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
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
            combos: r.combos || []
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
  const isCccdValid = /^[0-9]{9,12}$/.test(cccd);
  const isStep2Valid = bookingDate && expectedTime && combo && isTimeValid;
  const isStep3Valid = name.trim().length > 2 && isPhoneValid && isEmailValid && isCccdValid && cccdDate && dob;

  const handlePaymentSubmit = async () => {
    setIsProcessing(true);
    
    try {
      const { getBookings, addBooking } = await import('../../utils/db');
      
      // 1. Kiểm tra chống đặt trùng phòng (Double Booking)
      const allBookings = await getBookings();
      const sameRoomBookings = allBookings.filter((b: any) => 
        b.roomName === selectedRoomDetails?.name && 
        b.status !== 'cancelled'
      );

      const parseBookingInterval = (checkInStr: string, checkOutStr: string) => {
        const safeCheckInStr = checkInStr.replace(' ', 'T');
        const start = new Date(safeCheckInStr);
        if (isNaN(start.getTime())) return { start: new Date(0), end: new Date(0) };
        const extraMatch = checkOutStr.match(/\(\+(\d+)h\)/);
        const extra = extraMatch ? parseInt(extraMatch[1]) : 0;
        let end = new Date(start.getTime());
        
        const match = checkOutStr.match(/(\d+)\s*(h|giờ|tiếng)/i);
        if (match) {
          end = new Date(start.getTime() + (parseInt(match[1]) + extra) * 60 * 60 * 1000);
        } else if (checkOutStr.toLowerCase().includes('đêm')) {
          end.setDate(end.getDate() + 1);
          end.setHours(10, 0, 0, 0);
          end = new Date(end.getTime() + extra * 60 * 60 * 1000);
        } else if (checkOutStr.toLowerCase().includes('ngày')) {
          end.setDate(end.getDate() + 1);
          end.setHours(12, 0, 0, 0);
          end = new Date(end.getTime() + extra * 60 * 60 * 1000);
        } else {
          end = new Date(start.getTime() + (1 + extra) * 60 * 60 * 1000);
        }
        return { start, end };
      };

      const newComboName = selectedComboDetails?.name || '';
      const newCheckOutStr = `${newComboName}${extraHours > 0 ? ` (+${extraHours}h)` : ''}`;
      const newCheckInStr = `${bookingDate} ${expectedTime}`;
      const newInterval = parseBookingInterval(newCheckInStr, newCheckOutStr);

      const hasOverlap = sameRoomBookings.some((b: any) => {
        if (!b.checkIn || !b.checkOut) return false;
        const bInterval = parseBookingInterval(b.checkIn, b.checkOut);
        return newInterval.start < bInterval.end && newInterval.end > bInterval.start;
      });

      if (hasOverlap) {
        alert('Rất tiếc! Đã có khách khác vừa nhanh tay đặt phòng vào khung giờ này. Vui lòng chọn giờ hoặc phòng khác.');
        setIsProcessing(false);
        return;
      }
      
      // 2. Tạo Booking
      // PayOS yêu cầu orderCode phải là số nguyên (tối đa 53 bit). Dùng Date.now() là chuẩn nhất.
      const newBookingId = Date.now().toString();
      
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
        status: 'pending_payment',
        date: new Date().toISOString(),
        paymentMethod: 'qr',
        user_id: user?.id || null,
        cccd,
        cccdDate,
        dob
      };
      
      await addBooking(newBooking);

      // 4. Redirect to PayOS
      try {
        const { createPayOSPaymentLink } = await import('../../utils/payos');
        const orderInfo = `Homestay Booking ${newBookingId}`;
        const payosOrderCode = parseInt(newBookingId);
        
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

  const getBookedSlotsForRoom = (roomName: string, date: string) => {
    return existingBookings
      .filter(b => b.roomName === roomName && b.checkIn?.startsWith(date) && b.status !== 'cancelled')
      .map(b => {
        const timeStr = b.checkIn.split(' ')[1] || '';
        let endStr = 'N/A';
        const start = new Date(b.checkIn.replace(' ', 'T'));
        
        const extraMatch = b.checkOut.match(/\(\+(\d+)h\)/);
        const extra = extraMatch ? parseInt(extraMatch[1]) : 0;
        
        const match = b.checkOut.match(/(\d+)\s*(h|giờ|tiếng)/i);
        if (match) {
          const end = new Date(start.getTime() + (parseInt(match[1]) + extra) * 60 * 60 * 1000);
          endStr = end.toTimeString().substring(0, 5);
        } else if (b.checkOut.toLowerCase().includes('đêm')) {
          endStr = '10:00 sáng hsau';
        } else if (b.checkOut.toLowerCase().includes('ngày')) {
          endStr = '12:00 trưa hsau';
        }
        
        return `${timeStr} - ${endStr}`;
      });
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-28 md:pt-32 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Steps */}
        <div className="mb-8">
          <button 
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/')} 
            className="inline-flex items-center px-4 py-2 bg-white border border-stone-200 rounded-full text-stone-600 font-medium text-sm hover:bg-stone-50 hover:border-stone-300 hover:text-stone-900 transition-all shadow-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
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
                <div className="grid gap-6 md:gap-8 md:grid-cols-2 max-w-4xl mx-auto">
                  {branches.map((b: any) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        if (!b.has_rooms) return;
                        setBranch(b.id);
                        setRoom(null);
                        setStep(2);
                      }}
                      className={`group relative text-left rounded-3xl overflow-hidden transition-all duration-500 w-full aspect-[4/5] md:aspect-square ${!b.has_rooms ? 'opacity-60 cursor-not-allowed grayscale' : 'hover:shadow-2xl hover:-translate-y-2'}`}
                    >
                      <img 
                        src={b.img} 
                        alt={b.name} 
                        className={`w-full h-full object-cover transition-transform duration-1000 ${b.has_rooms ? 'group-hover:scale-110' : ''}`} 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10"></div>
                      
                      {!b.has_rooms && (
                        <div className="absolute top-6 right-6">
                          <span className="text-white text-xs font-bold uppercase tracking-widest px-4 py-2 bg-stone-900/80 backdrop-blur-md rounded-full shadow-lg border border-white/10">Sắp ra mắt</span>
                        </div>
                      )}
                      
                      <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 transform transition-transform duration-500 group-hover:translate-y-[-8px]">
                        <h3 className="font-serif font-bold text-2xl md:text-3xl text-white mb-2 md:mb-3 drop-shadow-md">{b.name}</h3>
                        <p className="text-white/80 text-sm md:text-base flex items-start">
                          <MapPin className="w-5 h-5 mr-2 shrink-0 opacity-80" />
                          <span className="leading-relaxed drop-shadow-sm">{b.address}</span>
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
                       min={new Date(new Date().getTime() + (7 * 60 * 60 * 1000)).toISOString().split('T')[0]}
                       value={bookingDate}
                       onChange={(e) => {
                         const minDate = new Date(new Date().getTime() + (7 * 60 * 60 * 1000)).toISOString().split('T')[0];
                         if (e.target.value < minDate) {
                           alert("Vui lòng không chọn ngày trong quá khứ");
                           setBookingDate(minDate);
                         } else {
                           setBookingDate(e.target.value);
                         }
                       }}
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
                  const bookedSlots = getBookedSlotsForRoom(r.name, bookingDate);
                  const isAvailable = bookedSlots.length < 3; // Ví dụ: 3 slot là đầy
                  const isSelected = room === r.id;
                  
                  return (
                    <div key={r.id} className={`bg-white rounded-2xl md:rounded-3xl transition-all overflow-hidden shadow-sm hover:shadow-xl border flex flex-col ${isSelected ? 'border-yellow-600 ring-1 ring-yellow-600' : 'border-stone-200'}`}>
                      <div className="flex flex-col sm:flex-row h-full items-stretch">
                        <div className="w-full sm:w-[42%] md:w-5/12 lg:w-2/5 h-[200px] sm:h-auto sm:min-h-[280px] relative group shrink-0 overflow-hidden">
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
                                {bookingDate ? 'Còn phòng' : 'Hôm nay: Trống'}
                              </span>
                            ) : (
                              <span className="px-2 py-1 md:px-3 md:py-1.5 bg-red-500/90 text-white backdrop-blur-md text-[10px] uppercase tracking-wider font-bold rounded-full shadow-md">
                                Kín lịch
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="p-4 md:p-5 lg:p-6 flex flex-col justify-between flex-1 w-full sm:w-[58%] md:w-7/12 lg:w-3/5">
                          <div className="flex flex-col gap-3 md:gap-4">
                            {/* Tiêu đề & Địa điểm */}
                            <div>
                              <h3 className="text-lg md:text-2xl font-serif font-bold text-stone-900 leading-tight mb-1.5">{r.name}</h3>
                              <div className="flex items-center flex-wrap text-stone-500 text-[11px] md:text-xs gap-x-2 gap-y-1">
                                <span className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-1 text-stone-400" />
                                  {selectedBranchDetails?.name}
                                </span>
                                <span className="text-stone-300">•</span>
                                <button 
                                  onClick={() => {
                                    const branchName = selectedBranchDetails?.name?.toLowerCase() || '';
                                    let mapLink = 'https://maps.google.com/?q=' + encodeURIComponent(selectedBranchDetails?.address || '');
                                    if (branchName.includes('hậu nghĩa')) {
                                      mapLink = 'https://maps.app.goo.gl/Sn7rKgrzJVcLsTfT9';
                                    } else if (branchName.includes('bến lức')) {
                                      mapLink = 'https://maps.app.goo.gl/XM9gRbw6W1piX9NQ9';
                                    }
                                    window.open(mapLink, '_blank');
                                  }}
                                  className="text-blue-600 font-medium hover:underline flex items-center"
                                >
                                  Xem bản đồ <ChevronRight className="w-3 h-3 ml-0.5" />
                                </button>
                              </div>
                            </div>

                            {/* Sức chứa & Giường */}
                            <div className="flex flex-wrap gap-2">
                              <span className="text-[10px] md:text-[11px] font-medium bg-stone-100 text-stone-700 px-2 py-1 md:px-2.5 md:py-1.5 rounded-md flex items-center border border-stone-200/60">
                                <Users className="w-3 h-3 mr-1 text-stone-500" /> Tối đa 3 Khách
                              </span>
                              <span className="text-[10px] md:text-[11px] font-medium bg-stone-100 text-stone-700 px-2 py-1 md:px-2.5 md:py-1.5 rounded-md flex items-center border border-stone-200/60">
                                <BedDouble className="w-3 h-3 mr-1 text-stone-500" /> 1 Giường lớn
                              </span>
                            </div>

                            {/* Tiện ích phòng */}
                            <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                              <div className="flex items-center text-[10px] md:text-[11px] text-stone-600">
                                <Wifi className="w-3 h-3 text-stone-400 mr-1" />
                                <span>Wifi miễn phí</span>
                              </div>
                              <div className="flex items-center text-[10px] md:text-[11px] text-stone-600">
                                <Snowflake className="w-3 h-3 text-stone-400 mr-1" />
                                <span>Điều hòa</span>
                              </div>
                              <div className="flex items-center text-[10px] md:text-[11px] text-stone-600">
                                <Droplets className="w-3 h-3 text-stone-400 mr-1" />
                                <span>Nước nóng lạnh</span>
                              </div>
                              {r.features && r.features.length > 0 && r.features.slice(0, 2).map((f: any, i: any) => (
                                <div key={i} className="flex items-center text-[10px] md:text-[11px] text-stone-600">
                                  <CheckCircle2 className="w-3 h-3 text-stone-400 mr-1" />
                                  <span className="truncate max-w-[120px]">{f}</span>
                                </div>
                              ))}
                            </div>

                            {/* Lợi ích */}
                            <div className="flex flex-col gap-1 mt-1">
                               <p className="text-[11px] text-green-600 font-medium flex items-center">
                                 <Check className="w-3 h-3 mr-1.5"/> Thay đổi lịch trình linh hoạt
                               </p>
                               <p className="text-[11px] text-green-600 font-medium flex items-center">
                                 <Check className="w-3 h-3 mr-1.5"/> Giữ chỗ thanh toán qua mã QR
                               </p>
                            </div>

                            {/* Các khung giờ đã kín */}
                            {bookedSlots.length > 0 && (
                              <div className="mt-2 bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                                <p className="text-[11px] font-bold text-amber-800 mb-1 flex items-center">
                                  <Clock className="w-3 h-3 mr-1.5" /> Khung giờ đã được đặt ngày {bookingDate.split('-').reverse().join('/')}:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {bookedSlots.map((slot, idx) => (
                                    <span key={idx} className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-md font-medium">
                                      {slot}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Khu vực Giá & Nút chọn (Gắn chặt dưới đáy) */}
                          <div className="mt-4 pt-4 border-t border-stone-100 flex flex-row items-end justify-between gap-3">
                            {r.combos && r.combos.length > 0 ? (
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="bg-red-500 text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded">Ưu đãi 25%</span>
                                  <span className="text-[10px] md:text-xs text-stone-400 line-through">
                                    {(Math.min(...r.combos.map((c: any) => c.price)) * 1.33).toLocaleString()}đ
                                  </span>
                                </div>
                                <div className="text-yellow-600 font-bold text-lg md:text-xl leading-none">
                                  {Math.min(...r.combos.map((c: any) => c.price)).toLocaleString()}đ
                                </div>
                              </div>
                            ) : (
                              <div></div>
                            )}

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
                              className="px-4 py-2.5 md:px-6 md:py-3 bg-stone-900 text-white text-xs md:text-sm font-bold rounded-xl hover:bg-stone-800 transition-all shadow-md shrink-0"
                            >
                              Chọn phòng
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

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                          <div>
                            <label className="block text-xs md:text-sm font-semibold text-stone-900 mb-1.5 md:mb-2">Thêm giờ (+{(selectedRoomDetails?.extraHourPrice || 0).toLocaleString()}đ)</label>
                            <div className="relative w-full bg-stone-50 border border-stone-200 rounded-xl focus-within:bg-white focus-within:ring-2 focus-within:ring-yellow-600/50 transition-all">
                              <PlusCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 w-4 h-4 md:w-5 md:h-5 pointer-events-none z-10" />
                              <select
                                value={extraHours}
                                onChange={(e) => setExtraHours(parseInt(e.target.value) || 0)}
                                className="w-full min-w-0 pl-9 md:pl-11 pr-3 py-2.5 md:py-3 bg-transparent outline-none border-none block box-border text-base text-stone-900 relative z-20 appearance-none"
                              >
                                <option value={0}>Không thêm</option>
                                <option value={1}>+ 1 giờ</option>
                                <option value={2}>+ 2 giờ</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex flex-col justify-end">
                            <div className="bg-yellow-50 text-yellow-800 text-xs md:text-sm font-medium p-2.5 md:p-3 rounded-xl border border-yellow-200 text-center flex flex-col items-center justify-center min-h-[64px]">
                              {expectedTime ? (
                                (() => {
                                  let endStr = '';
                                  if (selectedComboDetails) {
                                    const start = new Date(`${bookingDate}T${expectedTime}`);
                                    let end = new Date(start.getTime());
                                    const co = selectedComboDetails.name;
                                    const match = co.match(/(\d+)\s*(h|giờ|tiếng)/i);
                                    if (match) {
                                      end = new Date(start.getTime() + (parseInt(match[1]) + extraHours) * 60 * 60 * 1000);
                                    } else if (co.toLowerCase().includes('đêm')) {
                                      end.setDate(end.getDate() + 1);
                                      end.setHours(10, 0, 0, 0);
                                      end = new Date(end.getTime() + extraHours * 60 * 60 * 1000);
                                    } else if (co.toLowerCase().includes('ngày')) {
                                      end.setDate(end.getDate() + 1);
                                      end.setHours(12, 0, 0, 0);
                                      end = new Date(end.getTime() + extraHours * 60 * 60 * 1000);
                                    } else {
                                      end = new Date(start.getTime() + (1 + extraHours) * 60 * 60 * 1000);
                                    }
                                    const h = end.getHours().toString().padStart(2, '0');
                                    const m = end.getMinutes().toString().padStart(2, '0');
                                    const isNextDay = end.getDate() !== start.getDate();
                                    endStr = `${h}:${m}${isNextDay ? ' (Hôm sau)' : ''}`;
                                  }
                                  return (
                                    <div className="flex flex-col">
                                      <span>Nhận phòng: <b>{expectedTime}</b></span>
                                      {endStr && <span className="text-red-600 mt-0.5">Trả phòng: <b>{endStr}</b></span>}
                                    </div>
                                  );
                                })()
                              ) : (
                                <span>Vui lòng chọn giờ bên dưới 👇</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs md:text-sm font-semibold text-stone-900 mb-2 flex items-center">
                            <Clock className="w-4 h-4 mr-1.5 text-stone-500" />
                            Khung giờ còn trống (Tự động cập nhật)
                          </label>
                          <div className="grid grid-cols-4 md:grid-cols-6 gap-2 max-h-[220px] overflow-y-auto p-1.5 bg-stone-50 border border-stone-200 rounded-xl custom-scrollbar">
                            {Array.from({length: 48}).map((_, i) => {
                              const h = Math.floor(i/2).toString().padStart(2, '0');
                              const m = (i%2 === 0 ? '00' : '30');
                              const timeStr = `${h}:${m}`;
                              
                              const now = new Date();
                              const [y, mo, d] = bookingDate.split('-').map(Number);
                              const slotDate = new Date(y, mo - 1, d, Number(h), Number(m));
                              const isPast = slotDate < now;
                              
                              let isOverlapping = false;
                              if (selectedComboDetails) {
                                const ci = `${bookingDate} ${timeStr}`;
                                const co = `${selectedComboDetails.name}${extraHours > 0 ? ` (+${extraHours}h)` : ''}`;
                                
                                const parseBookingInterval = (ciStr: string, coStr: string) => {
                                  const safeCheckInStr = ciStr.replace(' ', 'T');
                                  const start = new Date(safeCheckInStr);
                                  if (isNaN(start.getTime())) return { start: new Date(0), end: new Date(0) };
                                  const extraMatch = coStr.match(/\(\+(\d+)h\)/);
                                  const extra = extraMatch ? parseInt(extraMatch[1]) : 0;
                                  let end = new Date(start.getTime());
                                  
                                  const match = coStr.match(/(\d+)\s*(h|giờ|tiếng)/i);
                                  if (match) {
                                    end = new Date(start.getTime() + (parseInt(match[1]) + extra) * 60 * 60 * 1000);
                                  } else if (coStr.toLowerCase().includes('đêm')) {
                                    end.setDate(end.getDate() + 1);
                                    end.setHours(10, 0, 0, 0);
                                    end = new Date(end.getTime() + extra * 60 * 60 * 1000);
                                  } else if (coStr.toLowerCase().includes('ngày')) {
                                    end.setDate(end.getDate() + 1);
                                    end.setHours(12, 0, 0, 0);
                                    end = new Date(end.getTime() + extra * 60 * 60 * 1000);
                                  } else {
                                    end = new Date(start.getTime() + (1 + extra) * 60 * 60 * 1000);
                                  }
                                  end = new Date(end.getTime() + 30 * 60 * 1000);
                                  return { start, end };
                                };
                                
                                const newInt = parseBookingInterval(ci, co);
                                const sameRoomBookings = existingBookings.filter(b => b.roomName === selectedRoomDetails?.name && b.status !== 'cancelled' && b.status !== 'completed');
                                
                                isOverlapping = sameRoomBookings.some((b: any) => {
                                  if (!b.checkIn || !b.checkOut) return false;
                                  const bInt = parseBookingInterval(b.checkIn, b.checkOut);
                                  return newInt.start < bInt.end && newInt.end > bInt.start;
                                });
                              }
                              
                              if (isPast) return null; // Ẩn giờ quá khứ
                              
                              return (
                                <button
                                  key={timeStr}
                                  type="button"
                                  disabled={isOverlapping || !combo}
                                  onClick={() => setExpectedTime(timeStr)}
                                  className={`py-2 px-1 text-sm font-bold rounded-lg transition-all border ${
                                    expectedTime === timeStr 
                                      ? 'bg-yellow-500 text-white border-yellow-600 shadow-md transform scale-105' 
                                      : isOverlapping 
                                        ? 'bg-stone-200/50 text-stone-400 border-stone-200 cursor-not-allowed' 
                                        : !combo
                                          ? 'bg-white text-stone-300 border-stone-200 cursor-not-allowed'
                                          : 'bg-white text-stone-700 border-stone-200 hover:border-yellow-400 hover:text-yellow-600'
                                  }`}
                                >
                                  {timeStr}
                                </button>
                              );
                            })}
                          </div>
                          {!combo && <p className="text-xs text-red-500 mt-2">* Vui lòng chọn gói phòng (Combo) trước khi chọn giờ.</p>}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 md:p-4 border border-stone-200 rounded-xl bg-stone-50">
                        <div>
                          <p className="font-semibold text-stone-900 text-xs md:text-sm">Số khách</p>
                          <p className="text-[10px] md:text-xs text-stone-500 mt-0.5">Phụ thu 100k từ người thứ 3 (Tối đa 1 khách thêm)</p>
                        </div>
                        <div className="flex items-center bg-white p-1 rounded-lg border border-stone-200 shadow-sm">
                          <button onClick={() => guests > 1 && setGuests(guests - 1)} className="w-7 h-7 md:w-9 md:h-9 rounded-md flex items-center justify-center font-bold text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors">-</button>
                          <span className="w-8 md:w-10 text-center font-bold text-stone-900 text-sm md:text-base">{guests}</span>
                          <button onClick={() => guests < 3 && setGuests(guests + 1)} className="w-7 h-7 md:w-9 md:h-9 rounded-md flex items-center justify-center font-bold text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors">+</button>
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
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
                        <div className="md:col-span-6">
                          <label className="block text-xs md:text-sm font-semibold text-stone-700 mb-1.5 md:mb-2">Số CCCD *</label>
                          <input
                            type="text"
                            value={cccd}
                            onChange={(e) => setCccd(e.target.value)}
                            placeholder="012345678912"
                            className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-yellow-600/50 focus:border-yellow-600 outline-none transition-all text-base"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-xs md:text-sm font-semibold text-stone-700 mb-1.5 md:mb-2">Ngày cấp *</label>
                          <input
                            type="date"
                            value={cccdDate}
                            onChange={(e) => setCccdDate(e.target.value)}
                            className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-yellow-600/50 focus:border-yellow-600 outline-none transition-all text-base"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-xs md:text-sm font-semibold text-stone-700 mb-1.5 md:mb-2">Ngày sinh *</label>
                          <input
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
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
                        "Thanh toán bằng mã QR"
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
