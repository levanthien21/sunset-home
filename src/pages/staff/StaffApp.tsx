import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Home, LogOut, CheckCircle2, Clock, Search, LogIn, LogOut as CheckOutIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

function StaffDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const load = async () => {
      const { getBookings } = await import('../../utils/db');
      setBookings(await getBookings());
    };
    load();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { updateBookingStatus } = await import('../../utils/db');
    await updateBookingStatus(id, newStatus);
    setBookings(bookings.map(b => (b.id === id || b.bookingId === id) ? { ...b, status: newStatus } : b));
  };

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const checkinCount = bookings.filter(b => b.status === 'checked_in').length;

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.phone?.includes(searchTerm) || 
                          b.id?.toString().includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 font-sans">
      <h1 className="text-3xl font-serif text-gray-900 mb-8">Staff Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 border-l-4 border-yellow-500">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Booking Chờ Duyệt</h3>
          <p className="text-4xl font-serif mt-2 text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Đang lưu trú</h3>
          <p className="text-4xl font-serif mt-2 text-blue-600">{checkinCount}</p>
        </div>
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 border-l-4 border-green-500">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Tình trạng phòng</h3>
          <p className="text-4xl font-serif mt-2 text-gray-900">Sẵn sàng</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-xl font-serif text-gray-900">Quản lý Đơn hàng (Lễ tân)</h2>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm tên, SĐT, Mã..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-yellow-500"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-yellow-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="pending_payment">Chờ thanh toán</option>
            <option value="paid">Đã thanh toán (Chờ Check-in)</option>
            <option value="approved">Đã duyệt (Chờ Check-in)</option>
            <option value="checked_in">Đang lưu trú</option>
            <option value="checked_out">Đã Check-out</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Không tìm thấy đơn hàng nào.</div>
        ) : (
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Phòng / Ngày</th>
                <th className="p-4">Tài chính</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.map((b: any) => (
                <tr key={b.id || b.bookingId} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{b.customerName}</div>
                    <div className="text-xs text-gray-500">{b.phone}</div>
                    <div className="text-xs text-gray-400 mt-1">Mã: {b.id?.toString().slice(-6) || b.bookingId?.toString().slice(-6) || 'N/A'}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-800">{b.roomName}</div>
                    <div className="text-sm text-gray-600 mt-1">{b.checkIn}</div>
                    <div className="text-xs text-gray-400">{b.checkOut}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{b.total?.toLocaleString('vi-VN')}đ</div>
                    {b.paymentMethod === 'qr' && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] uppercase font-bold rounded-sm border border-blue-100">PayOS</span>
                    )}
                  </td>
                  <td className="p-4">
                    {b.status === 'pending' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium bg-yellow-50 text-yellow-800 border border-yellow-200">
                        <Clock className="w-3 h-3 mr-1" /> Chờ duyệt
                      </span>
                    ) : b.status === 'pending_payment' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                        Chờ TT PayOS
                      </span>
                    ) : b.status === 'paid' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Đã thanh toán PayOS
                      </span>
                    ) : b.status === 'cancelled' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium bg-red-50 text-red-800 border border-red-200">
                        Đã Hủy
                      </span>
                    ) : b.status === 'checked_in' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
                        Đang lưu trú
                      </span>
                    ) : b.status === 'checked_out' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                        Đã Check-out
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium bg-green-50 text-green-800 border border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Đã duyệt
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {(b.status === 'pending' || b.status === 'pending_payment') && (
                      <button 
                        onClick={() => handleUpdateStatus(b.id || b.bookingId, 'approved')}
                        className="text-xs bg-stone-900 text-white px-4 py-2 rounded-sm hover:bg-stone-800 font-bold uppercase tracking-wider transition-colors mr-2"
                      >
                        Duyệt
                      </button>
                    )}
                    
                    {(b.status === 'approved' || b.status === 'paid') && (
                      <button 
                        onClick={() => handleUpdateStatus(b.id || b.bookingId, 'checked_in')}
                        className="text-xs bg-blue-600 text-white px-4 py-2 rounded-sm hover:bg-blue-700 font-bold uppercase tracking-wider transition-colors flex items-center inline-flex ml-auto"
                      >
                        <LogIn className="w-3 h-3 mr-1" /> Check-in
                      </button>
                    )}

                    {b.status === 'checked_in' && (
                      <button 
                        onClick={() => handleUpdateStatus(b.id || b.bookingId, 'checked_out')}
                        className="text-xs bg-gray-800 text-white px-4 py-2 rounded-sm hover:bg-gray-900 font-bold uppercase tracking-wider transition-colors flex items-center inline-flex ml-auto"
                      >
                        <CheckOutIcon className="w-3 h-3 mr-1" /> Check-out
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
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('auth_role');
    if (role !== 'staff' && role !== 'admin') {
      navigate('/portal');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-serif tracking-widest uppercase">Sunset</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Staff Portal</p>
        </div>
        <div className="flex-1 py-6 px-4 space-y-2">
          <Link to="/staff" className="flex items-center space-x-3 px-4 py-3 bg-stone-900 text-white rounded-lg">
            <Home className="w-5 h-5" />
            <span className="font-medium text-sm">Dashboard</span>
          </Link>
        </div>
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={() => {
              localStorage.removeItem('auth_role');
              navigate('/portal');
            }}
            className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<StaffDashboard />} />
        </Routes>
      </div>
    </div>
  );
}
