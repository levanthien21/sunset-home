const fs = require('fs');
let code = fs.readFileSync('src/pages/staff/StaffApp.tsx', 'utf8');

const lines = code.split('\n');

// Block 1: Alerts logic
const alertStart = lines.findIndex(l => l.includes('const start = new Date(b.checkIn.replace('));
let alertEnd = alertStart;
while (alertEnd < lines.length && !lines[alertEnd].includes('const now = new Date().getTime();')) {
  alertEnd++;
}

if (alertStart !== -1 && alertEnd > alertStart) {
  const newLogic = `          let end = null;
          if (b.end_time) {
            end = new Date(b.end_time);
          } else {
            const start = new Date(b.checkIn.replace(/ /g, 'T'));
            const extraMatch = b.checkOut.match(/\\(\\+(\\d+)h\\)/);
            const extra = extraMatch ? parseInt(extraMatch[1]) : 0;
            let baseHours = 1;
            const hourMatch = b.checkOut.match(/(\\d+)\\s*(H|giờ)/i);
            if (hourMatch) baseHours = parseInt(hourMatch[1]);
            end = new Date(start.getTime() + (baseHours + extra) * 3600000);
          }
          if (!end || isNaN(end.getTime())) return null;`;
  code = lines.slice(0, alertStart).join('\n') + '\n' + newLogic + '\n' + lines.slice(alertEnd).join('\n');
}

// Block 2: Extension logic
const lines2 = code.split('\n');
const extStart = lines2.findIndex(l => l.includes('const currentStart = new Date(selectedBooking.checkIn.replace('));
let extEnd = extStart;
while (extEnd < lines2.length && !lines2[extEnd].includes('const newEndWithBuffer')) {
  extEnd++;
}

if (extStart !== -1 && extEnd > extStart) {
  const newExtLogic = `                             let currentEnd = null;
                             if (selectedBooking.end_time) {
                               currentEnd = new Date(selectedBooking.end_time);
                             } else {
                               const currentStart = new Date(selectedBooking.checkIn.replace(/ /g, 'T'));
                               const extraMatch = selectedBooking.checkOut.match(/\\(\\+(\\d+)h\\)/);
                               const currentExtra = extraMatch ? parseInt(extraMatch[1]) : 0;
                               let baseHours = 1;
                               const hourMatch = selectedBooking.checkOut.match(/(\\d+)\\s*(H|giờ)/i);
                               if (hourMatch) baseHours = parseInt(hourMatch[1]);
                               currentEnd = new Date(currentStart.getTime() + (baseHours + currentExtra) * 3600000);
                             }`;
  code = lines2.slice(0, extStart).join('\n') + '\n' + newExtLogic + '\n' + lines2.slice(extEnd).join('\n');
}

fs.writeFileSync('src/pages/staff/StaffApp.tsx', code);
console.log('Success replacing blocks');
