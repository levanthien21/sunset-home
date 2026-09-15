import { useState } from 'react';
import { supabase } from '../../utils/db';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();

  
  const handleResetPassword = async () => {
    if (!email) {
      setError('Vui lòng nhập email để khôi phục mật khẩu.');
      return;
    }
    if (!supabase) return;
    setIsResetting(true);
    setError('');
    setResetMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    setIsResetting(false);
    if (error) {
      setError(error.message);
    } else {
      setResetMessage('Vui lòng kiểm tra email của bạn để đặt lại mật khẩu.');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
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
      setError('Email hoặc mật khẩu không chính xác. Nếu bạn tạo tài khoản bằng Google, vui lòng Đăng nhập bằng Google hoặc bấm Quên mật khẩu.');
    } else {
      if (authData.user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', authData.user.id).single();
        const role = profile?.role || 'customer';
        localStorage.setItem('auth_role', role);
        setLoading(false);
        if (role.includes('banned')) {
          await supabase.auth.signOut();
          localStorage.removeItem('auth_role');
          setError('Tài khoản của bạn đã bị khóa bởi Quản trị viên.');
          return;
        }
        if (role.includes('admin')) navigate('/admin');
        else if (role.includes('staff')) navigate('/staff');
        else navigate('/');
      } else {
        setLoading(false);
        navigate('/');
      }
    }
  };

  const handleGoogleLogin = async () => {
    if (!supabase) {
      setError('Hệ thống chưa kết nối cơ sở dữ liệu.');
      return;
    }
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F8F6] p-4 font-sans relative">
      <Link to="/" className="absolute top-6 left-6 flex items-center text-stone-500 hover:text-stone-900 transition-colors font-medium">
        <ArrowLeft className="w-5 h-5 mr-2" /> Về trang chủ
      </Link>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 overflow-hidden p-8 md:p-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-stone-900 tracking-widest uppercase mb-2">Sunset</h1>
          <p className="text-xs text-yellow-600 tracking-widest uppercase font-bold">Chào mừng trở lại</p>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium text-center border border-red-100">
            {error}
          </div>
        )}
        {resetMessage && (
          <div className="mb-6 bg-emerald-50 text-emerald-600 p-3 rounded-xl text-sm font-medium text-center border border-emerald-100">
            {resetMessage}
          </div>
        )}

        <button 
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center bg-white border border-stone-200 text-stone-800 font-bold py-3.5 rounded-xl transition-all hover:bg-stone-50 shadow-sm mb-6"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Đăng nhập bằng Google
        </button>

        <div className="relative flex items-center py-2 mb-6">
          <div className="flex-grow border-t border-stone-200"></div>
          <span className="flex-shrink-0 mx-4 text-stone-400 text-xs font-bold uppercase tracking-wider">Hoặc</span>
          <div className="flex-grow border-t border-stone-200"></div>
        </div>
        
        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-stone-400" />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                placeholder="Nhập email..."
                required
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">Mật khẩu</label>
              <button type="button" onClick={handleResetPassword} disabled={isResetting} className="text-xs font-bold text-yellow-600 hover:text-yellow-700 transition-colors">
                {isResetting ? 'Đang gửi...' : 'Quên mật khẩu?'}
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-stone-400" />
              </div>
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                placeholder="Nhập mật khẩu..."
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-stone-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
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
              'Đăng nhập'
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-stone-100 text-center">
          <p className="text-sm text-stone-500 font-medium">
            Chưa có tài khoản? <Link to="/register" className="text-yellow-600 hover:text-yellow-700 font-bold">Đăng ký ngay</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
