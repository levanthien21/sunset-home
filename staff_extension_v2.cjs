const fs = require("fs");
let code = fs.readFileSync("src/pages/staff/StaffApp.tsx", "utf8");

const extendUI = `
                {selectedBooking.status === "checked_in" && (
                  <div className="mt-4 border-t pt-4 border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-2 uppercase text-xs tracking-wider">Gia hạn thêm giờ</h4>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        min="1"
                        placeholder="Số giờ"
                        id="extendHoursInput"
                        className="w-24 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                      />
                      <button 
                        onClick={async () => {
                          const input = document.getElementById("extendHoursInput");
                          const hours = parseInt(input.value);
                          if (!hours || hours < 1) return alert("Vui lòng nhập số giờ hợp lệ");
                          
                          const nextBooking = bookings
                            .filter(b => b.roomName === selectedBooking.roomName && (b.status === "approved" || b.status === "pending" || b.status === "paid"))
                            .sort((a,b) => new Date(a.checkIn.replace(" ","T")).getTime() - new Date(b.checkIn.replace(" ","T")).getTime())[0];
                            
                          if (nextBooking) {
                             const currentStart = new Date(selectedBooking.checkIn.replace(" ", "T"));
                             const extraMatch = selectedBooking.checkOut.match(/\\(\\+(\\d+)h\\)/);
                             const currentExtra = extraMatch ? parseInt(extraMatch[1]) : 0;
                             let currentEnd = new Date(currentStart.getTime());
                             
                             if (selectedBooking.checkOut.includes("2H") || selectedBooking.checkOut.includes("2 giờ")) currentEnd = new Date(currentStart.getTime() + (2 + currentExtra) * 3600000);
                             else if (selectedBooking.checkOut.includes("4H") || selectedBooking.checkOut.includes("4 giờ")) currentEnd = new Date(currentStart.getTime() + (4 + currentExtra) * 3600000);
                             
                             const newEndWithBuffer = new Date(currentEnd.getTime() + (hours * 3600000) + (30 * 60000));
                             const nextStart = new Date(nextBooking.checkIn.replace(" ", "T"));
                             
                             if (newEndWithBuffer > nextStart) {
                               alert("❌ Lỗi: Không thể gia hạn! Phòng đã có khách mới đặt vào lúc " + nextBooking.checkIn + ". Bạn phải chừa ít nhất 30p dọn phòng.");
                               return;
                             }
                          }
                          
                          try {
                            const { updateBookingAddons } = await import("../../utils/db");
                            const newAddons = [...(selectedBooking.addons || []), { name: "Gia hạn " + hours + "H", price: hours * 50000 }];
                            const newTotal = Number(selectedBooking.total) + (hours * 50000);
                            await updateBookingAddons(selectedBooking.id || selectedBooking.bookingId, newAddons, newTotal);
                            alert("Đã gia hạn thành công " + hours + " giờ!");
                            window.location.reload();
                          } catch (err) {
                            alert("Lỗi gia hạn!");
                          }
                        }}
                        className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700"
                      >
                        Gia hạn
                      </button>
                    </div>
                  </div>
                )}
`;

const insertIdx = code.indexOf("<div className=\"mt-8\">");
if (insertIdx !== -1 && code.indexOf("Gia hạn thêm giờ") === -1) {
  code = code.substring(0, insertIdx) + extendUI + "\n                " + code.substring(insertIdx);
  fs.writeFileSync("src/pages/staff/StaffApp.tsx", code);
  console.log("Success");
}
