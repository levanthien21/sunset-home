const fs = require('fs');

// Fix AuthContext
let authCode = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');
authCode = authCode.replace("const { data } = await supabase.from", "const { data } = await supabase!.from");
fs.writeFileSync('src/contexts/AuthContext.tsx', authCode);

// Fix CustomerApp
let customerCode = fs.readFileSync('src/pages/customer/CustomerApp.tsx', 'utf8');
customerCode = customerCode.replace("import { User as UserIcon } from 'lucide-react';", "import { User as UserIcon, LogOut } from 'lucide-react';");
customerCode = customerCode.replace("onClick={handleLogout}", "onClick={async () => { await supabase?.auth.signOut(); localStorage.removeItem('auth_role'); window.location.reload(); }}");
fs.writeFileSync('src/pages/customer/CustomerApp.tsx', customerCode);
