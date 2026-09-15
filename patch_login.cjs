const fs = require('fs');
let content = fs.readFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/auth/LoginPage.tsx', 'utf8');

// Update error message
content = content.replace(
  "setError('Email hoặc mật khẩu không chính xác.');",
  "setError('Email hoặc mật khẩu không chính xác. Nếu bạn tạo tài khoản bằng Google, vui lòng Đăng nhập bằng Google hoặc bấm Quên mật khẩu.');"
);

// Add reset password function and states
content = content.replace(
  "const [error, setError] = useState('');",
  "const [error, setError] = useState('');\n  const [resetMessage, setResetMessage] = useState('');\n  const [isResetting, setIsResetting] = useState(false);"
);

const resetFunction = `
  const handleResetPassword = async () => {
    if (!email) {
      setError('Vui lòng nhập email để khôi phục mật khẩu.');
      return;
    }
    if (!supabase) return;
    setIsResetting(true);
    setError('');
    setResetMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    setIsResetting(false);
    if (error) {
      setError(error.message);
    } else {
      setResetMessage('Vui lòng kiểm tra email của bạn để đặt lại mật khẩu.');
    }
  };
`;

content = content.replace("const handleEmailLogin = async (e: React.FormEvent) => {", resetFunction + "\n  const handleEmailLogin = async (e: React.FormEvent) => {");

// Add reset message display and forgot password button
content = content.replace(
  "{error && (\n          <div className=\"mb-6 bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium text-center border border-red-100\">\n            {error}\n          </div>\n        )}",
  `{error && (
          <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium text-center border border-red-100">
            {error}
          </div>
        )}
        {resetMessage && (
          <div className="mb-6 bg-emerald-50 text-emerald-600 p-3 rounded-xl text-sm font-medium text-center border border-emerald-100">
            {resetMessage}
          </div>
        )}`
);

content = content.replace(
  "<div>\n            <label className=\"block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2\">Mật khẩu</label>",
  `<div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">Mật khẩu</label>
              <button type="button" onClick={handleResetPassword} disabled={isResetting} className="text-xs font-bold text-yellow-600 hover:text-yellow-700 transition-colors">
                {isResetting ? 'Đang gửi...' : 'Quên mật khẩu?'}
              </button>
            </div>`
);
content = content.replace(/<label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Mật khẩu<\/label>/, "");


fs.writeFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/auth/LoginPage.tsx', content);
console.log('LoginPage patched for forgot password');
