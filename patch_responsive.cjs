const fs = require('fs');
const path = require('path');
const BASE = path.join(__dirname, 'src', 'pages');

function patch(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  let changed = 0;
  for (const [search, replace] of replacements) {
    if (content.includes(search)) {
      content = content.split(search).join(replace);
      changed++;
    } else {
      console.warn(`  [WARN] Not found in ${path.basename(filePath)}:\n  "${search.substring(0, 80)}"`);
    }
  }
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  [OK] Patched ${path.basename(filePath)} (${changed} replacement(s))`);
  } else {
    console.log(`  [SKIP] No changes in ${path.basename(filePath)}`);
  }
}

// PART 1: AdminApp.tsx
console.log('\n[PART 1] AdminApp.tsx...');
const adminAppPath = path.join(BASE, 'admin', 'AdminApp.tsx');
let content = fs.readFileSync(adminAppPath, 'utf8');

// Find the start of export default function AdminApp()
const exportStart = content.indexOf('\nexport default function AdminApp()');
if (exportStart === -1) {
  console.error('  [ERROR] Could not find "export default function AdminApp()"');
  process.exit(1);
}

const newAdminApp = `
export default function AdminApp() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('auth_role');
    if (role !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);

  const navItems = [
    { to: '/admin', icon: <Home size={20} />, label: 'Tổng quan' },
    { to: '/admin/bookings', icon: <Settings size={20} />, label: 'Quản lý Đơn' },
    { to: '/admin/rooms', icon: <Edit2 size={20} />, label: 'Phòng & Giá' },
    { to: '/admin/reports', icon: <BarChart3 size={20} />, label: 'Báo cáo' },
    { to: '/admin/users', icon: <Users size={20} />, label: 'Tài khoản' },
  ];

  return (
    <div className="flex h-screen bg-[#F9F8F6] font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-gray-900 text-white flex-col flex-shrink-0">
        <div className="p-8 border-b border-gray-800">
          <h2 className="text-2xl font-serif text-white tracking-widest uppercase">Sunset</h2>
          <p className="text-xs text-yellow-500 tracking-widest uppercase mt-1">Admin Portal</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-8">
          {navItems.map(item => (
            <Link key={item.to} to={item.to} className="flex items-center space-x-3 p-3 hover:bg-white/10 rounded-sm text-gray-300 transition-colors">
              {item.icon}
              <span className="text-sm font-medium tracking-wide">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-6 border-t border-gray-800">
          <button
            onClick={async () => {
              await supabase?.auth.signOut();
              localStorage.removeItem('auth_role');
              navigate('/login');
            }}
            className="flex items-center space-x-3 text-red-400 p-2 hover:bg-white/5 rounded-sm transition-colors w-full"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium tracking-wide">Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 text-white px-4 py-3 flex items-center justify-between shadow-lg">
        <div>
          <h2 className="text-lg font-serif text-white tracking-widest uppercase">Sunset</h2>
          <p className="text-[10px] text-yellow-500 tracking-widest uppercase">Admin Portal</p>
        </div>
        <button
          onClick={async () => {
            await supabase?.auth.signOut();
            localStorage.removeItem('auth_role');
            navigate('/login');
          }}
          className="flex items-center text-red-400 bg-white/10 px-3 py-1.5 rounded-lg text-xs font-bold"
        >
          <LogOut size={14} className="mr-1" /> Xuất
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto md:overflow-auto pt-0 md:pt-0">
        <div className="pt-14 md:pt-0 pb-20 md:pb-0 h-full overflow-auto">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/bookings" element={<AdminBookings />} />
            <Route path="/rooms" element={<AdminRooms />} />
            <Route path="/reports" element={<AdminReports />} />
            <Route path="/users" element={<AdminUsers />} />
          </Routes>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-900 border-t border-gray-800 flex">
        {navItems.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className="flex-1 flex flex-col items-center justify-center py-2 text-gray-400 hover:text-yellow-500 transition-colors"
          >
            <div className="mb-1">{item.icon}</div>
            <span className="text-[9px] font-bold uppercase tracking-wider leading-none text-center">{item.label.split(' ')[0]}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
`;

content = content.substring(0, exportStart) + newAdminApp;
fs.writeFileSync(adminAppPath, content, 'utf8');
console.log('  [OK] AdminApp.tsx replaced export default function');

// PART 2: StaffApp.tsx
console.log('\n[PART 2] StaffApp.tsx...');
patch(path.join(BASE, 'staff', 'StaffApp.tsx'), [
  // 2a: StaffApp navbar
  [
    `      {/* Navbar Lễ tân */}\r\n      <div className="bg-gray-900 text-white p-4 flex justify-between items-center">\r\n        <div className="flex items-center">\r\n          <h2 className="text-xl font-serif tracking-widest uppercase ml-4">Sunset</h2>\r\n          <span className="ml-4 px-3 py-1 bg-yellow-600 rounded-full text-xs font-bold uppercase tracking-widest">Lễ tân</span>\r\n        </div>\r\n        <button \r\n          onClick={() => {\r\n            localStorage.removeItem("auth_role");\r\n            navigate("/login");\r\n          }}\r\n          className="flex items-center text-sm font-bold text-gray-300 hover:text-white bg-white/10 px-4 py-2 rounded-lg"\r\n        >\r\n          <LogOut className="w-4 h-4 mr-2" /> Đăng xuất\r\n        </button>\r\n      </div>`,
    `      {/* Navbar */}\r\n      <div className="bg-gray-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-30 shadow-lg">\r\n        <div className="flex items-center">\r\n          <h2 className="text-lg font-serif tracking-widest uppercase">Sunset</h2>\r\n          <span className="ml-3 px-2 py-0.5 bg-yellow-600 rounded-full text-[10px] font-bold uppercase tracking-widest">Lễ tân</span>\r\n        </div>\r\n        <button\r\n          onClick={() => {\r\n            localStorage.removeItem("auth_role");\r\n            navigate("/login");\r\n          }}\r\n          className="flex items-center text-xs font-bold text-gray-300 hover:text-white bg-white/10 px-3 py-1.5 rounded-lg"\r\n        >\r\n          <LogOut className="w-3.5 h-3.5 mr-1.5" /> Đăng xuất\r\n        </button>\r\n      </div>`
  ],
  // 2b: outer padding
  [
    `<div className="p-8 font-sans max-w-7xl mx-auto pb-24">`,
    `<div className="p-3 md:p-8 font-sans max-w-7xl mx-auto pb-24">`
  ],
  // 2c: action bar flex-col
  [
    `<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">`,
    `<div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">`
  ],
  // 2d: room grid
  [
    `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">`,
    `<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5 mb-8">`
  ],
  // 2e: room card padding
  [
    'className={`relative rounded-3xl border-2 p-5 cursor-pointer transition-all hover:shadow-lg flex flex-col ${currentStyle.wrapper}`}',
    'className={`relative rounded-3xl border-2 p-3 md:p-5 cursor-pointer transition-all hover:shadow-lg flex flex-col ${currentStyle.wrapper}`}'
  ],
  // 2f: room name text size
  [
    'className={`text-2xl font-black font-serif ${currentStyle.header}`}>{room.name}</h3>',
    'className={`text-lg md:text-2xl font-black font-serif ${currentStyle.header}`}>{room.name}</h3>'
  ]
]);

// PART 3: AdminRooms.tsx
console.log('\n[PART 3] AdminRooms.tsx...');
patch(path.join(BASE, 'admin', 'AdminRooms.tsx'), [
  ['<div className="p-8 font-sans max-w-6xl mx-auto">', '<div className="p-4 md:p-8 font-sans max-w-6xl mx-auto">']
]);

// PART 4: AdminUsers.tsx
console.log('\n[PART 4] AdminUsers.tsx...');
patch(path.join(BASE, 'admin', 'AdminUsers.tsx'), [
  ['<div className="p-8">', '<div className="p-4 md:p-8">'],
  ['<div className="overflow-x-auto">', '<div className="overflow-x-auto md:overflow-x-visible">'],
  ['<table className="w-full text-left">', '<table className="w-full min-w-[600px] text-left">']
]);

// PART 5: AdminBookings.tsx
console.log('\n[PART 5] AdminBookings.tsx...');
patch(path.join(BASE, 'admin', 'AdminBookings.tsx'), [
  ['<div className="p-8">', '<div className="p-4 md:p-8">']
]);

console.log('\n[DONE] All patches applied.');
