const fs = require('fs');
let code = fs.readFileSync('src/pages/staff/StaffApp.tsx', 'utf8');

code = code.replace(
  /if \(b\.checkOut\.includes\("2H"\) \|\| b\.checkOut\.includes\("2 giờ"\)\) end = new Date\(start\.getTime\(\) \+ \(2 \+ extra\) \* 3600000\);\s*else if \(b\.checkOut\.includes\("4H"\) \|\| b\.checkOut\.includes\("4 giờ"\)\) end = new Date\(start\.getTime\(\) \+ \(4 \+ extra\) \* 3600000\);\s*else return null;/g,
  `let baseHours = 1;
            const hourMatch = b.checkOut.match(/(\\d+)\\s*(H|giờ)/i);
            if (hourMatch) baseHours = parseInt(hourMatch[1]);
            end = b.end_time ? new Date(b.end_time) : new Date(start.getTime() + (baseHours + extra) * 3600000);
            if (!end || isNaN(end.getTime())) return null;`
);

code = code.replace(
  /if \(selectedBooking\.checkOut\.includes\("2H"\) \|\| selectedBooking\.checkOut\.includes\("2 giờ"\)\) currentEnd = new Date\(currentStart\.getTime\(\) \+ \(2 \+ currentExtra\) \* 3600000\);\s*else if \(selectedBooking\.checkOut\.includes\("4H"\) \|\| selectedBooking\.checkOut\.includes\("4 giờ"\)\) currentEnd = new Date\(currentStart\.getTime\(\) \+ \(4 \+ currentExtra\) \* 3600000\);/g,
  `let baseHours = 1;
                             const hourMatch = selectedBooking.checkOut.match(/(\\d+)\\s*(H|giờ)/i);
                             if (hourMatch) baseHours = parseInt(hourMatch[1]);
                             currentEnd = selectedBooking.end_time ? new Date(selectedBooking.end_time) : new Date(currentStart.getTime() + (baseHours + currentExtra) * 3600000);`
);

fs.writeFileSync('src/pages/staff/StaffApp.tsx', code);
console.log('Success');
