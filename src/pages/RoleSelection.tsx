import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../utils/db';

export default function RoleSelection() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Hệ thống chưa kết nối cơ sở dữ liệu.');
      return;
    }
    setLoading(true);
    setError('');
    
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setLoading(false);
      setError('Tài khoản hoặc mật khẩu không chính xác!');
    } else if (authData.user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', authData.user.id).single();
      const role = profile?.role || 'customer';
      
      localStorage.setItem('auth_role', role);
      if (role === 'superadmin') {
        navigate('/admin');
        return;
      }
      setLoading(false);
      
      if (role.includes('banned')) {
        await supabase.auth.signOut();
        localStorage.removeItem('auth_role');
        setError('Tài khoản của bạn đã bị khóa bởi Quản trị viên.');
        return;
      }
      if (role.includes('admin')) navigate('/admin');
      else if (role.includes('staff')) navigate('/staff');
      else {
        setError('Tài khoản này không có quyền truy cập nội bộ!');
        await supabase.auth.signOut();
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F8F6] p-4 font-sans relative">
      <Link to="/" className="absolute top-6 left-6 flex items-center text-stone-500 hover:text-stone-900 transition-colors font-medium">
        <ArrowLeft className="w-5 h-5 mr-2" /> Về trang Khách hàng
      </Link>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 overflow-hidden p-8 md:p-10"
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <h1 className="text-3xl font-serif text-stone-900 tracking-[0.25em] uppercase mb-2">Sunset</h1>
          <p className="text-[10px] text-yellow-600 tracking-[0.3em] uppercase font-bold ml-1">Cổng Đăng Nhập Nội Bộ</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium text-center border border-red-100">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Email nội bộ</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-stone-400" />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                placeholder="Nhập email nhân sự..."
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Mật khẩu</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-stone-400" />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                placeholder="Nhập mật khẩu..."
                required
              />
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-4 rounded-xl transition-all shadow-md mt-2 uppercase tracking-wider text-sm disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Vào Hệ Thống'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
