const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminUsers.tsx', 'utf8');

const stateToAdd = `  const [assignEmail, setAssignEmail] = useState('');
  const [assignRole, setAssignRole] = useState('staff');
  const [assignLoading, setAssignLoading] = useState(false);
`;

code = code.replace(
  'const [error, setError] = useState(\'\');',
  'const [error, setError] = useState(\'\');\n' + stateToAdd
);

const formToAdd = `
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
            <option value="customer">Khách hàng</option>
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
`;

code = code.replace(
  '{error && (',
  formToAdd + '\n      {error && ('
);

fs.writeFileSync('src/pages/admin/AdminUsers.tsx', code);
