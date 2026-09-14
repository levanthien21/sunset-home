import { useState, useEffect } from 'react';
import { supabase } from '../../utils/db';
import { Users, Mail, Calendar, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      if (!supabase) {
        setError('Không thể kết nối CSDL Supabase.');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUsers(data || []);
      } catch (err: any) {
        console.error(err);
        setError('Có lỗi xảy ra khi lấy danh sách người dùng. ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Quản lý Khách hàng</h1>
          <p className="text-gray-500">Danh sách tài khoản đã đăng ký trên hệ thống.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
          <Users className="text-yellow-600 w-5 h-5" />
          <div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tổng tài khoản</div>
            <div className="text-xl font-bold text-gray-900">{users.length}</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 flex items-start">
          <Shield className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-yellow-600 rounded-full animate-spin"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Chưa có người dùng nào đăng ký tài khoản.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <tr>
                  <th className="p-5">Khách hàng</th>
                  <th className="p-5">Email</th>
                  <th className="p-5">Phân quyền</th>
                  <th className="p-5">Ngày tham gia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={user.id} 
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-5">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-stone-500 font-serif text-lg uppercase">{user.email?.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{user.full_name || 'Khách hàng'}</div>
                          <div className="text-xs text-gray-400 font-mono mt-0.5">ID: {user.id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="p-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'staff' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {user.role === 'admin' ? 'Quản trị viên' : 
                         user.role === 'staff' ? 'Nhân viên' : 'Khách hàng'}
                      </span>
                    </td>
                    <td className="p-5 text-gray-500 text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(user.created_at).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
