const fs = require('fs');
let content = fs.readFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/auth/LoginPage.tsx', 'utf8');

const oldStr = `<div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">Mật khẩu</label>
              <button type="button" onClick={handleResetPassword} disabled={isResetting} className="text-xs font-bold text-yellow-600 hover:text-yellow-700 transition-colors">
                {isResetting ? 'Đang gửi...' : 'Quên mật khẩu?'}
              </button>
            </div>`;

const newStr = `<div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">Mật khẩu</label>
              <button type="button" onClick={handleResetPassword} disabled={isResetting} className="text-xs font-bold text-yellow-600 hover:text-yellow-700 transition-colors">
                {isResetting ? 'Đang gửi...' : 'Quên mật khẩu?'}
              </button>
            </div>`;

if (content.includes(oldStr)) {
  content = content.replace(oldStr, newStr);
  fs.writeFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/auth/LoginPage.tsx', content);
  console.log("Fixed LoginPage JSX");
} else {
  console.log("Not found");
}
