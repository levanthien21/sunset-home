const fs = require('fs');
let code = fs.readFileSync('src/pages/staff/StaffApp.tsx', 'utf8');

code = code.replace(
  /if \(dirty\) return \{ status: ["']dirty["'], booking: dirty \};\s*return \{ status: ["']available["'], booking: null \};/g,
  'if (dirty) return { status: "dirty", booking: dirty };\n    const isHold = holds.find(h => h.room_name === roomName);\n    if (isHold) return { status: "holding", booking: null };\n    return { status: "available", booking: null };'
);

fs.writeFileSync('src/pages/staff/StaffApp.tsx', code);
