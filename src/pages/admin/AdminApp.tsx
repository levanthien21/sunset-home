import { Routes, Route, Link } from 'react-router-dom';
import { Home, MapPin, Settings, LogOut, BarChart3, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

function AdminDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { getBookings } = await import('../../utils/db');
      setBookings(await getBookings());
    };
    load();
  }, []);

  const approvedBookings = bookings.filter(b => b.status === 'approved');
  const expectedRevenue = approvedBookings.reduce((sum, b) => sum + b.total, 0);
  const collectedRevenue = approvedBookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);

  return (
    <div className="p-8 font-sans">
      <h1 className="text-3xl font-serif text-gray-900 mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp size={48} /></div>
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Thực thu</h3>
          <p className="text-3xl font-serif mt-2 text-green-600">{collectedRevenue.toLocaleString()}đ</p>
          <p className="text-xs text-gray-400 mt-2">Dự kiến: {expectedRevenue.toLocaleString()}đ</p>
        </div>
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Tổng cơ sở</h3>
          <p className="text-3xl font-serif mt-2">2</p>
        </div>
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Tổng phòng</h3>
          <p className="text-3xl font-serif mt-2">5</p>
        </div>
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Nhân sự</h3>
          <p className="text-3xl font-serif mt-2">4</p>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
          <h2 className="text-xl font-serif text-gray-900 mb-6">Quản lý cơ sở & phòng</h2>
          <ul className="space-y-4">
            <li className="flex justify-between items-center p-4 bg-gray-50 rounded-sm border border-gray-100">
              <div>
                <p className="font-semibold text-gray-900">Chi nhánh 1 (Bến Lức)</p>
                <p className="text-sm text-gray-500">Số 06 Block A3 Ehome Waterpoint Bến Lức • 3 Phòng</p>
              </div>
              <button className="text-yellow-600 text-sm font-semibold uppercase tracking-wider hover:text-yellow-700">Sửa</button>
            </li>
            <li className="flex justify-between items-center p-4 bg-gray-50 rounded-sm border border-gray-100">
              <div>
                <p className="font-semibold text-gray-900">Chi nhánh 2 (Hậu Nghĩa)</p>
                <p className="text-sm text-gray-500">Số A3 Kdc Young Town Hậu Nghĩa • Đang cập nhật</p>
              </div>
              <button className="text-yellow-600 text-sm font-semibold uppercase tracking-wider hover:text-yellow-700">Sửa</button>
            </li>
          </ul>
        </div>
        <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 flex items-center justify-center min-h-[300px]">
          <div className="text-center text-gray-400">
            <BarChart3 size={48} className="mx-auto mb-4 opacity-50 text-yellow-600" />
            <p className="font-medium">Chưa đủ dữ liệu biểu đồ</p>
            <p className="text-sm mt-1">Hệ thống sẽ cập nhật khi có &gt;10 booking.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminApp() {
  return (
    <div className="flex h-screen bg-[#F9F8F6] font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-8 border-b border-gray-800">
          <h2 className="text-2xl font-serif text-white tracking-widest uppercase">Sunset</h2>
          <p className="text-xs text-yellow-500 tracking-widest uppercase mt-1">Admin Portal</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-8">
          <Link to="/admin" className="flex items-center space-x-3 p-3 bg-white/10 rounded-sm text-white">
            <Home size={18} />
            <span className="text-sm font-medium tracking-wide">Tổng quan</span>
          </Link>
          <a href="#" className="flex items-center space-x-3 p-3 hover:bg-white/5 rounded-sm text-gray-400 transition-colors">
            <MapPin size={18} />
            <span className="text-sm font-medium tracking-wide">Cơ sở & Phòng</span>
          </a>
          <a href="#" className="flex items-center space-x-3 p-3 hover:bg-white/5 rounded-sm text-gray-400 transition-colors">
            <Settings size={18} />
            <span className="text-sm font-medium tracking-wide">Cài đặt</span>
          </a>
        </nav>
        <div className="p-6 border-t border-gray-800">
          <Link to="/" className="flex items-center space-x-3 text-red-400 p-2 hover:bg-white/5 rounded-sm transition-colors">
            <LogOut size={18} />
            <span className="text-sm font-medium tracking-wide">Đăng xuất</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
        </Routes>
      </div>
    </div>
  );
}
