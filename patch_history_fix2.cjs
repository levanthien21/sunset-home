const fs = require('fs');

let content = fs.readFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/customer/ProfilePage.tsx', 'utf8');

// The block to replace:
const oldPart1 = `{bookings.map((b, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}`;

const oldPart2 = `</motion.div>
            ))}`;

let startIndex = content.indexOf(oldPart1);
if (startIndex !== -1) {
  let rest = content.substring(startIndex);
  let endIndex = rest.indexOf(oldPart2) + oldPart2.length;
  
  let stringToReplace = rest.substring(0, endIndex);
  
  let newString = `{bookings.map((b, i) => (
              <BookingCard key={b.id || i} booking={b} index={i} />
            ))}`;
            
  content = content.replace(stringToReplace, newString);
  console.log("Successfully replaced the bookings list.");
} else {
  console.log("Could not find the bookings list to replace.");
}

// Remove MapPin from imports to fix TS error
content = content.replace('MapPin, ', '');

fs.writeFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/customer/ProfilePage.tsx', content);
