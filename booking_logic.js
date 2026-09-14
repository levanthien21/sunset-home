import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin, Users, Clock, CalendarDays, PlusCircle, X, ChevronRight, BedDouble, Check } from 'lucide-react';
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
        
        if (checkOutStr.includes('2H') || checkOutStr.includes('2 giờ')) {
          end = new Date(start.getTime() + (2 + extra) * 60 * 60 * 1000);
        } else if (checkOutStr.includes('4H') || checkOutStr.includes('4 giờ')) {
          end = new Date(start.getTime() + (4 + extra) * 60 * 60 * 1000);
        } else if (checkOutStr.toLowerCase().includes('đêm')) {
          end.setDate(end.getDate() + 1);
          end.setHours(10, 0, 0, 0);
          end = new Date(end.getTime() + extra * 60 * 60 * 1000);
        } else if (checkOutStr.toLowerCase().includes('ngày')) {
          end.setDate(end.getDate() + 1);
          end.setHours(12, 0, 0, 0);
          end = new Date(end.getTime() + extra * 60 * 60 * 1000);
        } else {
          // Default 1h for unknown packages (like test)
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
        user_id: user?.id || null
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
        
        if (b.checkOut.includes('2H') || b.checkOut.includes('2 giờ')) {
          const end = new Date(start.getTime() + (2 + extra) * 60 * 60 * 1000);
          endStr = end.toTimeString().substring(0, 5);
        } else if (b.checkOut.includes('4H') || b.checkOut.includes('4 giờ')) {
          const end = new Date(start.getTime() + (4 + extra) * 60 * 60 * 1000);
          endStr = end.toTimeString().substring(0, 5);
        } else if (b.checkOut.toLowerCase().includes('đêm')) {
          endStr = '10:00 sáng hsau';
        } else if (b.checkOut.toLowerCase().includes('ngày')) {
          endStr = '12:00 trưa hsau';
        }
        
        return `${timeStr} - ${endStr}`;
      });
  };

