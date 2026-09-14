const fs = require("fs");
let code = fs.readFileSync("src/utils/db.ts", "utf8");

const oldAdd = "export const addBooking = async (booking: any) => {";
const newAdd = `export const addBooking = async (booking: any) => {
  // B? sung start_time và end_time cho Database m?i
  try {
    if (booking.checkIn && booking.checkOut) {
      const safeCheckInStr = booking.checkIn.replace(" ", "T");
      const start = new Date(safeCheckInStr);
      if (!isNaN(start.getTime())) {
        booking.start_time = start.toISOString();
        const extraMatch = booking.checkOut.match(/\\(\\+(\\d+)h\\)/);
        const extra = extraMatch ? parseInt(extraMatch[1]) : 0;
        let end = new Date(start.getTime());
        if (booking.checkOut.includes("2H") || booking.checkOut.includes("2 gi?")) {
          end = new Date(start.getTime() + (2 + extra) * 3600000);
        } else if (booking.checkOut.includes("4H") || booking.checkOut.includes("4 gi?")) {
          end = new Date(start.getTime() + (4 + extra) * 3600000);
        } else if (booking.checkOut.toLowerCase().includes("dêm")) {
          end.setDate(end.getDate() + 1);
          end.setHours(10, 0, 0, 0);
          end = new Date(end.getTime() + extra * 3600000);
        } else if (booking.checkOut.toLowerCase().includes("ngày")) {
          end.setDate(end.getDate() + 1);
          end.setHours(12, 0, 0, 0);
          end = new Date(end.getTime() + extra * 3600000);
        } else {
          end = new Date(start.getTime() + (1 + extra) * 3600000); // M?c d?nh 1h
        }
        booking.end_time = end.toISOString();
      }
    }
  } catch(e) {
    console.error("L?i tính toán start_time/end_time:", e);
  }
`;
code = code.replace(oldAdd, newAdd);
fs.writeFileSync("src/utils/db.ts", code);

