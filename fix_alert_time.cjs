const fs = require("fs");
let code = fs.readFileSync("src/pages/staff/StaffApp.tsx", "utf8");

const oldLogic = `            const start = new Date(b.checkIn.replace(" ", "T"));
            const extraMatch = b.checkOut.match(/\\(\\+(\\d+)h\\)/);
            const extra = extraMatch ? parseInt(extraMatch[1]) : 0;
            let end = new Date(start.getTime());
            
            if (b.checkOut.includes("2H") || b.checkOut.includes("2 gi?")) end = new Date(start.getTime() + (2 + extra) * 3600000);
            else if (b.checkOut.includes("4H") || b.checkOut.includes("4 gi?")) end = new Date(start.getTime() + (4 + extra) * 3600000);
            else return null;`;

const newLogic = `            let end = null;
            if (b.end_time) {
              end = new Date(b.end_time);
            } else {
              const start = new Date(b.checkIn.replace(" ", "T"));
              const extraMatch = b.checkOut.match(/\\(\\+(\\d+)h\\)/);
              const extra = extraMatch ? parseInt(extraMatch[1]) : 0;
              
              // C? g?ng t? trích xu?t s? gi? t? chu?i (ví d?: "Gói 3H" -> 3)
              let baseHours = 1;
              const hourMatch = b.checkOut.match(/(\\d+)\\s*(H|gi?)/i);
              if (hourMatch) baseHours = parseInt(hourMatch[1]);
              
              if (b.checkOut.toLowerCase().includes("dêm")) baseHours = 14; // U?c ch?ng cho dêm
              if (b.checkOut.toLowerCase().includes("ngày")) baseHours = 22; // U?c ch?ng cho ngày
              
              end = new Date(start.getTime() + (baseHours + extra) * 3600000);
            }
            if (!end || isNaN(end.getTime())) return null;`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync("src/pages/staff/StaffApp.tsx", code);

