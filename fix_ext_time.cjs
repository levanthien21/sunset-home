const fs = require("fs");
let code = fs.readFileSync("src/pages/staff/StaffApp.tsx", "utf8");

const oldLogic = `                             const currentStart = new Date(selectedBooking.checkIn.replace(" ", "T"));
                             const extraMatch = selectedBooking.checkOut.match(/\\(\\+(\\d+)h\\)/);
                             const currentExtra = extraMatch ? parseInt(extraMatch[1]) : 0;
                             let currentEnd = new Date(currentStart.getTime());
                             
                             if (selectedBooking.checkOut.includes("2H") || selectedBooking.checkOut.includes("2 gi?")) currentEnd = new Date(currentStart.getTime() + (2 + currentExtra) * 3600000);
                             else if (selectedBooking.checkOut.includes("4H") || selectedBooking.checkOut.includes("4 gi?")) currentEnd = new Date(currentStart.getTime() + (4 + currentExtra) * 3600000);`;

const newLogic = `                             let currentEnd = null;
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
                             }`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync("src/pages/staff/StaffApp.tsx", code);

