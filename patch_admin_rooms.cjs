const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminRooms.tsx', 'utf8');

// Ensure handleSave saves status
code = code.replace(
  'combos: editingRoom.combos',
  'combos: editingRoom.combos,\n        status: editingRoom.status'
);

const formToggle = `
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="flex items-center cursor-pointer">
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            className="sr-only" 
                            checked={editingRoom.status === 'maintenance'}
                            onChange={(e) => setEditingRoom({...editingRoom, status: e.target.checked ? 'maintenance' : 'available'})}
                          />
                          <div className={\`block w-14 h-8 rounded-full transition-colors \${editingRoom.status === 'maintenance' ? 'bg-red-500' : 'bg-green-500'}\`}></div>
                          <div className={\`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform \${editingRoom.status === 'maintenance' ? 'transform translate-x-6' : ''}\`}></div>
                        </div>
                        <div className="ml-3 text-sm font-bold text-gray-700">
                          {editingRoom.status === 'maintenance' ? 'ĐANG BẢO TRÌ (Khóa phòng)' : 'HOẠT ĐỘNG BÌNH THƯỜNG'}
                        </div>
                      </label>
                      <p className="text-xs text-gray-500 mt-2">Khi bật chế độ bảo trì, lễ tân và khách hàng sẽ không thể đặt phòng này.</p>
                    </div>
`;

code = code.replace(
  '<h3 className="text-sm font-bold text-gray-700 mb-2 uppercase">Cấu hình Gói giờ</h3>',
  formToggle + '\n                    <h3 className="text-sm font-bold text-gray-700 mb-2 mt-6 uppercase">Cấu hình Gói giờ</h3>'
);

const viewStatus = `
                  <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
                    <DoorOpen size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{room.name}</h2>
                    {room.status === 'maintenance' ? (
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">BẢO TRÌ</span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700">SẴN SÀNG</span>
                    )}
                  </div>
`;

code = code.replace(
  '<div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">\n                    <DoorOpen size={20} />\n                  </div>\n                  <h2 className="text-xl font-bold text-gray-900">{room.name}</h2>',
  viewStatus
);
// Also support CRLF variation
code = code.replace(
  '<div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">\r\n                    <DoorOpen size={20} />\r\n                  </div>\r\n                  <h2 className="text-xl font-bold text-gray-900">{room.name}</h2>',
  viewStatus
);

fs.writeFileSync('src/pages/admin/AdminRooms.tsx', code);
console.log('AdminRooms patched');
