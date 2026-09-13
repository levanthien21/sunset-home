import { Link } from 'react-router-dom';
import { User, Briefcase, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RoleSelection() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden p-8 text-center"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Sunset Homestay</h1>
        <p className="text-gray-500 mb-8">Vui lòng chọn luồng người dùng để tiếp tục (Demo)</p>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Link to="/customer" className="flex flex-col items-center justify-center p-6 border-2 border-transparent hover:border-yellow-400 bg-gray-50 rounded-2xl transition-all hover:shadow-md cursor-pointer group">
            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <User size={32} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Khách Hàng</h2>
            <p className="text-sm text-gray-500 mt-2 text-center">Xem cơ sở, đặt phòng, xem review</p>
          </Link>

          <Link to="/staff" className="flex flex-col items-center justify-center p-6 border-2 border-transparent hover:border-blue-400 bg-gray-50 rounded-2xl transition-all hover:shadow-md cursor-pointer group">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Briefcase size={32} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Nhân Viên</h2>
            <p className="text-sm text-gray-500 mt-2 text-center">Quản lý đặt phòng, check-in, check-out</p>
          </Link>

          <Link to="/admin" className="flex flex-col items-center justify-center p-6 border-2 border-transparent hover:border-red-400 bg-gray-50 rounded-2xl transition-all hover:shadow-md cursor-pointer group">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldAlert size={32} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Admin</h2>
            <p className="text-sm text-gray-500 mt-2 text-center">Quản lý tổng quan, cơ sở, thống kê</p>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
