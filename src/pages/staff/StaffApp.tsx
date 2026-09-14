import { Routes, Route, useNavigate } from "react-router-dom";
import { LogOut, X, Plus, BedDouble, Coffee } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

function StaffDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [roomsList, setRoomsList] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  
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
        const extraHoursPrice = (manualForm.extraHours || 0) * (selectedRoom.extraHourPrice || 50000);
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

  const getRoomStatus = (roomName: string) => {
    const roomBookings = bookings.filter(b => b.roomName === roomName);
    const active = roomBookings.find(b => b.status === "checked_in");
    if (active) return { status: "occupied", booking: active };
    const dirty = roomBookings.find(b => b.status === "checked_out_dirty");
    if (dirty) return { status: "dirty", booking: dirty };
    const pending = roomBookings.find(b => b.status === "pending" || b.status === "approved" || b.status === "paid");
    if (pending) return { status: "booked", booking: pending };
    return { status: "available", booking: null };
  };

  return (
    <div className="p-8 font-sans max-w-7xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-gray-900">Sơ đồ Phòng</h1>
          <p className="text-gray-500 mt-1">Quản lý trạng thái phòng thời gian thực (Lễ tân)</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" /> Tạo Đơn Chạm
        </button>
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        <div className="flex items-center text-sm font-bold text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div> Trống
        </div>
        <div className="flex items-center text-sm font-bold text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div> Đã Đặt
        </div>
        <div className="flex items-center text-sm font-bold text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div> Có Khách
        </div>
        <div className="flex items-center text-sm font-bold text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div> Chờ Dọn
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {roomsList.map(room => {
          const { status, booking } = getRoomStatus(room.name);
          const bgColors = {
            available: "bg-white border-green-200 hover:border-green-400",
            booked: "bg-blue-50 border-blue-200",
            occupied: "bg-red-50 border-red-200",
            dirty: "bg-yellow-50 border-yellow-300"
          };
          const textColors = {
            available: "text-green-600",
            booked: "text-blue-700",
            occupied: "text-red-700",
            dirty: "text-yellow-700"
          };

          return (
            <motion.div 
              whileHover={{ y: -4 }}
              key={room.id}
              onClick={() => {
                if (status === "available") {
                  setManualForm(prev => ({ ...prev, roomName: room.name }));
                  setShowAddModal(true);
                } else if (status === "dirty") {
                  if (window.confirm("Phòng " + room.name + " đã dọn dẹp xong?")) {
                    handleUpdateStatus(booking.id || booking.bookingId, "completed");
                  }
                } else {
                  setSelectedBooking(booking);
                }
              }}
              className={"relative p-6 rounded-2xl border-2 shadow-sm cursor-pointer transition-all flex flex-col items-center justify-center text-center " + bgColors[status as keyof typeof bgColors]}
            >
              <BedDouble className={"w-10 h-10 mb-3 " + textColors[status as keyof typeof textColors]} />
              <h3 className="text-xl font-bold text-gray-900 mb-1">{room.name}</h3>
              <p className={"text-xs font-bold uppercase tracking-wider " + textColors[status as keyof typeof textColors]}>
                {status === "available" ? "Sẵn sàng" : 
                 status === "booked" ? "Đã đặt" :
                 status === "occupied" ? "Đang ở" : "Chờ dọn"}
              </p>
              {booking && status !== "dirty" && (
                <div className="mt-3 text-[10px] bg-white/60 px-2 py-1 rounded-md font-mono font-bold text-gray-700 truncate max-w-full">
                  {booking.customerName}
                </div>
              )}
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
                      value={manualForm.bookingDate} 
                      onChange={e => setManualForm({...manualForm, bookingDate: e.target.value})} 
                      className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Giờ nhận</label>
                    <input 
                      required 
                      type="time" 
                      value={manualForm.expectedTime} 
                      onChange={e => setManualForm({...manualForm, expectedTime: e.target.value})} 
                      className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 outline-none" 
                    />
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
                    <input 
                      type="number" 
                      min="0"
                      value={manualForm.extraHours} 
                      onChange={e => setManualForm({...manualForm, extraHours: Number(e.target.value)})} 
                      className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 outline-none" 
                    />
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
                    <option value="qr">Chuyển khoản qua quét mã PayOS (Không khuyến nghị cho Lễ tân)</option>
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
