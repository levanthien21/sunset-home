const fs = require("fs");
let code = fs.readFileSync("src/pages/staff/StaffApp.tsx", "utf8");

// I need to add an alert panel at the top.
// I will find `<h1 className="text-3xl font-serif text-gray-900">So d? Phòng & Khung gi?</h1>`
// and insert the alerts below it.
const alertUI = `
      {/* H? TH?NG C?NH BÁO THÔNG MINH */}
      <div className="mb-8 space-y-2">
        {bookings.filter(b => b.status === "approved" || b.status === "pending").map(b => {
          if(!b.checkIn) return null;
          try {
            // Need to parse date properly because checkIn is "YYYY-MM-DD HH:mm"
            const safeCheckInStr = b.checkIn.replace(" ", "T");
            const checkInTime = new Date(safeCheckInStr).getTime();
            const now = new Date().getTime();
            const diffMins = Math.floor((checkInTime - now) / 60000);
            
            if (diffMins > 0 && diffMins <= 60) {
              return (
                <div key={b.id || b.bookingId} className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-r-lg shadow-sm flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping mr-3"></div>
                  <span className="text-sm font-bold text-yellow-800">
                    S?P CÓ KHÁCH: Phòng {b.roomName} dón khách ({b.customerName || "Khách l?"}) trong {diffMins} phút n?a.
                  </span>
                </div>
              );
            }
            if (diffMins <= 0 && diffMins >= -60) {
              return (
                <div key={b.id || b.bookingId} className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg shadow-sm flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping mr-3"></div>
                  <span className="text-sm font-bold text-red-800">
                    KHÁCH TR? GI?: Phòng {b.roomName} dã d?n gi? nh?n phòng nhung chua th?y khách check-in!
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
            
            if (b.checkOut.includes("2H") || b.checkOut.includes("2 gi?")) end = new Date(start.getTime() + (2 + extra) * 3600000);
            else if (b.checkOut.includes("4H") || b.checkOut.includes("4 gi?")) end = new Date(start.getTime() + (4 + extra) * 3600000);
            else return null; // Overnights are hard to alert simply without exact end_time column

            const now = new Date().getTime();
            const diffMins = Math.floor((end.getTime() - now) / 60000);
            
            if (diffMins > 0 && diffMins <= 30) {
              return (
                <div key={b.id || b.bookingId} className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded-r-lg shadow-sm flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping mr-3"></div>
                  <span className="text-sm font-bold text-orange-800">
                    S?P H?T GI?: Phòng {b.roomName} còn {diffMins} phút n?a là h?t gi? luu trú. Hãy chu?n b? h? tr? check-out!
                  </span>
                </div>
              );
            }
            if (diffMins <= 0) {
              return (
                <div key={b.id || b.bookingId} className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg shadow-sm flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping mr-3"></div>
                  <span className="text-sm font-bold text-red-800">
                    QUÁ GI?: Phòng {b.roomName} dã l? {Math.abs(diffMins)} phút. Vui lòng liên h? khách!
                  </span>
                </div>
              );
            }
          } catch(e) {}
          return null;
        })}
      </div>
`;
const insertIdx = code.indexOf("<div className=\\"grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6\\">");
if (insertIdx !== -1) {
  code = code.substring(0, insertIdx) + alertUI + "\\n      " + code.substring(insertIdx);
  fs.writeFileSync("src/pages/staff/StaffApp.tsx", code);
}

