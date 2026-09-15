const fs = require('fs');

// Add inline role change to AdminUsers.tsx
let content = fs.readFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/admin/AdminUsers.tsx', 'utf8');

// Add quick change button in the table - after the date column
content = content.replace(
  `                   <td className="p-5 text-gray-500 text-sm">
                       <div className="flex items-center">
                         <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                         {new Date(user.created_at).toLocaleDateString('vi-VN')}
                       </div>
                     </td>
                   </motion.tr>`,
  `                   <td className="p-5 text-gray-500 text-sm">
                       <div className="flex items-center">
                         <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                         {new Date(user.created_at).toLocaleDateString('vi-VN')}
                       </div>
                     </td>
                     <td className="p-5">
                       <select
                         value={user.role || 'customer'}
                         onChange={async (e) => {
                           const newRole = e.target.value;
                           if (!window.confirm(\`Đổi quyền của "\${user.full_name || user.email}" thành "\${newRole}"?\`)) return;
                           try {
                             const { updateUserRole } = await import('../../utils/db');
                             await updateUserRole(user.id, newRole);
                             setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
                           } catch (err) {
                             alert('Lỗi đổi quyền: ' + err);
                           }
                         }}
                         className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500"
                       >
                         <option value="customer">Khách hàng</option>
                         <option value="staff">Lễ tân</option>
                         <option value="admin">Admin</option>
                         <option value="admin,staff">Admin + Lễ tân</option>
                         <option value="banned">Khóa</option>
                       </select>
                     </td>
                   </motion.tr>`
);

// Add column header
content = content.replace(
  `                   <th className="p-5">Ngày tham gia</th>
                 </tr>`,
  `                   <th className="p-5">Ngày tham gia</th>
                   <th className="p-5">Thao tác</th>
                 </tr>`
);

fs.writeFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/admin/AdminUsers.tsx', content);
console.log("AdminUsers.tsx patched");

// Fix StaffApp.tsx logout to call supabase.auth.signOut()
let staffContent = fs.readFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/staff/StaffApp.tsx', 'utf8');

// Fix logout button - it only removes auth_role but doesn't sign out
staffContent = staffContent.replace(
  `onClick={() => {
              localStorage.removeItem("auth_role");
              navigate("/login");
            }}`,
  `onClick={async () => {
              const { supabase } = await import("../../utils/db");
              await supabase?.auth.signOut();
              localStorage.removeItem("auth_role");
              navigate("/login");
            }}`
);

fs.writeFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/staff/StaffApp.tsx', staffContent);
console.log("StaffApp.tsx logout patched");
