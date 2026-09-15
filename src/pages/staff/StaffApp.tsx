import { Routes, Route, useNavigate } from "react-router-dom";
import { LogOut, X, Plus, Coffee, Calendar as CalendarIcon } from "lucide-react";
import NotificationBell from '../../components/NotificationBell';
import { useState, useEffect } from "react";


function StaffDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [holds, setHolds] = useState<any[]>([]);
  const [roomsList, setRoomsList] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString("en-CA"));
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [manualForm, setManualForm] = useState({
    customerName: "",
    phone: "",
    roomName: "",
    bookingDate: new Date().toLocaleDateString("en-CA"),
    expectedTime: "14:00",
    selectedComboIndex: -1,
    extraHours: 0,
    total: 0,
    paymentMethod: "transfer",
    status: "approved",
  });

  const [addonForm, setAddonForm] = useState({ name: "", price: 0 });

  const loadData = async () => {
    const { getBookings, getRooms, getBookingHolds } = await import("../../utils/db");
    setBookings(await getBookings());
    setHolds(await getBookingHolds());
    const rawRooms = await getRooms();
    const formattedRooms = rawRooms.map((r: any) => ({
      ...r,
      combos: r.combos || []
    }));
    setRoomsList(formattedRooms);
  };

  useEffect(() => {
    loadData();
    const pollHolds = setInterval(() => {
      loadData();
    }, 3000);
    return () => clearInterval(pollHolds);
  }, []);

  useEffect(() => {
    const selectedRoom = roomsList.find(r => r.name === manualForm.roomName);
    if (selectedRoom && selectedRoom.combos && manualForm.selectedComboIndex >= 0) {
      const combo = selectedRoom.combos[manualForm.selectedComboIndex];
      if (combo) {
        const comboPrice = combo.price || 0;
        const extraHoursPrice = (manualForm.extraHours || 0) * (selectedRoom.extra_hour_price || 50000);
        setManualForm(prev => ({ ...prev, total: comboPrice + extraHoursPrice }));
      }
    }
  }, [manualForm.roomName, manualForm.selectedComboIndex, manualForm.extraHours, roomsList]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { updateBookingStatus } = await import("../../utils/db");
      await updateBookingStatus(id, newStatus);
      if (newStatus === "checked_out_dirty") {
        alert("Khách đã Check-out. Phòng đang chờ dọn dẹp!");
      } else if (newStatus === "completed") {
        alert("Đã dọn xong. Phòng sẵn sàng đón khách!");
      } else {
        alert("Cập nhật trạng thái thành công!");
      }
      setSelectedBooking(null);
      loadData();
    } catch (e) {
      alert("Lỗi cập nhật trạng thái");
    }
  };

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualForm.selectedComboIndex < 0) {
      alert("Vui lòng chọn Gói giờ!");
      return;
    }
    const selectedRoom = roomsList.find(r => r.name === manualForm.roomName);
    const combo = selectedRoom?.combos?.[manualForm.selectedComboIndex];
    if (!combo) return;

    const checkOutStr = combo.name + (manualForm.extraHours > 0 ? " (+" + manualForm.extraHours + "h)" : "");
    const checkInStr = manualForm.bookingDate + " " + manualForm.expectedTime;

    // OVERLAP CHECK
    const parseBookingInterval = (ci: string, co: string) => {
        const safeCheckInStr = ci.replace(' ', 'T');
        const start = new Date(safeCheckInStr);
        if (isNaN(start.getTime())) return { start: new Date(0), end: new Date(0) };
        const extraMatch = co.match(/\(\+(\d+)h\)/);
        const extra = extraMatch ? parseInt(extraMatch[1]) : 0;
        let end = new Date(start.getTime());
        
        if (co.includes('2H') || co.includes('2 giờ')) {
          end = new Date(start.getTime() + (2 + extra) * 60 * 60 * 1000);
        } else if (co.includes('4H') || co.includes('4 giờ')) {
          end = new Date(start.getTime() + (4 + extra) * 60 * 60 * 1000);
        } else if (co.toLowerCase().includes('đêm')) {
          end.setDate(end.getDate() + 1);
          end.setHours(10, 0, 0, 0);
          end = new Date(end.getTime() + extra * 60 * 60 * 1000);
        } else if (co.toLowerCase().includes('ngày')) {
          end.setDate(end.getDate() + 1);
          end.setHours(12, 0, 0, 0);
          end = new Date(end.getTime() + extra * 60 * 60 * 1000);
        } else {
          end = new Date(start.getTime() + (1 + extra) * 60 * 60 * 1000);
        }
        end = new Date(end.getTime() + 30 * 60 * 1000);
        return { start, end };
    };

    const newInterval = parseBookingInterval(checkInStr, checkOutStr);
    
    const sameRoomBookings = bookings.filter((b) => 
      b.roomName === manualForm.roomName && 
      b.status !== 'cancelled' && b.status !== 'completed'
    );

    const hasOverlap = sameRoomBookings.some((b: any) => {
      if (!b.checkIn || !b.checkOut) return false;
      const bInterval = parseBookingInterval(b.checkIn, b.checkOut);
      return newInterval.start < bInterval.end && newInterval.end > bInterval.start;
    });

    if (hasOverlap) {
      alert('Phòng đã được đặt trong khoảng thời gian này (đã bao gồm 30p dọn dẹp). Vui lòng chọn giờ khác.');
      return;
    }
    // END OVERLAP CHECK
    
    const newBooking = {
      bookingId: "M" + Date.now().toString().slice(-6),
      roomName: manualForm.roomName,
      customerName: manualForm.customerName || "Khách vãng lai",
      phone: manualForm.phone,
      checkIn: manualForm.bookingDate + " " + manualForm.expectedTime,
      checkOut: checkOutStr,
      total: manualForm.total,
      paymentMethod: manualForm.paymentMethod,
      status: manualForm.status,
      addons: []
    };

    try {
      const { addBooking } = await import("../../utils/db");
      await addBooking(newBooking);
      alert("Tạo đơn thủ công thành công!");
      setShowAddModal(false);
      loadData();
    } catch (err) {
      alert("Lỗi tạo đơn!");
    }
  };

  const handleAddAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    const newAddons = [...(selectedBooking.addons || []), { name: addonForm.name, price: Number(addonForm.price) }];
    const newTotal = Number(selectedBooking.total) + Number(addonForm.price);
    
    try {
      const { updateBookingAddons } = await import("../../utils/db");
      await updateBookingAddons(selectedBooking.id || selectedBooking.bookingId, newAddons, newTotal);
      setSelectedBooking({ ...selectedBooking, addons: newAddons, total: newTotal });
      setAddonForm({ name: "", price: 0 });
      loadData();
    } catch (err) {
      alert("Lỗi thêm phụ thu!");
    }
  };

  const getRoomRealtimeStatus = (roomName: string) => {
    const roomInfo = roomsList.find((r: any) => r.name === roomName);
    if (roomInfo && roomInfo.status === 'maintenance') {
      return { status: 'maintenance', booking: null };
    }
    const roomBookings = bookings.filter((b: any) => b.roomName === roomName);
    const active = roomBookings.find(b => b.status === "checked_in");
    if (active) return { status: "occupied", booking: active };
    const dirty = roomBookings.find(b => b.status === "checked_out_dirty");
    if (dirty) return { status: "dirty", booking: dirty };
    const isHold = holds.find((h: any) => h.room_name === roomName);
    if (isHold) return { status: "holding", booking: null };
    return { status: "available", booking: null };
  };

  const getBookedSlotsForRoom = (roomName: string, date: string) => {
    return bookings
      .filter(b => b.roomName === roomName && b.checkIn?.startsWith(date) && b.status !== 'cancelled' && b.status !== 'completed' && b.status !== 'checked_out_dirty')
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
          endStr = '10:00(hsau)';
        } else if (b.checkOut.toLowerCase().includes('ngày')) {
          endStr = '12:00(hsau)';
        }
        
        return {
           time: `${timeStr} - ${endStr}`,
           status: b.status,
           customer: b.customerName || 'Khách',
           bookingInfo: b
        };
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  return (
    <div className="p-3 md:p-8 font-sans max-w-7xl mx-auto pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-3xl font-serif text-gray-900">Sơ đồ Phòng & Khung giờ</h1>
          <p className="text-gray-500 mt-1">Quản lý trạng thái thực và lịch đặt phòng theo giờ (Lễ tân)</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
            <CalendarIcon className="w-5 h-5 text-gray-500 mr-2" />
            <input 
              type="date" 
              value={selectedDate} 
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm font-bold text-gray-900 outline-none"
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-1" /> Tạo Đơn Chạm
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8 pb-2">
        <div className="flex items-center text-sm font-bold text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div> Đang Trống
        </div>
        <div className="flex items-center text-sm font-bold text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div> Đang Có Khách
        </div>
        <div className="flex items-center text-sm font-bold text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div> Chờ Dọn
        </div>
        <div className="flex items-center text-sm font-bold text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
          <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-300 mr-2"></div> Khung giờ đã khách đặt
        </div>
      </div>

      
      {/* HỆ THỐNG CẢNH BÁO THÔNG MINH */}
      <div className="mb-6 space-y-2">
        {bookings.filter(b => b.status === "approved" || b.status === "pending").map(b => {
          if(!b.checkIn) return null;
          try {
            const safeCheckInStr = b.checkIn.replace(" ", "T");
            const checkInTime = new Date(safeCheckInStr).getTime();
            const now = new Date().getTime();
            const diffMins = Math.floor((checkInTime - now) / 60000);
            
            if (diffMins > 0 && diffMins <= 60) {
              return (
                <div key={b.id || b.bookingId} className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-r-lg shadow-sm flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping mr-3"></div>
                  <span className="text-sm font-bold text-yellow-800">
                    SẮP CÓ KHÁCH: Phòng {b.roomName} đón khách ({b.customerName || "Khách lẻ"}) trong {diffMins} phút nữa.
                  </span>
                </div>
              );
            }
            if (diffMins <= 0 && diffMins >= -60) {
              return (
                <div key={b.id || b.bookingId} className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg shadow-sm flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping mr-3"></div>
                  <span className="text-sm font-bold text-red-800">
                    KHÁCH TRỄ GIỜ: Phòng {b.roomName} đã đến giờ nhận phòng ({b.checkIn}) nhưng chưa thấy check-in!
                  </span>
                </div>
              );
            }
          } catch(e) {}
          return null;
        })}
        {bookings.filter(b => b.status === "checked_in").map(b => {
          if(!b.checkIn || !b.checkOut) return null;
          try {
            const start = new Date(b.checkIn.replace(" ", "T"));
            const extraMatch = b.checkOut.match(/\(\+(\d+)h\)/);
            const extra = extraMatch ? parseInt(extraMatch[1]) : 0;
            let end = new Date(start.getTime());
            
            let baseHours = 1;
            const hourMatch = b.checkOut.match(/(\d+)\s*(H|giờ)/i);
            if (hourMatch) baseHours = parseInt(hourMatch[1]);
            end = b.end_time ? new Date(b.end_time) : new Date(start.getTime() + (baseHours + extra) * 3600000);
            if (!end || isNaN(end.getTime())) return null;

            const now = new Date().getTime();
            const diffMins = Math.floor((end.getTime() - now) / 60000);
            
            if (diffMins > 0 && diffMins <= 30) {
              return (
                <div key={b.id || b.bookingId} className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded-r-lg shadow-sm flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping mr-3"></div>
                  <span className="text-sm font-bold text-orange-800">
                    SẮP HẾT GIỜ: Phòng {b.roomName} còn {diffMins} phút nữa là hết giờ lưu trú.
                  </span>
                </div>
              );
            }
            if (diffMins <= 0) {
              return (
                <div key={b.id || b.bookingId} className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg shadow-sm flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping mr-3"></div>
                  <span className="text-sm font-bold text-red-800">
                    QUÁ GIỜ: Phòng {b.roomName} đã lố {Math.abs(diffMins)} phút. Vui lòng liên hệ khách!
                  </span>
                </div>
              );
            }
          } catch(e) {}
          return null;
        })}
        {bookings.filter(b => b.status === "checked_out_dirty").map(b => {
            const upcoming = bookings.find(ub => (ub.status === "approved" || ub.status === "pending") && ub.roomName === b.roomName);
            if (upcoming && upcoming.checkIn) {
                const checkInTime = new Date(upcoming.checkIn.replace(" ", "T")).getTime();
                const diffMins = Math.floor((checkInTime - new Date().getTime()) / 60000);
                if (diffMins > 0 && diffMins <= 120) {
                    return (
                        <div key={"dirty_warn_"+b.roomName} className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded-r-lg shadow-sm flex items-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping mr-3"></div>
                        <span className="text-sm font-bold text-purple-800">
                            ƯU TIÊN DỌN PHÒNG: Phòng {b.roomName} đang dơ nhưng khách mới sẽ đến trong {diffMins} phút nữa!
                        </span>
                        </div>
                    )
                }
            }
            return null;
        })}
      </div>


      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5 mb-8">
        {roomsList.map(room => {
          const { status, booking } = getRoomRealtimeStatus(room.name);
          const slots = getBookedSlotsForRoom(room.name, selectedDate);
          
          const styles = {
            available: { wrapper: "bg-white border-green-200 hover:border-green-500", header: "text-green-700", badge: "bg-green-100 text-green-700", inner: "bg-gray-50/50" },
            occupied: { wrapper: "bg-red-50 border-red-200 hover:border-red-300", header: "text-red-700", badge: "bg-red-100 text-red-700", inner: "bg-white/60" },
            dirty: { wrapper: "bg-yellow-50 border-yellow-300 hover:border-yellow-400", header: "text-yellow-700", badge: "bg-yellow-100 text-yellow-700", inner: "bg-white/60" },
            holding: { wrapper: "bg-purple-50 border-purple-300 hover:border-purple-400 opacity-90", header: "text-purple-700", badge: "bg-purple-100 text-purple-700 animate-pulse", inner: "bg-white/60" },
            maintenance: { wrapper: "bg-gray-100 border-gray-300 opacity-70 cursor-not-allowed", header: "text-gray-600", badge: "bg-gray-200 text-gray-700", inner: "bg-gray-50/50" }
          };
          const currentStyle = styles[status as keyof typeof styles];

          return (
            <div 
              key={room.id}
              onClick={() => {
                if (status === "maintenance") {
                  alert("Phòng đang bảo trì. Bạn không thể thao tác trên phòng này!");
                  return;
                }
                if (status === "holding") {
                  alert("Phòng đang có khách chọn trực tuyến và chờ thanh toán. Vui lòng đợi trong vài phút để tránh trùng đơn!");
                  return;
                }
                if (status === "available") {
                  setManualForm(prev => ({ ...prev, roomName: room.name, bookingDate: selectedDate }));
                  setShowAddModal(true);
                } else if (status === "dirty") {
                  if (window.confirm("Phòng " + room.name + " đã dọn dẹp xong?")) {
                    handleUpdateStatus(booking.id || booking.bookingId, "completed");
                  }
                } else {
                  setSelectedBooking(booking);
                }
              }}
              className={`relative rounded-3xl border-2 p-3 md:p-5 cursor-pointer transition-all hover:shadow-lg flex flex-col ${currentStyle.wrapper}`}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className={`text-lg md:text-2xl font-black font-serif ${currentStyle.header}`}>{room.name}</h3>
                <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${currentStyle.badge}`}>
                  {status === "available" ? "🟢 TRỐNG" : status === "occupied" ? "🔴 ĐANG Ở" : status === "dirty" ? "🟡 CHỜ DỌN" : status === "maintenance" ? "⚫ BẢO TRÌ" : "🟣 KHÁCH ĐANG CHỌN"}
                </div>
              </div>
              
              <div className={`mt-auto rounded-2xl p-3 border border-gray-100/50 ${currentStyle.inner}`}>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex justify-between border-b border-gray-200/50 pb-2">
                  <span>Lịch ngày {selectedDate.split("-").reverse().join("/")}</span>
                  <span className="text-gray-400 bg-gray-100 px-2 rounded-full">{slots.length} đơn</span>
                </div>
                
                <div className="space-y-2">
                  {slots.length > 0 ? slots.map((s: any, idx: number) => (
                    <div 
                      key={idx} 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBooking(s.bookingInfo);
                      }}
                      className={`flex items-center justify-between py-2 px-3 rounded-xl text-sm shadow-sm hover:scale-[1.02] transition-all ${s.status === "checked_in" ? "bg-red-50 text-red-900 border border-red-100" : "bg-white text-blue-900 border border-gray-100"}`}
                    >
                      <span className="font-mono font-bold text-xs">{s.time}</span>
                      <span className="font-bold text-[11px] truncate ml-2 max-w-[120px] opacity-80">{s.customer}</span>
                    </div>
                  )) : (
                    <div className="text-sm font-medium text-gray-400 italic py-4 text-center rounded-xl border-2 border-dashed border-gray-200">
                      Trống nguyên ngày
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chi tiết Booking Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-serif font-bold text-gray-900">Chi tiết đơn - {selectedBooking.roomName}</h3>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Cột trái: Thông tin */}
              <div>
                <h4 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-wider border-b pb-2">Thông tin khách</h4>
                <div className="space-y-3 text-sm">
                  <p><span className="text-gray-500 w-24 inline-block">Khách hàng:</span> <span className="font-bold">{selectedBooking.customerName || "Khách vãng lai"}</span></p>
                  <p><span className="text-gray-500 w-24 inline-block">Số ĐT:</span> <span className="font-bold">{selectedBooking.phone || "Không có"}</span></p>
                  <p><span className="text-gray-500 w-24 inline-block">Nhận phòng:</span> <span className="font-bold text-blue-600">{selectedBooking.checkIn}</span></p>
                  <p><span className="text-gray-500 w-24 inline-block">Gói (Trả):</span> <span className="font-bold text-red-600">{selectedBooking.checkOut}</span></p>
                  <p><span className="text-gray-500 w-24 inline-block">Thanh toán:</span> 
                    {selectedBooking.paymentMethod === "transfer" ? (
                      <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold ml-1">CHUYỂN KHOẢN</span>
                    ) : (
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold ml-1">PAYOS</span>
                    )}
                  </p>
                </div>

                
                {selectedBooking.status === "checked_in" && (
                  <div className="mt-4 border-t pt-4 border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-2 uppercase text-xs tracking-wider">Gia hạn thêm giờ</h4>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        min="1"
                        placeholder="Số giờ"
                        id="extendHoursInput"
                        className="w-24 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                      />
                      <button 
                        onClick={async () => {
                          const input = document.getElementById("extendHoursInput") as HTMLInputElement;
                          const hours = parseInt(input.value);
                          if (!hours || hours < 1) return alert("Vui lòng nhập số giờ hợp lệ");
                          
                          const nextBooking = bookings
                            .filter(b => b.roomName === selectedBooking.roomName && (b.status === "approved" || b.status === "pending" || b.status === "paid"))
                            .sort((a,b) => new Date(a.checkIn.replace(" ","T")).getTime() - new Date(b.checkIn.replace(" ","T")).getTime())[0];
                            
                          if (nextBooking) {
                             const currentStart = new Date(selectedBooking.checkIn.replace(" ", "T"));
                             const extraMatch = selectedBooking.checkOut.match(/\(\+(\d+)h\)/);
                             const currentExtra = extraMatch ? parseInt(extraMatch[1]) : 0;
                             let currentEnd = new Date(currentStart.getTime());
                             
                             let baseHours = 1;
                             const hourMatch = selectedBooking.checkOut.match(/(\d+)\s*(H|giờ)/i);
                             if (hourMatch) baseHours = parseInt(hourMatch[1]);
                             currentEnd = selectedBooking.end_time ? new Date(selectedBooking.end_time) : new Date(currentStart.getTime() + (baseHours + currentExtra) * 3600000);
                             
                             const newEndWithBuffer = new Date(currentEnd.getTime() + (hours * 3600000) + (30 * 60000));
                             const nextStart = new Date(nextBooking.checkIn.replace(" ", "T"));
                             
                             if (newEndWithBuffer > nextStart) {
                               alert("❌ Lỗi: Không thể gia hạn! Phòng đã có khách mới đặt vào lúc " + nextBooking.checkIn + ". Bạn phải chừa ít nhất 30p dọn phòng.");
                               return;
                             }
                          }
                          
                          try {
                            const { updateBookingAddons } = await import("../../utils/db");
                            const newAddons = [...(selectedBooking.addons || []), { name: "Gia hạn " + hours + "H", price: hours * 50000 }];
                            const newTotal = Number(selectedBooking.total) + (hours * 50000);
                            await updateBookingAddons(selectedBooking.id || selectedBooking.bookingId, newAddons, newTotal);
                            alert("Đã gia hạn thành công " + hours + " giờ!");
                            window.location.reload();
                          } catch (err) {
                            alert("Lỗi gia hạn!");
                          }
                        }}
                        className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700"
                      >
                        Gia hạn
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <h4 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-wider border-b pb-2">Thao tác</h4>
                  <div className="flex flex-wrap gap-2">
                    {(selectedBooking.status === "pending" || selectedBooking.status === "approved" || selectedBooking.status === "paid") && (
                      <button 
                        onClick={() => handleUpdateStatus(selectedBooking.id || selectedBooking.bookingId, "checked_in")}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700"
                      >
                        Khách Check-in
                      </button>
                    )}
                    {selectedBooking.status === "checked_in" && (
                      <button 
                        onClick={() => handleUpdateStatus(selectedBooking.id || selectedBooking.bookingId, "checked_out_dirty")}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700"
                      >
                        Khách Check-out
                      </button>
                    )}
                    <button 
                      onClick={() => handleUpdateStatus(selectedBooking.id || selectedBooking.bookingId, "cancelled")}
                      className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-300"
                    >
                      Hủy Đơn
                    </button>
                  </div>
                </div>
              </div>

              {/* Cột phải: Minibar */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 flex flex-col h-full">
                <h4 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-wider flex items-center">
                  <Coffee className="w-4 h-4 mr-2" /> Phụ thu & Minibar
                </h4>
                
                <div className="space-y-2 mb-6 flex-1 overflow-y-auto">
                  {selectedBooking.addons?.map((addon: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-sm p-2 bg-white rounded border border-gray-100">
                      <span className="font-medium text-gray-700">{addon.name}</span>
                      <span className="font-bold text-gray-900">{Number(addon.price).toLocaleString("vi-VN")}đ</span>
                    </div>
                  ))}
                  {(!selectedBooking.addons || selectedBooking.addons.length === 0) && (
                    <div className="text-center text-gray-400 text-sm py-4 italic">Chưa có phụ thu</div>
                  )}
                </div>

                {selectedBooking.status !== "completed" && selectedBooking.status !== "checked_out_dirty" && (
                  <form onSubmit={handleAddAddon} className="space-y-3 mb-6">
                    <input 
                      required
                      type="text"
                      placeholder="Tên dịch vụ (VD: Nước suối)"
                      value={addonForm.name}
                      onChange={e => setAddonForm({...addonForm, name: e.target.value})}
                      className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                    />
                    <div className="flex gap-2">
                      <input 
                        required
                        type="number"
                        placeholder="Giá tiền (VNĐ)"
                        value={addonForm.price || ""}
                        onChange={e => setAddonForm({...addonForm, price: Number(e.target.value)})}
                        className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                      />
                      <button type="submit" className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-yellow-700 flex-shrink-0">
                        Thêm
                      </button>
                    </div>
                  </form>
                )}

                <div className="border-t border-gray-200 pt-4 mt-auto">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold text-gray-500 uppercase text-xs">Tổng thanh toán</span>
                    <span className="font-black text-red-600 text-2xl">{Number(selectedBooking.total).toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-serif font-bold text-gray-900">Tạo Đơn Thủ Công</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="manual-booking-form" onSubmit={handleAddBooking} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Tên khách hàng</label>
                    <input 
                      type="text" 
                      placeholder="Tùy chọn"
                      value={manualForm.customerName} 
                      onChange={e => setManualForm({...manualForm, customerName: e.target.value})} 
                      className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Số điện thoại</label>
                    <input 
                      type="text" 
                      placeholder="Tùy chọn"
                      value={manualForm.phone} 
                      onChange={e => setManualForm({...manualForm, phone: e.target.value})} 
                      className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 outline-none" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Phòng</label>
                    <select 
                      required
                      value={manualForm.roomName} 
                      onChange={e => setManualForm({...manualForm, roomName: e.target.value, selectedComboIndex: -1})} 
                      className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
                    >
                      <option value="">-- Chọn --</option>
                      {roomsList.map(r => (
                        <option key={r.id} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Ngày nhận</label>
                    <input 
                      required 
                      type="date"
                      min={new Date(new Date().getTime() + 7*60*60*1000).toISOString().split('T')[0]} 
                      value={manualForm.bookingDate} 
                      onChange={(e) => {
                        const minDate = new Date(new Date().getTime() + (7 * 60 * 60 * 1000)).toISOString().split('T')[0];
                        if (e.target.value < minDate) {
                          alert("Vui lòng không chọn ngày trong quá khứ");
                          setManualForm({...manualForm, bookingDate: minDate});
                        } else {
                          setManualForm({...manualForm, bookingDate: e.target.value});
                        }
                      }} 
                      className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Giờ nhận</label>
                    <div className="grid grid-cols-4 gap-1 max-h-40 overflow-y-auto p-1 bg-gray-50 border border-gray-200 rounded-lg">
                      {Array.from({length: 48}).map((_, i) => {
                        const h = Math.floor(i/2).toString().padStart(2, '0');
                        const m = (i%2 === 0 ? '00' : '30');
                        const timeStr = `${h}:${m}`;
                        
                        const now = new Date();
                        const [y, mo, d] = manualForm.bookingDate.split('-').map(Number);
                        const slotDate = new Date(y, mo - 1, d, Number(h), Number(m));
                        const isPast = slotDate < now;
                        
                        if (isPast) return null; // Ẩn giờ quá khứ
                        
                        return (
                          <button
                            key={timeStr}
                            type="button"
                            onClick={() => setManualForm({...manualForm, expectedTime: timeStr})}
                            className={`py-1.5 px-1 text-xs font-bold rounded-md transition-all border ${
                              manualForm.expectedTime === timeStr 
                                ? 'bg-yellow-500 text-white border-yellow-600 shadow-sm' 
                                : 'bg-white text-gray-700 border-gray-200 hover:border-yellow-400'
                            }`}
                          >
                            {timeStr}
                          </button>
                        );
                      })}
                    </div>
                    {manualForm.expectedTime && (() => {
                      let endStr = '';
                      const selectedRoom = roomsList.find(r => r.name === manualForm.roomName);
                      const combo = selectedRoom?.combos?.[manualForm.selectedComboIndex];
                      if (combo) {
                        const start = new Date(`${manualForm.bookingDate}T${manualForm.expectedTime}`);
                        let end = new Date(start.getTime());
                        const co = combo.name;
                        const extraHours = manualForm.extraHours || 0;
                        if (co.includes('2H') || co.includes('2 giờ')) {
                          end = new Date(start.getTime() + (2 + extraHours) * 60 * 60 * 1000);
                        } else if (co.includes('4H') || co.includes('4 giờ')) {
                          end = new Date(start.getTime() + (4 + extraHours) * 60 * 60 * 1000);
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
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg flex flex-col text-[11px] font-bold">
                          <span className="text-green-700">Nhận phòng: {manualForm.expectedTime}</span>
                          {endStr && <span className="text-red-600 mt-0.5">Trả phòng: {endStr}</span>}
                          {!endStr && <span className="text-gray-500 font-normal mt-0.5 italic">* Chọn gói (Combo) để xem giờ trả</span>}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Gói giờ (Combo)</label>
                    <select 
                      required
                      value={manualForm.selectedComboIndex} 
                      onChange={e => setManualForm({...manualForm, selectedComboIndex: Number(e.target.value)})} 
                      className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 outline-none bg-yellow-50"
                    >
                      <option value={-1}>-- Chọn Gói --</option>
                      {manualForm.roomName && roomsList.find(r => r.name === manualForm.roomName)?.combos?.map((c: any, idx: number) => (
                        <option key={idx} value={idx}>{c.name} - {c.price.toLocaleString("vi-VN")}đ</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Gia hạn thêm (Giờ)</label>
                    <select 
                      value={manualForm.extraHours} 
                      onChange={e => setManualForm({...manualForm, extraHours: Number(e.target.value)})} 
                      className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 outline-none bg-white" 
                    >
                      <option value={0}>Không thêm</option>
                      <option value={1}>+ 1 giờ</option>
                      <option value={2}>+ 2 giờ</option>
                      <option value={3}>+ 3 giờ</option>
                      <option value={4}>+ 4 giờ</option>
                      <option value={5}>+ 5 giờ</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Thanh toán</label>
                  <select 
                    value={manualForm.paymentMethod} 
                    onChange={e => setManualForm({...manualForm, paymentMethod: e.target.value})} 
                    className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
                  >
                    <option value="transfer">Khách Chuyển khoản Trực tiếp / Tiền mặt</option>
                    <option value="qr">Tạo mã QR Ngân hàng tự động (Dành cho khách quét)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Trạng thái đơn</label>
                  <select 
                    value={manualForm.status} 
                    onChange={e => setManualForm({...manualForm, status: e.target.value})} 
                    className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
                  >
                    <option value="approved">Đã Xác Nhận (Chưa Check-in)</option>
                    <option value="checked_in">Check-in Ngay (Khách đang ở)</option>
                  </select>
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <div className="text-2xl font-black text-red-600">
                {manualForm.total.toLocaleString("vi-VN")} đ
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300">Hủy</button>
                <button form="manual-booking-form" type="submit" className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800">Tạo Đơn</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StaffApp() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("auth_role");
    if (!role?.includes('staff') && !role?.includes('admin')) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F8F6]">
      {/* Navbar */}
      <div className="bg-gray-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-30 shadow-lg">
        <div className="flex items-center">
          <h2 className="text-lg font-serif tracking-widest uppercase">Sunset</h2>
          <span className="ml-3 px-2 py-0.5 bg-yellow-600 rounded-full text-[10px] font-bold uppercase tracking-widest">Lễ tân</span>
        </div>
        <div className="flex items-center space-x-2 text-white">
          <NotificationBell />
          <button
            onClick={() => {
              localStorage.removeItem("auth_role");
              navigate("/login");
            }}
            className="flex items-center text-xs font-bold text-gray-300 hover:text-white bg-white/10 px-3 py-1.5 rounded-lg"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" /> Đăng xuất
          </button>
        </div>
      </div>

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<StaffDashboard />} />
        </Routes>
      </div>
    </div>
  );
}
