import { Routes, Route, useNavigate } from "react-router-dom";
import { LogOut, X, Plus, BedDouble, Coffee, Calendar as CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

function StaffDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
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
    const { getBookings, getRooms } = await import("../../utils/db");
    setBookings(await getBookings());
    const rawRooms = await getRooms();
    const formattedRooms = rawRooms.map((r: any) => ({
      ...r,
      combos: [
        ...(r.combos || []),
        { id: "test-5k", name: "Gói Test (Nội bộ)", price: 5000 }
      ]
    }));
    setRoomsList(formattedRooms);
  };

  useEffect(() => {
    loadData();
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
    const roomBookings = bookings.filter(b => b.roomName === roomName);
    const active = roomBookings.find(b => b.status === "checked_in");
    if (active) return { status: "occupied", booking: active };
    const dirty = roomBookings.find(b => b.status === "checked_out_dirty");
    if (dirty) return { status: "dirty", booking: dirty };
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
    <div className="p-8 font-sans max-w-7xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
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

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {roomsList.map(room => {
          const { status, booking } = getRoomRealtimeStatus(room.name);
          const slots = getBookedSlotsForRoom(room.name, selectedDate);
          
          const bgColors = {
            available: "bg-white border-green-200 hover:border-green-400",
            occupied: "bg-red-50 border-red-200",
            dirty: "bg-yellow-50 border-yellow-300"
          };
          const textColors = {
            available: "text-green-600",
            occupied: "text-red-700",
            dirty: "text-yellow-700"
          };

          return (
            <motion.div 
              whileHover={{ y: -4 }}
              key={room.id}
              onClick={() => {
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
              className={"relative p-5 rounded-2xl border-2 shadow-sm cursor-pointer transition-all flex flex-col items-center justify-start text-center min-h-[220px] " + bgColors[status as keyof typeof bgColors]}
            >
              <BedDouble className={"w-8 h-8 mb-2 " + textColors[status as keyof typeof textColors]} />
              <h3 className="text-xl font-bold text-gray-900 mb-1">{room.name}</h3>
              <p className={"text-[10px] font-bold uppercase tracking-wider mb-4 " + textColors[status as keyof typeof textColors]}>
                {status === "available" ? "Hiện Tại: Trống" : 
                 status === "occupied" ? "Hiện Tại: Đang ở" : "Hiện Tại: Chờ dọn"}
              </p>
              
              <div className="w-full mt-auto bg-gray-50/50 p-2 rounded-xl border border-gray-100/50 flex-1 flex flex-col">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b pb-1">
                  Lịch ngày {selectedDate.split("-").reverse().join("/")}
                </div>
                <div className="space-y-1.5 overflow-y-auto max-h-[100px] flex-1">
                  {slots.length > 0 ? slots.map((s, idx) => (
                    <div 
                      key={idx} 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the card's onClick
                        setSelectedBooking(s.bookingInfo);
                      }}
                      className={`text-[10px] px-2 py-1.5 rounded-lg font-mono font-bold text-left hover:brightness-95 transition-all
                        ${s.status === 'checked_in' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}
                    >
                      <div>{s.time}</div>
                      <div className="font-sans font-medium text-[9px] truncate text-gray-600 mt-0.5 opacity-80">{s.customer}</div>
                    </div>
                  )) : (
                    <div className="text-[10px] text-gray-400 italic flex items-center justify-center h-full">
                      Chưa có ai đặt
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
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
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
              <h3 className="text-lg font-bold text-gray-900">T?o �on: <span className="text-yellow-600">{manualForm.roomName || "Chua ch?n ph�ng"}</span></h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 bg-gray-50/50">
              <form id="manual-booking-form" onSubmit={handleAddBooking} className="space-y-6">
                
                {/* LO?I KH�CH & TH?I GIAN */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <div className="flex p-1 bg-gray-100 rounded-xl">
                    <button 
                      type="button"
                      onClick={() => setManualForm({...manualForm, status: "checked_in", bookingDate: new Date().toLocaleDateString("en-CA"), expectedTime: new Date().toTimeString().slice(0,5)})}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${manualForm.status === "checked_in" ? "bg-white shadow text-yellow-600" : "text-gray-500"}`}
                    >V�o ? Ngay</button>
                    <button 
                      type="button"
                      onClick={() => setManualForm({...manualForm, status: "approved"})}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${manualForm.status === "approved" ? "bg-white shadow text-blue-600" : "text-gray-500"}`}
                    >�?t L?ch Tru?c</button>
                  </div>

                  {manualForm.status === "approved" && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Ng�y nh?n</label>
                        <input required type="date" value={manualForm.bookingDate} onChange={e => setManualForm({...manualForm, bookingDate: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-xl text-sm font-bold outline-none focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Gi? nh?n</label>
                        <input required type="time" value={manualForm.expectedTime} onChange={e => setManualForm({...manualForm, expectedTime: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-xl text-sm font-bold outline-none focus:border-blue-500" />
                      </div>
                    </div>
                  )}
                </div>

                {/* G�I GI? */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <label className="block text-[10px] font-bold text-gray-400 mb-3 uppercase">Ch?n G�i Th?i Gian</label>
                  <div className="grid grid-cols-2 gap-3">
                    {roomsList.find(r => r.name === manualForm.roomName)?.combos?.map((c: any, idx: number) => (
                      <button 
                        key={idx}
                        type="button"
                        onClick={() => setManualForm({...manualForm, selectedComboIndex: idx})}
                        className={`p-3 rounded-xl border text-left transition-all ${manualForm.selectedComboIndex === idx ? "border-yellow-500 bg-yellow-50 ring-2 ring-yellow-500/20" : "border-gray-200 hover:border-gray-300"}`}
                      >
                        <div className={`font-bold text-sm ${manualForm.selectedComboIndex === idx ? "text-yellow-700" : "text-gray-700"}`}>{c.name}</div>
                        <div className={`text-xs font-bold mt-1 ${manualForm.selectedComboIndex === idx ? "text-yellow-600" : "text-gray-400"}`}>{c.price.toLocaleString("vi-VN")}d</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* TH�NG TIN T�Y CH?N */}
                <details className="bg-white rounded-2xl border border-gray-100 shadow-sm group">
                  <summary className="p-4 text-sm font-bold text-gray-600 cursor-pointer list-none flex justify-between items-center">
                    Th�ng tin th�m (Kh�ng b?t bu?c)
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">?</span>
                  </summary>
                  <div className="p-4 pt-0 border-t border-gray-100 space-y-4 mt-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">T�n kh�ch</label>
                        <input type="text" placeholder="Kh�ch l?" value={manualForm.customerName} onChange={e => setManualForm({...manualForm, customerName: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-gray-400" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">�i?n tho?i</label>
                        <input type="text" placeholder="Tr?ng" value={manualForm.phone} onChange={e => setManualForm({...manualForm, phone: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-gray-400" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Gia h?n th�m (Gi?)</label>
                        <input type="number" min="0" value={manualForm.extraHours} onChange={e => setManualForm({...manualForm, extraHours: Number(e.target.value)})} className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-gray-400" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Thanh to�n</label>
                        <select value={manualForm.paymentMethod} onChange={e => setManualForm({...manualForm, paymentMethod: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-gray-400">
                          <option value="transfer">Chuy?n kho?n / Ti?n m?t</option>
                          <option value="qr">PayOS (QR code)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </details>

              </form>
            </div>

            <div className="p-5 border-t border-gray-100 bg-white">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-gray-500">T?ng ti?n:</span>
                <span className="text-2xl font-black text-red-600">{manualForm.total.toLocaleString("vi-VN")} d</span>
              </div>
              <button form="manual-booking-form" type="submit" className={`w-full py-3.5 rounded-xl font-black text-white text-lg shadow-lg transition-all ${manualForm.status === "checked_in" ? "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/30" : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30"}`}>
                {manualForm.status === "checked_in" ? "?? B?T �?U T�NH GI?" : "?? LUU L?CH �?T"}
              </button>
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
    if (role !== "staff" && role !== "admin") {
      navigate("/portal");
    }
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F8F6]">
      {/* Navbar Lễ tân */}
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <h2 className="text-xl font-serif tracking-widest uppercase ml-4">Sunset</h2>
          <span className="ml-4 px-3 py-1 bg-yellow-600 rounded-full text-xs font-bold uppercase tracking-widest">Lễ tân</span>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem("auth_role");
            navigate("/portal");
          }}
          className="flex items-center text-sm font-bold text-gray-300 hover:text-white bg-white/10 px-4 py-2 rounded-lg"
        >
          <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
        </button>
      </div>

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<StaffDashboard />} />
        </Routes>
      </div>
    </div>
  );
}
