const fs = require("fs");
let code = fs.readFileSync("src/pages/staff/StaffApp.tsx", "utf8");

// Fix N/A issue
code = code.replace(/let endStr = .N\/A.;/g, "let endStr = b.checkOut;");
code = code.replace(/endStr = .10:00\\(hsau\\).;/g, "endStr = \"10:00 (hsau)\";");
code = code.replace(/endStr = .12:00\\(hsau\\).;/g, "endStr = \"12:00 (hsau)\";");

// I will completely replace the <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"> block
const oldGridStart = code.indexOf("<div className=\"grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6\">");
const oldGridEnd = code.indexOf("{/* Chi ti?t Booking Modal */}");

if (oldGridStart !== -1 && oldGridEnd !== -1) {
  const newGrid = `
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
        {roomsList.map(room => {
          const { status, booking } = getRoomRealtimeStatus(room.name);
          const slots = getBookedSlotsForRoom(room.name, selectedDate);
          
          const styles = {
            available: { wrapper: "bg-white border-green-200 hover:border-green-400", header: "text-green-700", badge: "bg-green-100 text-green-700", inner: "bg-gray-50" },
            occupied: { wrapper: "bg-red-50 border-red-200", header: "text-red-700", badge: "bg-red-100 text-red-700", inner: "bg-white/60" },
            dirty: { wrapper: "bg-yellow-50 border-yellow-300", header: "text-yellow-700", badge: "bg-yellow-100 text-yellow-700", inner: "bg-white/60" }
          };
          const currentStyle = styles[status as keyof typeof styles];

          return (
            <div 
              key={room.id}
              onClick={() => {
                if (status === "available") {
                  setManualForm(prev => ({ ...prev, roomName: room.name, bookingDate: selectedDate }));
                  setShowAddModal(true);
                } else if (status === "dirty") {
                  if (window.confirm("Phòng " + room.name + " dã d?n d?p xong?")) {
                    handleUpdateStatus(booking.id || booking.bookingId, "completed");
                  }
                } else {
                  setSelectedBooking(booking);
                }
              }}
              className={\`relative rounded-2xl border-2 p-4 cursor-pointer transition-all hover:shadow-md flex flex-col \${currentStyle.wrapper}\`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className={\`text-xl font-bold \${currentStyle.header}\`}>{room.name}</h3>
                <div className={\`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider \${currentStyle.badge}\`}>
                  {status === "available" ? "ÐANG TR?NG" : status === "occupied" ? "ÐANG ?" : "CH? D?N"}
                </div>
              </div>
              
              <div className={\`mt-auto rounded-xl p-3 border border-gray-100/50 \${currentStyle.inner}\`}>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex justify-between">
                  <span>L?ch ngày {selectedDate.split("-").reverse().join("/")}</span>
                  <span className="text-gray-300">{slots.length} don</span>
                </div>
                
                <div className="space-y-1">
                  {slots.length > 0 ? slots.map((s, idx) => (
                    <div 
                      key={idx} 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBooking(s.bookingInfo);
                      }}
                      className={\`flex items-center justify-between py-1.5 px-2 rounded-lg text-sm hover:brightness-95 transition-all \${s.status === "checked_in" ? "bg-red-100 text-red-800" : "bg-blue-50 text-blue-800"}\`}
                    >
                      <span className="font-mono font-bold text-xs">{s.time}</span>
                      <span className="font-medium text-[11px] truncate ml-2 max-w-[100px]">{s.customer}</span>
                    </div>
                  )) : (
                    <div className="text-sm text-gray-400 italic py-2 text-center bg-gray-100/50 rounded-lg border border-dashed border-gray-200">
                      Tr?ng c? ngày
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      `;
  code = code.substring(0, oldGridStart) + newGrid + code.substring(oldGridEnd);
  fs.writeFileSync("src/pages/staff/StaffApp.tsx", code);
  console.log("Replaced UI successfully");
} else {
  console.log("Could not find grid bounds");
}

