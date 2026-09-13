import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RoleSelection() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('auth_role', 'admin');
      navigate('/admin');
    } else if (username === 'staff' && password === 'staff123') {
      localStorage.setItem('auth_role', 'staff');
      navigate('/staff');
    } else {
      setError('Tài khoản hoặc mật khẩu không chính xác!');
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-stone-900 tracking-widest uppercase mb-2">Sunset</h1>
          <p className="text-xs text-yellow-600 tracking-widest uppercase font-bold">Hệ thống quản lý</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium text-center border border-red-100">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Tên đăng nhập</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-stone-400" />
              </div>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                placeholder="Nhập admin hoặc staff..."
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
            className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-4 rounded-xl transition-all shadow-md mt-2 uppercase tracking-wider text-sm"
          >
            Đăng nhập
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-stone-100 text-center">
          <p className="text-xs text-stone-400 font-medium">
            Demo Accounts:<br/>
            Admin: admin / admin123<br/>
            Staff: staff / staff123
          </p>
        </div>
      </motion.div>
    </div>
  );
}
