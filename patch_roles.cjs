const fs = require('fs');

const files = [
  'c:/Users/ASUS/Desktop/Sunset home/src/contexts/AuthContext.tsx',
  'c:/Users/ASUS/Desktop/Sunset home/src/pages/RoleSelection.tsx',
  'c:/Users/ASUS/Desktop/Sunset home/src/pages/admin/AdminUsers.tsx',
  'c:/Users/ASUS/Desktop/Sunset home/src/pages/auth/LoginPage.tsx',
  'c:/Users/ASUS/Desktop/Sunset home/src/pages/staff/StaffApp.tsx',
  'c:/Users/ASUS/Desktop/Sunset home/src/pages/admin/AdminApp.tsx',
  'c:/Users/ASUS/Desktop/Sunset home/src/pages/customer/CustomerApp.tsx'
];

for (const path of files) {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // AuthContext
    if (path.includes('AuthContext')) {
      content = content.replace(/data\.role === 'banned'/g, "data.role.includes('banned')");
    }
    
    // RoleSelection
    if (path.includes('RoleSelection')) {
      content = content.replace(/role === 'banned'/g, "role.includes('banned')");
      content = content.replace(/role === 'admin'/g, "role.includes('admin')");
      content = content.replace(/else if \(role === 'staff'\)/g, "else if (role.includes('staff'))");
    }
    
    // LoginPage
    if (path.includes('LoginPage')) {
      content = content.replace(/role === 'banned'/g, "role.includes('banned')");
      content = content.replace(/role === 'admin'/g, "role.includes('admin')");
      content = content.replace(/else if \(role === 'staff'\)/g, "else if (role.includes('staff'))");
    }
    
    // AdminUsers
    if (path.includes('AdminUsers')) {
      content = content.replace(/u\.role === 'admin' \|\| u\.role === 'staff' \|\| u\.role === 'banned'/g, "u.role?.includes('admin') || u.role?.includes('staff') || u.role?.includes('banned')");
      
      content = content.replace(/user\.role === 'admin' \? 'bg-purple-100 text-purple-700' :/g, "user.role?.includes('admin') && user.role?.includes('staff') ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800' :\n                        user.role?.includes('admin') ? 'bg-purple-100 text-purple-700' :");
      content = content.replace(/user\.role === 'staff' \? 'bg-blue-100 text-blue-700' :/g, "user.role?.includes('staff') ? 'bg-blue-100 text-blue-700' :");
      content = content.replace(/user\.role === 'banned' \? 'bg-red-100 text-red-700' :/g, "user.role?.includes('banned') ? 'bg-red-100 text-red-700' :");
      
      content = content.replace(/\{user\.role === 'admin' \? 'Quản trị viên' :/g, "{user.role?.includes('admin') && user.role?.includes('staff') ? 'Quản lý & Lễ tân' : \n                         user.role?.includes('admin') ? 'Quản trị viên' :");
      content = content.replace(/user\.role === 'staff' \? 'Nhân viên' :/g, "user.role?.includes('staff') ? 'Nhân viên' :");
      content = content.replace(/user\.role === 'banned' \? 'Đã khóa' : 'Khách hàng'\}/g, "user.role?.includes('banned') ? 'Đã khóa' : 'Khách hàng'}");
    }
    
    // StaffApp
    if (path.includes('StaffApp')) {
      content = content.replace(/role !== "staff" && role !== "admin"/g, "!role?.includes('staff') && !role?.includes('admin')");
    }
    
    // AdminApp
    if (path.includes('AdminApp')) {
      content = content.replace(/role !== 'admin'/g, "!role?.includes('admin')");
    }
    
    // CustomerApp
    if (path.includes('CustomerApp')) {
      content = content.replace(/localStorage\.getItem\("auth_role"\) === "admin"/g, "localStorage.getItem('auth_role')?.includes('admin')");
      content = content.replace(/localStorage\.getItem\("auth_role"\) === "staff"/g, "localStorage.getItem('auth_role')?.includes('staff')");
    }
    
    fs.writeFileSync(path, content);
  }
}
console.log('Role multi-assignment patch applied');
