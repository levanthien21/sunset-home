const fs = require('fs');
let code = fs.readFileSync('src/pages/staff/StaffApp.tsx', 'utf8');

code = code.replace(
  /const pollHolds = setInterval\(async \(\) => \{\s*try \{\s*const \{ getBookingHolds \} = await import\("\.\.\/\.\.\/utils\/db"\);\s*const holdsData = await getBookingHolds\(\);\s*setHolds\(holdsData\);\s*\} catch \(e\) \{\}\s*\}, 10000\);/g,
  'const pollHolds = setInterval(() => {\n      loadData();\n    }, 3000);'
);

fs.writeFileSync('src/pages/staff/StaffApp.tsx', code);
