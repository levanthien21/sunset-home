const fs = require('fs');
let content = fs.readFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/auth/RegisterPage.tsx', 'utf8');

const oldCode = `    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });
    
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Đăng ký thành công! Đang chuyển hướng...');
      setTimeout(() => navigate('/'), 2000);
    }`;

const newCode = `    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });
    
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      if (data?.session) {
        localStorage.setItem('auth_role', 'customer');
      }
      setSuccess('Đăng ký thành công! Đang tự động đăng nhập...');
      setTimeout(() => navigate('/'), 1500);
    }`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/auth/RegisterPage.tsx', content);
  console.log('Fixed RegisterPage auto login');
} else {
  console.log('Old code not found in RegisterPage');
}
