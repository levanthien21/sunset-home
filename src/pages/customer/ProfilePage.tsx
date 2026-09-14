import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getBookings } from '../../utils/db';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUserBookings = async () => {
      try {
        const allBookings = await getBookings();
        // Lọc các đơn của user này (nếu đã đồng bộ user_id)
        // Lưu ý: Nếu user_id chưa có trong một số đơn cũ, có thể lọc thêm theo email
        const myBookings = allBookings.filter((b: any) => 
          b.user_id === user.id || b.email === user.email
        );
        setBookings(myBookings);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBookings();
  }, [user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F9F8F6] pt-24 md:pt-32 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 mb-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-6 mb-6 md:mb-0">
            <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center overflow-hidden">
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl text-stone-400 font-serif uppercase">{user.email?.charAt(0)}</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-serif text-stone-900">{user.user_metadata?.full_name || 'Khách hàng'}</h1>
              <p className="text-stone-500">{user.email}</p>
            </div>
          </div>
          
          <button 
            onClick={handleSignOut}
            className="flex items-center px-5 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
          </button>
        </div>

        <h2 className="text-xl font-serif tracking-widest uppercase mb-6 text-stone-900">Lịch sử Đặt phòng</h2>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-12 text-center">
            <p className="text-stone-500 mb-6">Bạn chưa có lịch sử đặt phòng nào.</p>
            <button 
              onClick={() => navigate('/booking')}
              className="bg-stone-900 text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider text-sm hover:bg-stone-800 transition-colors"
            >
              Đặt phòng ngay
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={b.id || i}
                className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 flex flex-col md:flex-row justify-between"
              >
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="font-bold text-stone-900">{b.roomName}</h3>
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-stone-100 text-stone-600">
                      Mã: {b.id?.toString().slice(-6) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-stone-500 space-x-4 mb-2">
                    <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5" /> Nhận phòng: {b.checkIn}</span>
                  </div>
                  <div className="flex items-center text-sm text-stone-500 space-x-4">
                    <span className="flex items-center"><Clock className="w-4 h-4 mr-1.5" /> Gói: {b.checkOut}</span>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 md:text-right flex flex-col justify-between">
                  <div className="font-bold text-stone-900 mb-2">
                    {b.total?.toLocaleString('vi-VN')}đ
                  </div>
                  <div>
                    {b.status === 'paid' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">
                        Đã thanh toán
                      </span>
                    ) : b.status === 'cancelled' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600">
                        Đã hủy
                      </span>
                    ) : b.status === 'checked_in' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600">
                        Đang lưu trú
                      </span>
                    ) : b.status === 'checked_out' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                        Hoàn thành
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600">
                        Chờ thanh toán
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
