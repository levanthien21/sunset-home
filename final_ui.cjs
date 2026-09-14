const fs = require('fs');
let code = fs.readFileSync('src/pages/staff/StaffApp.tsx', 'utf8');

const lines = code.split('\n');
const startIndex = lines.findIndex(l => l.includes('<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">'));
const endIndex = lines.findIndex((l, idx) => idx > startIndex && l.includes('{/* Chi tiết Booking Modal */}'));

if (startIndex !== -1 && endIndex !== -1) {
  const newGrid = `
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
        {roomsList.map(room => {
          const { status, booking } = getRoomRealtimeStatus(room.name);
          const slots = getBookedSlotsForRoom(room.name, selectedDate);
          
          const styles = {
            available: { wrapper: "bg-white border-green-200 hover:border-green-500", header: "text-green-700", badge: "bg-green-100 text-green-700", inner: "bg-gray-50/50" },
            occupied: { wrapper: "bg-red-50 border-red-200 hover:border-red-300", header: "text-red-700", badge: "bg-red-100 text-red-700", inner: "bg-white/60" },
            dirty: { wrapper: "bg-yellow-50 border-yellow-300 hover:border-yellow-400", header: "text-yellow-700", badge: "bg-yellow-100 text-yellow-700", inner: "bg-white/60" }
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
                  if (window.confirm("Phòng " + room.name + " đã dọn dẹp xong?")) {
                    handleUpdateStatus(booking.id || booking.bookingId, "completed");
                  }
                } else {
                  setSelectedBooking(booking);
                }
              }}
              className={\`relative rounded-3xl border-2 p-5 cursor-pointer transition-all hover:shadow-lg flex flex-col \${currentStyle.wrapper}\`}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className={\`text-2xl font-black font-serif \${currentStyle.header}\`}>{room.name}</h3>
                <div className={\`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm \${currentStyle.badge}\`}>
                  {status === "available" ? "🟢 TRỐNG" : status === "occupied" ? "🔴 ĐANG Ở" : "🟡 CHỜ DỌN"}
                </div>
              </div>
              
              <div className={\`mt-auto rounded-2xl p-3 border border-gray-100/50 \${currentStyle.inner}\`}>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex justify-between border-b border-gray-200/50 pb-2">
                  <span>Lịch ngày {selectedDate.split("-").reverse().join("/")}</span>
                  <span className="text-gray-400 bg-gray-100 px-2 rounded-full">{slots.length} đơn</span>
                </div>
                
                <div className="space-y-2">
                  {slots.length > 0 ? slots.map((s: any, idx: number) => (
                    <div 
                      key={idx} 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBooking(s.bookingInfo);
                      }}
                      className={\`flex items-center justify-between py-2 px-3 rounded-xl text-sm shadow-sm hover:scale-[1.02] transition-all \${s.status === "checked_in" ? "bg-red-50 text-red-900 border border-red-100" : "bg-white text-blue-900 border border-gray-100"}\`}
                    >
                      <span className="font-mono font-bold text-xs">{s.time}</span>
                      <span className="font-bold text-[11px] truncate ml-2 max-w-[120px] opacity-80">{s.customer}</span>
                    </div>
                  )) : (
                    <div className="text-sm font-medium text-gray-400 italic py-4 text-center rounded-xl border-2 border-dashed border-gray-200">
                      Trống nguyên ngày
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
`;

  const newLines = [...lines.slice(0, startIndex), newGrid, ...lines.slice(endIndex)];
  fs.writeFileSync('src/pages/staff/StaffApp.tsx', newLines.join('\n'));
  console.log('Success');
} else {
  console.log('Not found', startIndex, endIndex);
}
