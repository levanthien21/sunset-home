const fs = require('fs');

let content = fs.readFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/auth/LoginPage.tsx', 'utf8');

const targetStr = `    if (error) {
      setLoading(false);
      setError('Email hoặc mật khẩu không chính xác. Nếu bạn tạo tài khoản bằng Google, vui lòng Đăng nhập bằng Google hoặc bấm Quên mật khẩu.');
    } else {`;

const newStr = `    if (error) {
      setLoading(false);
      if (error.message.includes('Invalid login credentials')) {
        setError('Email hoặc mật khẩu không chính xác.');
      } else if (error.message.includes('Email not confirmed')) {
        setError('Tài khoản chưa được xác thực. Vui lòng kiểm tra email của bạn.');
      } else {
        setError(error.message);
      }
    } else {`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  fs.writeFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/auth/LoginPage.tsx', content);
  console.log('Fixed login error message');
} else {
  console.log('Target string not found');
}
