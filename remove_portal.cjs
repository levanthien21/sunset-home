const fs = require('fs');

function replaceFile(path, search, replace) {
  if (fs.existsSync(path)) {
    let code = fs.readFileSync(path, 'utf8');
    code = code.split(search).join(replace);
    fs.writeFileSync(path, code);
  }
}

replaceFile('src/pages/admin/AdminApp.tsx', "navigate('/portal')", "navigate('/login')");
replaceFile('src/pages/staff/StaffApp.tsx', "navigate('/portal')", "navigate('/login')");
