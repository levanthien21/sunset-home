const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminUsers.tsx', 'utf8');

code = code.replace(
  '<h1 className="text-3xl font-serif text-gray-900 mb-2">Quản lý Khách hàng</h1>',
  '<h1 className="text-3xl font-serif text-gray-900 mb-2">Quản lý Tài khoản</h1>'
);
// Also try matching the mangled text if it's actually mangled
code = code.replace(
  '<h1 className="text-3xl font-serif text-gray-900 mb-2">Qun lA KhAch hAng</h1>',
  '<h1 className="text-3xl font-serif text-gray-900 mb-2">Quản lý Tài khoản</h1>'
);

const tabsHtml = `
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('staff')}
          className={\`py-3 px-4 font-bold text-sm border-b-2 transition-colors \${activeTab === 'staff' ? 'border-yellow-600 text-yellow-700' : 'border-transparent text-gray-500 hover:text-gray-700'}\`}
        >
          Nhân sự & Quản lý
        </button>
        <button 
          onClick={() => setActiveTab('customer')}
          className={\`py-3 px-4 font-bold text-sm border-b-2 transition-colors \${activeTab === 'customer' ? 'border-yellow-600 text-yellow-700' : 'border-transparent text-gray-500 hover:text-gray-700'}\`}
        >
          Khách hàng
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
`;

code = code.replace(
  '<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">',
  tabsHtml
);

code = code.replace(
  'users.map((user, i)',
  'users.filter(u => activeTab === \'staff\' ? (u.role === \'admin\' || u.role === \'staff\') : (u.role === \'customer\' || !u.role)).map((user, i)'
);

fs.writeFileSync('src/pages/admin/AdminUsers.tsx', code);
console.log('Tabs added');
