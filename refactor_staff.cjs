const fs = require("fs");
let code = fs.readFileSync("src/pages/staff/StaffApp.tsx", "utf8");

const newModal = `      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
              <h3 className="text-lg font-bold text-gray-900">T?o Ðon: <span className="text-yellow-600">{manualForm.roomName || "Chua ch?n phòng"}</span></h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 bg-gray-50/50">
              <form id="manual-booking-form" onSubmit={handleAddBooking} className="space-y-6">
                
                {/* LO?I KHÁCH & TH?I GIAN */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <div className="flex p-1 bg-gray-100 rounded-xl">
                    <button 
                      type="button"
                      onClick={() => setManualForm({...manualForm, status: "checked_in", bookingDate: new Date().toLocaleDateString("en-CA"), expectedTime: new Date().toTimeString().slice(0,5)})}
                      className={\`flex-1 py-2 text-sm font-bold rounded-lg transition-all \${manualForm.status === "checked_in" ? "bg-white shadow text-yellow-600" : "text-gray-500"}\`}
                    >Vào ? Ngay</button>
                    <button 
                      type="button"
                      onClick={() => setManualForm({...manualForm, status: "approved"})}
                      className={\`flex-1 py-2 text-sm font-bold rounded-lg transition-all \${manualForm.status === "approved" ? "bg-white shadow text-blue-600" : "text-gray-500"}\`}
                    >Ð?t L?ch Tru?c</button>
                  </div>

                  {manualForm.status === "approved" && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Ngày nh?n</label>
                        <input required type="date" value={manualForm.bookingDate} onChange={e => setManualForm({...manualForm, bookingDate: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-xl text-sm font-bold outline-none focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Gi? nh?n</label>
                        <input required type="time" value={manualForm.expectedTime} onChange={e => setManualForm({...manualForm, expectedTime: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-xl text-sm font-bold outline-none focus:border-blue-500" />
                      </div>
                    </div>
                  )}
                </div>

                {/* GÓI GI? */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <label className="block text-[10px] font-bold text-gray-400 mb-3 uppercase">Ch?n Gói Th?i Gian</label>
                  <div className="grid grid-cols-2 gap-3">
                    {roomsList.find(r => r.name === manualForm.roomName)?.combos?.map((c, idx) => (
                      <button 
                        key={idx}
                        type="button"
                        onClick={() => setManualForm({...manualForm, selectedComboIndex: idx})}
                        className={\`p-3 rounded-xl border text-left transition-all \${manualForm.selectedComboIndex === idx ? "border-yellow-500 bg-yellow-50 ring-2 ring-yellow-500/20" : "border-gray-200 hover:border-gray-300"}\`}
                      >
                        <div className={\`font-bold text-sm \${manualForm.selectedComboIndex === idx ? "text-yellow-700" : "text-gray-700"}\`}>{c.name}</div>
                        <div className={\`text-xs font-bold mt-1 \${manualForm.selectedComboIndex === idx ? "text-yellow-600" : "text-gray-400"}\`}>{c.price.toLocaleString("vi-VN")}d</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* THÔNG TIN TÙY CH?N */}
                <details className="bg-white rounded-2xl border border-gray-100 shadow-sm group">
                  <summary className="p-4 text-sm font-bold text-gray-600 cursor-pointer list-none flex justify-between items-center">
                    Thông tin thêm (Không b?t bu?c)
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">?</span>
                  </summary>
                  <div className="p-4 pt-0 border-t border-gray-100 space-y-4 mt-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Tên khách</label>
                        <input type="text" placeholder="Khách l?" value={manualForm.customerName} onChange={e => setManualForm({...manualForm, customerName: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-gray-400" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Ði?n tho?i</label>
                        <input type="text" placeholder="Tr?ng" value={manualForm.phone} onChange={e => setManualForm({...manualForm, phone: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-gray-400" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Gia h?n thêm (Gi?)</label>
                        <input type="number" min="0" value={manualForm.extraHours} onChange={e => setManualForm({...manualForm, extraHours: Number(e.target.value)})} className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-gray-400" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Thanh toán</label>
                        <select value={manualForm.paymentMethod} onChange={e => setManualForm({...manualForm, paymentMethod: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-gray-400">
                          <option value="transfer">Chuy?n kho?n / Ti?n m?t</option>
                          <option value="qr">PayOS (QR code)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </details>

              </form>
            </div>

            <div className="p-5 border-t border-gray-100 bg-white">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-gray-500">T?ng ti?n:</span>
                <span className="text-2xl font-black text-red-600">{manualForm.total.toLocaleString("vi-VN")} d</span>
              </div>
              <button form="manual-booking-form" type="submit" className={\`w-full py-3.5 rounded-xl font-black text-white text-lg shadow-lg transition-all \${manualForm.status === "checked_in" ? "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/30" : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30"}\`}>
                {manualForm.status === "checked_in" ? "?? B?T Ð?U TÍNH GI?" : "?? LUU L?CH Ð?T"}
              </button>
            </div>
          </div>
        </div>
      )}`;

const startIdx = code.indexOf("{/* Add Modal */}");
if (startIdx !== -1) {
  const endIdx = code.indexOf("</div>\n  );\n}\n\nexport default function StaffApp");
  if (endIdx !== -1) {
     const newCode = code.substring(0, startIdx) + newModal + "\n    " + code.substring(endIdx);
     fs.writeFileSync("src/pages/staff/StaffApp.tsx", newCode);
     console.log("Successfully replaced Add Modal in StaffApp");
  }
}

