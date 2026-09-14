const fs = require('fs');
const lines = fs.readFileSync('src/pages/staff/StaffApp.tsx', 'utf8').split('\n');

const newAlertLogic = `            let end = null;
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

lines.splice(426, 7, newExtLogic);
lines.splice(252, 8, newAlertLogic);

fs.writeFileSync('src/pages/staff/StaffApp.tsx', lines.join('\n'));
console.log('Success replacing lines');
