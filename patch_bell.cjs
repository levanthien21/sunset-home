const fs = require('fs');

function addNotificationBell(filePath, importPath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('NotificationBell')) {
    // Add import
    content = content.replace(/(import .*;\n)(?!import)/s, \`$1import NotificationBell from '\${importPath}';\n\`);
    
    // Add component based on app
    if (filePath.includes('CustomerApp')) {
      content = content.replace(/<Link to="\/profile".*?<\/Link>/s, (match) => {
        return \`<NotificationBell />\n              \` + match;
      });
    } else if (filePath.includes('AdminApp') || filePath.includes('StaffApp')) {
      // Find the logout button container and add before it
      content = content.replace(/(<button[^>]*onClick=\{.*?signOut.*?<\/button>)/s, (match) => {
         // In AdminApp mobile header
         if (content.includes('md:hidden fixed top-0 left-0 right-0') && match.includes('Xuất')) {
           return \`<div className="flex items-center space-x-2">\n          <NotificationBell />\n          \` + match + \`\n        </div>\`;
         }
         return \`<NotificationBell />\n          \` + match;
      });
      // AdminApp desktop sidebar doesn't need bell, but maybe we can put it there. Or we can just use replace_file_content safely.
    }
    fs.writeFileSync(filePath, content);
  }
}

try {
  addNotificationBell('c:/Users/ASUS/Desktop/Sunset home/src/pages/customer/CustomerApp.tsx', '../../components/NotificationBell');
  console.log('Added to CustomerApp');
} catch(e) { console.error(e) }

