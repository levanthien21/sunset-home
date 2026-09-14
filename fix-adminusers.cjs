const fs = require('fs');
let s = fs.readFileSync('src/pages/admin/AdminUsers.tsx', 'utf8');

// BUG 5: th header
const old5 = '<th className="p-5">Kh\u00E1ch h\u00E0ng</th>';
const new5 = '<th className="p-5">Ng\u01B0\u1EDDi d\u00F9ng</th>';
if (s.includes(old5)) { s = s.replace(old5, new5); console.log('BUG5 th fixed'); }
else console.log('WARN BUG5: not found');

// BUG 3a: filter - add banned to staff tab  
const old3a = "(u.role === 'admin' || u.role === 'staff')";
const new3a = "(u.role === 'admin' || u.role === 'staff' || u.role === 'banned')";
if (s.includes(old3a)) { s = s.replace(old3a, new3a); console.log('BUG3a filter fixed'); }
else console.log('WARN BUG3a: not found');

// BUG 3b: badge CSS - CRLF aware
const old3b = "user.role === 'staff' ? 'bg-blue-100 text-blue-700' :\r\n                        'bg-gray-100 text-gray-600'";
const new3b = "user.role === 'staff' ? 'bg-blue-100 text-blue-700' :\r\n                        user.role === 'banned' ? 'bg-red-100 text-red-700' :\r\n                        'bg-gray-100 text-gray-600'";
if (s.includes(old3b)) { s = s.replace(old3b, new3b); console.log('BUG3b badge CSS fixed'); }
else { console.log('WARN BUG3b: CRLF not found, trying LF'); 
  const old3b2 = "user.role === 'staff' ? 'bg-blue-100 text-blue-700' :\n                        'bg-gray-100 text-gray-600'";
  const new3b2 = "user.role === 'staff' ? 'bg-blue-100 text-blue-700' :\n                        user.role === 'banned' ? 'bg-red-100 text-red-700' :\n                        'bg-gray-100 text-gray-600'";
  if (s.includes(old3b2)) { s = s.replace(old3b2, new3b2); console.log('BUG3b badge CSS fixed (LF)'); }
  else console.log('WARN BUG3b: still not found');
}

// BUG 3c: badge label
const old3c = "user.role === 'staff' ? 'Nh\u00E2n vi\u00EAn' : 'Kh\u00E1ch h\u00E0ng'}";
const new3c = "user.role === 'staff' ? 'Nh\u00E2n vi\u00EAn' : \r\n                         user.role === 'banned' ? '\u0110\u00E3 kh\u00F3a' : 'Kh\u00E1ch h\u00E0ng'}";
if (s.includes(old3c)) { s = s.replace(old3c, new3c); console.log('BUG3c badge label fixed'); }
else { console.log('WARN BUG3c: not found with CRLF newline');
  // try without the trailing newline variant  
  const alt3c = "user.role === 'staff' ? 'Nh\u00E2n vi\u00EAn' : 'Kh\u00E1ch h\u00E0ng'}";
  if (s.includes(alt3c)) { s = s.replace(alt3c, new3c); console.log('BUG3c badge label fixed (alt)'); }
  else console.log('WARN BUG3c: still not found');
}

fs.writeFileSync('src/pages/admin/AdminUsers.tsx', s, 'utf8');
console.log('Done writing AdminUsers.tsx');
