const fs = require("fs");
let code = fs.readFileSync("src/pages/staff/StaffApp.tsx", "utf8");

code = code.replace(/const start = new Date\\(b\\.checkIn\\.replace\\(" ", "T"\\)\\);[\\s\\S]*?else return null;/g, `
            let end = null;
            if (b.end_time) {
              end = new Date(b.end_time);
            } else {
              const start = new Date(b.checkIn.replace(" ", "T"));
              const extraMatch = b.checkOut.match(/\\(\\+(\\d+)h\\)/);
              const extra = extraMatch ? parseInt(extraMatch[1]) : 0;
              let baseHours = 1;
              const hourMatch = b.checkOut.match(/(\\d+)\\s*(H|gi?)/i);
              if (hourMatch) baseHours = parseInt(hourMatch[1]);
              end = new Date(start.getTime() + (baseHours + extra) * 3600000);
            }
            if (!end || isNaN(end.getTime())) return null;
`);

code = code.replace(/const currentStart = new Date\\(selectedBooking\\.checkIn\\.replace\\(" ", "T"\\)\\);[\\s\\S]*?else if \\(selectedBooking\\.checkOut\\.includes\\("4H"\\) \\|\\| selectedBooking\\.checkOut\\.includes\\("4 gi?"\\)\\) currentEnd = new Date\\(currentStart\\.getTime\\(\\) \\+ \\(4 \\+ currentExtra\\) \\* 3600000\\);/g, `
                             let currentEnd = null;
                             if (selectedBooking.end_time) {
                               currentEnd = new Date(selectedBooking.end_time);
                             } else {
                               const currentStart = new Date(selectedBooking.checkIn.replace(" ", "T"));
                               const extraMatch = selectedBooking.checkOut.match(/\\(\\+(\\d+)h\\)/);
                               const currentExtra = extraMatch ? parseInt(extraMatch[1]) : 0;
                               let baseHours = 1;
                               const hourMatch = selectedBooking.checkOut.match(/(\\d+)\\s*(H|gi?)/i);
                               if (hourMatch) baseHours = parseInt(hourMatch[1]);
                               currentEnd = new Date(currentStart.getTime() + (baseHours + currentExtra) * 3600000);
                             }
`);

fs.writeFileSync("src/pages/staff/StaffApp.tsx", code);

