import { Routes, Route, Link } from 'react-router-dom';
import { Home, Calendar, LogOut, CheckCircle2, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

function StaffDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { getBookings } = await import('../../utils/db');
      setBookings(await getBookings());
    };
    load();
  }, []);

  const handleApprove = async (id: string) => {
    const { updateBookingStatus } = await import('../../utils/db');
    await updateBookingStatus(id, 'approved');
    // Update local state instantly for UI
    setBookings(bookings.map(b => (b.id === id || b.bookingId === id) ? { ...b, status: 'approved' } : b));
  };

  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="p-8 font-sans">
      <h1 className="text-3xl font-serif text-gray-900 mb-8">Staff Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 border-l-4 border-yellow-500">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Booking Chờ Duyệt</h3>
          <p className="text-4xl font-serif mt-2 text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 border-l-4 border-green-500">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Booking Đã Duyệt</h3>
          <p className="text-4xl font-serif mt-2 text-gray-900">{bookings.length - pendingCount}</p>
        </div>
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Tình trạng phòng</h3>
          <p className="text-4xl font-serif mt-2 text-gray-900">Sẵn sàng</p>
        </div>
      </div>

      <h2 className="text-xl font-serif text-gray-900 mb-4">Danh sách Booking mới nhất</h2>
      <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
        {bookings.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Chưa có booking nào. Hãy thử đặt phòng bên trang Khách hàng!</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="p-4">Mã Booking</th>
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Phòng / Ngày</th>
                <th className="p-4">Tài chính</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{b.id}</p>
                    <p className="text-[10px] uppercase font-bold text-yellow-600 mt-1">
                      {b.bookingType === 'reserve' ? 'Đặt chỗ (0đ)' : b.bookingType === 'deposit' ? 'Cọc (50%)' : 'Thanh toán (100%)'}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold">{b.customerName}</p>
                    <p className="text-xs text-gray-500">{b.phone}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-medium">{b.roomName}</p>
                    <p className="text-xs text-gray-500">{b.checkIn} ➔ {b.checkOut}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-medium text-gray-900">Tổng: {b.total.toLocaleString()}đ</p>
                    <p className="text-xs text-green-600 font-medium mt-1">Đã trả: {b.amountPaid ? b.amountPaid.toLocaleString() : 0}đ</p>
                    {b.total - (b.amountPaid || 0) > 0 && (
                      <p className="text-[10px] text-red-500 font-bold uppercase mt-1">Còn nợ: {(b.total - (b.amountPaid || 0)).toLocaleString()}đ</p>
                    )}
                  </td>
                  <td className="p-4">
                    {b.status === 'pending' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock size={12} className="mr-1" /> Chờ duyệt
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle2 size={12} className="mr-1" /> Đã duyệt
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {b.status === 'pending' && (
                      <button 
                        onClick={() => handleApprove(b.id)}
                        className="px-4 py-2 bg-gray-900 text-white text-xs uppercase tracking-wider font-semibold rounded-sm hover:bg-yellow-600 transition-colors"
                      >
                        Duyệt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function StaffApp() {
  return (
    <div className="flex h-screen bg-[#F9F8F6] font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-[#1C1A17] text-white flex flex-col">
        <div className="p-8 border-b border-white/10">
          <h2 className="text-2xl font-serif text-white tracking-widest uppercase">Sunset</h2>
          <p className="text-xs text-yellow-600 tracking-widest uppercase mt-1">Staff Portal</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-8">
          <Link to="/staff" className="flex items-center space-x-3 p-3 bg-white/10 rounded-sm text-white">
            <Home size={18} />
            <span className="text-sm font-medium tracking-wide">Tổng quan</span>
          </Link>
          <a href="#" className="flex items-center space-x-3 p-3 hover:bg-white/5 rounded-sm text-gray-400 transition-colors">
            <Calendar size={18} />
            <span className="text-sm font-medium tracking-wide">Lịch Booking</span>
          </a>
        </nav>
        <div className="p-6 border-t border-white/10">
          <Link to="/" className="flex items-center space-x-3 text-red-400 p-2 hover:bg-white/5 rounded-sm transition-colors">
            <LogOut size={18} />
            <span className="text-sm font-medium tracking-wide">Đăng xuất</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<StaffDashboard />} />
        </Routes>
      </div>
    </div>
  );
}
