const fs = require("fs");
let code = fs.readFileSync("src/pages/staff/StaffApp.tsx", "utf8");

const alertUI = `
      {/* HỆ THỐNG CẢNH BÁO THÔNG MINH */}
      <div className="mb-6 space-y-2">
        {bookings.filter(b => b.status === "approved" || b.status === "pending").map(b => {
          if(!b.checkIn) return null;
          try {
            const safeCheckInStr = b.checkIn.replace(" ", "T");
            const checkInTime = new Date(safeCheckInStr).getTime();
            const now = new Date().getTime();
            const diffMins = Math.floor((checkInTime - now) / 60000);
            
            if (diffMins > 0 && diffMins <= 60) {
              return (
                <div key={b.id || b.bookingId} className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-r-lg shadow-sm flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping mr-3"></div>
                  <span className="text-sm font-bold text-yellow-800">
                    SẮP CÓ KHÁCH: Phòng {b.roomName} đón khách ({b.customerName || "Khách lẻ"}) trong {diffMins} phút nữa.
                  </span>
                </div>
              );
            }
            if (diffMins <= 0 && diffMins >= -60) {
              return (
                <div key={b.id || b.bookingId} className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg shadow-sm flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping mr-3"></div>
                  <span className="text-sm font-bold text-red-800">
                    KHÁCH TRỄ GIỜ: Phòng {b.roomName} đã đến giờ nhận phòng ({b.checkIn}) nhưng chưa thấy check-in!
                  </span>
                </div>
              );
            }
          } catch(e) {}
          return null;
        })}
        {bookings.filter(b => b.status === "checked_in").map(b => {
          if(!b.checkIn || !b.checkOut) return null;
          try {
            const start = new Date(b.checkIn.replace(" ", "T"));
            const extraMatch = b.checkOut.match(/\\(\\+(\\d+)h\\)/);
            const extra = extraMatch ? parseInt(extraMatch[1]) : 0;
            let end = new Date(start.getTime());
            
            if (b.checkOut.includes("2H") || b.checkOut.includes("2 giờ")) end = new Date(start.getTime() + (2 + extra) * 3600000);
            else if (b.checkOut.includes("4H") || b.checkOut.includes("4 giờ")) end = new Date(start.getTime() + (4 + extra) * 3600000);
            else return null;

            const now = new Date().getTime();
            const diffMins = Math.floor((end.getTime() - now) / 60000);
            
            if (diffMins > 0 && diffMins <= 30) {
              return (
                <div key={b.id || b.bookingId} className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded-r-lg shadow-sm flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping mr-3"></div>
                  <span className="text-sm font-bold text-orange-800">
                    SẮP HẾT GIỜ: Phòng {b.roomName} còn {diffMins} phút nữa là hết giờ lưu trú.
                  </span>
                </div>
              );
            }
            if (diffMins <= 0) {
              return (
                <div key={b.id || b.bookingId} className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg shadow-sm flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping mr-3"></div>
                  <span className="text-sm font-bold text-red-800">
                    QUÁ GIỜ: Phòng {b.roomName} đã lố {Math.abs(diffMins)} phút. Vui lòng liên hệ khách!
                  </span>
                </div>
              );
            }
          } catch(e) {}
          return null;
        })}
        {bookings.filter(b => b.status === "checked_out_dirty").map(b => {
            const upcoming = bookings.find(ub => (ub.status === "approved" || ub.status === "pending") && ub.roomName === b.roomName);
            if (upcoming && upcoming.checkIn) {
                const checkInTime = new Date(upcoming.checkIn.replace(" ", "T")).getTime();
                const diffMins = Math.floor((checkInTime - new Date().getTime()) / 60000);
                if (diffMins > 0 && diffMins <= 120) {
                    return (
                        <div key={"dirty_warn_"+b.roomName} className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded-r-lg shadow-sm flex items-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping mr-3"></div>
                        <span className="text-sm font-bold text-purple-800">
                            ƯU TIÊN DỌN PHÒNG: Phòng {b.roomName} đang dơ nhưng khách mới sẽ đến trong {diffMins} phút nữa!
                        </span>
                        </div>
                    )
                }
            }
            return null;
        })}
      </div>
`;
const insertIdx = code.indexOf("<div className=\"grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6\">");
if (insertIdx !== -1 && code.indexOf("SẮP CÓ KHÁCH") === -1) {
  code = code.substring(0, insertIdx) + alertUI + "\n      " + code.substring(insertIdx);
  fs.writeFileSync("src/pages/staff/StaffApp.tsx", code);
  console.log("Success");
} else {
  console.log("Already inserted or target not found");
}
