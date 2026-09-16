import { useState, useEffect } from 'react';
import { supabase } from '../../utils/db';
import { Users, Mail, Calendar, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const currentRole = localStorage.getItem('auth_role') || '';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignEmail, setAssignEmail] = useState('');
  const [assignRole, setAssignRole] = useState('staff');
  const [assignLoading, setAssignLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'staff' | 'customer'>('staff');


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
    <div className="p-4 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Quản lý Tài khoản</h1>
          <p className="text-gray-500">Danh sách tài khoản đã đăng ký trên hệ thống.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
          <Users className="text-yellow-600 w-5 h-5" />
          <div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tổng tài khoản</div>
            <div className="text-xl font-bold text-gray-900">{users.filter(u => u.role !== 'superadmin').length}</div>
          </div>
        </div>
      </div>

      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-yellow-600" />
          Phân cấp quyền nhanh bằng Email
        </h2>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <input 
            type="email" 
            placeholder="Nhập email nhân viên..." 
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
            value={assignEmail}
            onChange={e => setAssignEmail(e.target.value)}
          />
          <select 
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
            value={assignRole}
            onChange={e => setAssignRole(e.target.value)}
          >
            <option value="staff">Lễ tân</option>
            <option value="admin">Quản lý (Admin)</option>
            <option value="admin,staff">Cả hai (Quản lý & Lễ tân)</option>
            <option value="customer">Khách hàng</option>
            <option value="banned">Khóa (Banned)</option>
          </select>
          <button 
            disabled={assignLoading || !assignEmail}
            className="px-6 py-3 bg-stone-900 text-white font-bold rounded-xl hover:bg-stone-800 disabled:opacity-50"
            onClick={async () => {
              const targetUser = users.find(u => u.email === assignEmail);
              if (!targetUser) {
                alert("Không tìm thấy email này trong hệ thống. Vui lòng yêu cầu nhân viên đăng ký tài khoản trước!");
                return;
              }
              setAssignLoading(true);
              try {
                const { updateUserRole } = await import('../../utils/db');
                await updateUserRole(targetUser.id, assignRole);
                setUsers(users.map(u => u.id === targetUser.id ? { ...u, role: assignRole } : u));
                alert("Cấp quyền thành công!");
                setAssignEmail('');
              } catch (err) {
                alert("Lỗi cấp quyền! " + err);
              }
              setAssignLoading(false);
            }}
          >
            {assignLoading ? "Đang xử lý..." : "Cấp Quyền"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 flex items-start">
          <Shield className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('staff')}
          className={`py-3 px-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'staff' ? 'border-yellow-600 text-yellow-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Nhân sự & Quản lý
        </button>
        <button 
          onClick={() => setActiveTab('customer')}
          className={`py-3 px-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'customer' ? 'border-yellow-600 text-yellow-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Khách hàng
        </button>
      </div>
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
          <div className="overflow-x-auto md:overflow-x-visible">
            <table className="w-full min-w-[600px] text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <tr>
                  <th className="p-5">Người dùng</th>
                  <th className="p-5">Email</th>
                  <th className="p-5">Phân quyền</th>
                  <th className="p-5">Ngày tham gia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.filter(u => {
                    // Superadmin accounts are INVISIBLE to non-superadmin viewers
                    if (u.role === 'superadmin' && currentRole !== 'superadmin') return false;
                    if (activeTab === 'staff') return (u.role?.includes('admin') || u.role?.includes('staff') || u.role?.includes('banned') || u.role === 'superadmin');
                    return u.role === 'customer' || !u.role;
                  }).map((user, i) => (
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
                        user.role === 'superadmin' ? 'bg-gradient-to-r from-red-600 to-purple-700 text-white' :
                        user.role?.includes('admin') && user.role?.includes('staff') ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800' :
                        user.role?.includes('admin') ? 'bg-purple-100 text-purple-700' :
                        user.role?.includes('staff') ? 'bg-blue-100 text-blue-700' :
                        user.role?.includes('banned') ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {user.role?.includes('admin') && user.role?.includes('staff') ? 'Quản lý & Lễ tân' : 
                         user.role?.includes('admin') ? 'Quản trị viên' : 
                         user.role?.includes('staff') ? 'Nhân viên' : 
                         user.role?.includes('banned') ? 'Đã khóa' : 'Khách hàng'}
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
