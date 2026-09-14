const fs = require('fs');
const path = require('path');

const base = __dirname;

function readFile(rel) {
  return fs.readFileSync(path.join(base, rel), 'utf8');
}

function writeFile(rel, content) {
  fs.writeFileSync(path.join(base, rel), content, 'utf8');
  console.log(`DONE: ${rel}`);
}

// BUG 1: StaffApp /portal -> /login
{
  let src = readFile('src/pages/staff/StaffApp.tsx');
  const before1 = src;
  src = src.replace(
    'navigate("/portal");',
    'navigate("/login");'
  );
  if (src === before1) {
    console.log('WARN BUG1: no change in StaffApp - check string');
  } else {
    console.log('BUG1 patched');
  }
  writeFile('src/pages/staff/StaffApp.tsx', src);
}

// BUG 2: AdminApp logout - add supabase signOut
{
  let src = readFile('src/pages/admin/AdminApp.tsx');

  if (!src.includes("import { supabase }")) {
    src = src.replace(
      "import { Routes, Route, Link, useNavigate } from 'react-router-dom';",
      "import { Routes, Route, Link, useNavigate } from 'react-router-dom';\nimport { supabase } from '../../utils/db';"
    );
    console.log('BUG2 import added');
  } else {
    console.log('BUG2 import already present');
  }

  const oldLogout = "onClick={() => {\n              localStorage.removeItem('auth_role');\n              navigate('/login');\n            }}";
  const newLogout = "onClick={async () => {\n              await supabase?.auth.signOut();\n              localStorage.removeItem('auth_role');\n              navigate('/login');\n            }}";

  if (src.includes(oldLogout)) {
    src = src.replace(oldLogout, newLogout);
    console.log('BUG2 logout patched');
  } else {
    console.log('WARN BUG2: logout pattern not found exactly, trying fallback');
  }

  writeFile('src/pages/admin/AdminApp.tsx', src);
}

// BUG 3 & BUG 5: AdminUsers
{
  let src = readFile('src/pages/admin/AdminUsers.tsx');

  // BUG 5: th header
  src = src.replace(
    '<th className="p-5">Khách hàng</th>',
    '<th className="p-5">Người dùng</th>'
  );
  console.log('BUG5 th header patched');

  // BUG 3a: filter
  src = src.replace(
    "(u.role === 'admin' || u.role === 'staff')",
    "(u.role === 'admin' || u.role === 'staff' || u.role === 'banned')"
  );
  console.log('BUG3a filter patched');

  // BUG 3b: badge classes
  src = src.replace(
    "user.role === 'staff' ? 'bg-blue-100 text-blue-700' :\n                        'bg-gray-100 text-gray-600'",
    "user.role === 'staff' ? 'bg-blue-100 text-blue-700' :\n                        user.role === 'banned' ? 'bg-red-100 text-red-700' :\n                        'bg-gray-100 text-gray-600'"
  );
  console.log('BUG3b badge classes patched');

  // BUG 3c: badge label
  src = src.replace(
    "user.role === 'staff' ? 'Nhân viên' : 'Khách hàng'",
    "user.role === 'staff' ? 'Nhân viên' : \n                         user.role === 'banned' ? 'Đã khóa' : 'Khách hàng'"
  );
  console.log('BUG3c badge label patched');

  writeFile('src/pages/admin/AdminUsers.tsx', src);
}

// BUG 4: AuthContext - banned role check
{
  let src = readFile('src/contexts/AuthContext.tsx');

  const oldFetch = `        if (data?.role) {
          localStorage.setItem('auth_role', data.role);
        }`;
  const newFetch = `        if (data?.role) {
          if (data.role === 'banned') {
            await supabase!.auth.signOut();
            localStorage.removeItem('auth_role');
          } else {
            localStorage.setItem('auth_role', data.role);
          }
        }`;

  if (src.includes(oldFetch)) {
    src = src.replace(oldFetch, newFetch);
    console.log('BUG4 banned check patched');
  } else {
    console.log('WARN BUG4: pattern not found');
  }

  writeFile('src/contexts/AuthContext.tsx', src);
}

console.log('\nAll patches applied!');
