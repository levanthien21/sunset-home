const fs = require('fs');
let content = fs.readFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/staff/StaffApp.tsx', 'utf8');

if (!content.includes('NotificationBell')) {
  content = content.replace('import { useState', `import NotificationBell from '../../components/NotificationBell';\nimport { useState`);
  
  // also fix the typo from my previous replacement: `</div>>`
  content = content.replace('</div>>', '</div>');
  
  fs.writeFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/staff/StaffApp.tsx', content);
} else {
  // Just fix the typo if it exists
  content = content.replace('</div>>', '</div>');
  
  // check if import is there
  if (!content.includes('import NotificationBell')) {
      content = content.replace('import { useState', `import NotificationBell from '../../components/NotificationBell';\nimport { useState`);
  }
  
  fs.writeFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/staff/StaffApp.tsx', content);
}
