const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminUsers.tsx', 'utf8');

// Replace the option in the form
code = code.replace(
  '<option value="customer">Khách hàng</option>',
  '<option value="customer">Khách hàng</option>\n            <option value="banned">Khóa (Banned)</option>'
);

// Replace the option in the table list (handle mangled text if any)
code = code.replace(
  /<option value="customer" className="text-gray-900 font-medium">KhAch hAng<\/option>/g,
  '<option value="customer" className="text-gray-900 font-medium">Khách hàng</option>\n                        <option value="banned" className="text-red-600 font-bold">Khóa tài khoản</option>'
);

code = code.replace(
  /<option value="staff" className="text-blue-900 font-medium">L. tAn<\/option>/g,
  '<option value="staff" className="text-blue-900 font-medium">Lễ tân</option>'
);

code = code.replace(
  /<option value="admin" className="text-purple-900 font-medium">Qun lA<\/option>/g,
  '<option value="admin" className="text-purple-900 font-medium">Quản lý</option>'
);

// Also add a red border for banned users
code = code.replace(
  /user\.role === 'staff' \? 'bg-blue-50 text-blue-700 border-blue-200' :/g,
  'user.role === \'banned\' ? \'bg-red-50 text-red-700 border-red-200\' :\n                          user.role === \'staff\' ? \'bg-blue-50 text-blue-700 border-blue-200\' :'
);

fs.writeFileSync('src/pages/admin/AdminUsers.tsx', code);
console.log('Done');
