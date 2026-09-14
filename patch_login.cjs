const fs = require('fs');
let code = fs.readFileSync('src/pages/auth/LoginPage.tsx', 'utf8');

const replacement = `    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      setError('Email hoặc mật khẩu không chính xác.');
    } else {
      if (authData.user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', authData.user.id).single();
        const role = profile?.role || 'customer';
        localStorage.setItem('auth_role', role);
        setLoading(false);
        if (role === 'admin') navigate('/admin');
        else if (role === 'staff') navigate('/staff');
        else navigate('/');
      } else {
        setLoading(false);
        navigate('/');
      }
    }`;

code = code.replace(
  /const \{ error \} = await supabase\.auth\.signInWithPassword\(\{ email, password \}\);[\s\S]*?navigate\('\/'\);\s*\}/,
  replacement
);

fs.writeFileSync('src/pages/auth/LoginPage.tsx', code);
console.log('LoginPage patched');
