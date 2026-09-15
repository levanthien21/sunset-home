import { useState, useEffect } from 'react';
import { supabase } from '../../utils/db';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for the password reset event
    if (!supabase) return;
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, _session) => {
      if (event == "PASSWORD_RECOVERY") {
        console.log("Password recovery mode activated");
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải dài ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    setError('');

    if (!supabase) return;
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F8F6] p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 overflow-hidden p-8 md:p-10 text-center"
      >
        <h1 className="text-3xl font-serif text-stone-900 tracking-widest uppercase mb-2">Sunset</h1>
        <p className="text-xs text-yellow-600 tracking-widest uppercase font-bold mb-8">Đặt lại mật khẩu</p>

        {success ? (
          <div className="space-y-4">
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm font-medium border border-emerald-100">
              Đổi mật khẩu thành công!
            </div>
            <p className="text-stone-500 text-sm">Đang chuyển hướng về trang đăng nhập...</p>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-5 text-left">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium text-center border border-red-100">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Mật khẩu mới</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-stone-400" />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                  placeholder="Nhập mật khẩu mới..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-stone-400" />
                </div>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                  placeholder="Nhập lại mật khẩu mới..."
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-4 rounded-xl transition-all shadow-md mt-4 uppercase tracking-wider text-sm disabled:opacity-70 flex justify-center items-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>Lưu mật khẩu mới <ArrowRight className="ml-2 w-4 h-4" /></>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
