const fs = require('fs');
let code = fs.readFileSync('src/pages/customer/LandingPage.tsx', 'utf8');

code = code.replace(
  '<li><a href="#" className="text-sm text-stone-400 hover:text-white transition-colors">Sunset TPHCM</a></li>',
  '<li><a href="#" className="text-sm text-stone-400 hover:text-white transition-colors">Sunset TPHCM</a></li>\n              <li><Link to="/portal" className="text-sm text-yellow-600/80 hover:text-yellow-500 font-bold transition-colors">Dành cho Nhân viên</Link></li>'
);

fs.writeFileSync('src/pages/customer/LandingPage.tsx', code);
