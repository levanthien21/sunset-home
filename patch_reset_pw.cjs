const fs = require('fs');
let content = fs.readFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/auth/ResetPasswordPage.tsx', 'utf8');

content = content.replace(
  `const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {`,
  `if (!supabase) return;
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, _session) => {`
);

content = content.replace(
  `return () => {
      authListener.subscription.unsubscribe();
    };`,
  `return () => {
      authListener?.subscription.unsubscribe();
    };`
);

content = content.replace(
  `const { error } = await supabase.auth.updateUser({`,
  `if (!supabase) return;
    const { error } = await supabase.auth.updateUser({`
);

fs.writeFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/auth/ResetPasswordPage.tsx', content);
console.log('Fixed supabase null checks');
