const fs = require('fs');

let content = fs.readFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/customer/ProfilePage.tsx', 'utf8');

const newImports = `import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getBookings, supabase } from '../../utils/db';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, Clock, Edit2, Save, X, Phone, Mail, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';`;

content = content.replace(/import { useEffect.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n/s, newImports + '\n\n');

const newProfileComponent = `export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Profile editing state
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setFullName(user.user_metadata?.full_name || '');
    setPhone(user.user_metadata?.phone || '');

    const fetchUserBookings = async () => {
      try {
        const allBookings = await getBookings();
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

  const handleSaveProfile = async () => {
    if (!supabase) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName, phone: phone }
      });
      if (error) throw error;
      
      // Also update profiles table if we have it
      await supabase.from('profiles').update({ full_name: fullName, phone: phone }).eq('id', user?.id);
      
      alert('Cập nhật thông tin thành công!');
      setIsEditing(false);
    } catch (e: any) {
      alert('Lỗi cập nhật: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F9F8F6] pt-24 md:pt-32 pb-16 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-bl-full -z-10 opacity-50"></div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-stone-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-10 h-10 text-stone-400" />
                )}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-serif text-stone-900 mb-1">
                  {user.user_metadata?.full_name || 'Khách hàng'}
                </h1>
                <div className="flex items-center text-sm text-stone-500 mb-1">
                  <Mail className="w-3.5 h-3.5 mr-1.5" /> {user.email}
                </div>
                <div className="flex items-center text-sm text-stone-500">
                  <Phone className="w-3.5 h-3.5 mr-1.5" /> {user.user_metadata?.phone || 'Chưa cập nhật số điện thoại'}
                </div>
              </div>
            </div>
            
            <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
              <button 
                onClick={() => setIsEditing(true)}
                className="flex-1 md:flex-none flex items-center justify-center px-5 py-2.5 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors font-medium text-sm"
              >
                <Edit2 className="w-4 h-4 mr-2" /> Chỉnh sửa
              </button>
              <button 
                onClick={handleSignOut}
                className="flex-1 md:flex-none flex items-center justify-center px-5 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm"
              >
                <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
              </button>
            </div>
          </div>
          
          {/* Edit Form Overlay */}
          {isEditing && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 p-6 md:p-8 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-serif font-bold">Cập nhật thông tin</h3>
                  <button onClick={() => setIsEditing(false)} className="text-stone-400 hover:text-stone-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Họ và tên</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-yellow-500"
                      placeholder="Nhập họ tên..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Số điện thoại</label>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-yellow-500"
                      placeholder="Nhập số điện thoại..."
                    />
                  </div>
                  
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="w-full mt-4 flex justify-center items-center px-5 py-3.5 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-colors font-bold disabled:opacity-50"
                  >
                    {isSaving ? 'Đang lưu...' : <><Save className="w-4 h-4 mr-2" /> Lưu thay đổi</>}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <h2 className="text-xl font-serif tracking-widest uppercase mb-4 text-stone-900 px-2">Lịch sử Đặt phòng</h2>
        
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
                className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5 md:p-6 flex flex-col md:flex-row justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <h3 className="font-bold text-stone-900 text-lg">{b.roomName}</h3>
                    <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-stone-100 text-stone-600 tracking-wider">
                      MÃ: {b.id?.toString().slice(-6) || 'N/A'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-stone-500 mb-1">
                    <span className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-stone-400" /> {b.checkIn}</span>
                    <span className="flex items-center"><Clock className="w-4 h-4 mr-2 text-stone-400" /> Gói {b.checkOut}</span>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-stone-100 md:text-right flex flex-row md:flex-col justify-between items-center md:items-end">
                  <div className="font-bold text-yellow-600 text-lg mb-0 md:mb-2">
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
`;

content = content.replace(/export default function ProfilePage\(\) \{[\s\S]*\}\n/s, newProfileComponent);
fs.writeFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/customer/ProfilePage.tsx', content);
console.log('ProfilePage updated');
