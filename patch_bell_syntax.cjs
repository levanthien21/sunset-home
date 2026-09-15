const fs = require('fs');

let content = fs.readFileSync('c:/Users/ASUS/Desktop/Sunset home/src/components/NotificationBell.tsx', 'utf8');
content = content.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync('c:/Users/ASUS/Desktop/Sunset home/src/components/NotificationBell.tsx', content);
