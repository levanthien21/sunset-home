import { useState, useEffect } from "react";
import { DoorOpen, Edit2, Save, X, Plus, Trash2 } from "lucide-react";

export default function AdminRooms() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRoom, setEditingRoom] = useState<any>(null);

  const fetchRooms = async () => {
    setLoading(true);
    const { getRooms } = await import("../../utils/db");
    const data = await getRooms();
    setRooms(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { updateRoom } = await import("../../utils/db");
      await updateRoom(editingRoom.id, {
        name: editingRoom.name,
        extra_hour_price: editingRoom.extra_hour_price,
        combos: editingRoom.combos,
        status: editingRoom.status
      });
      alert("Cập nhật phòng thành công!");
      setEditingRoom(null);
      fetchRooms();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu!");
    }
  };

  return (
    <div className="p-4 md:p-8 font-sans max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Quản lý Phòng & Giá</h1>
          <p className="text-gray-500">Thiết lập cấu hình phòng, giá các gói theo giờ và qua đêm.</p>
        </div>
      </div>

      {loading ? (
         <div className="p-12 flex justify-center">
           <div className="w-8 h-8 border-4 border-gray-200 border-t-yellow-600 rounded-full animate-spin"></div>
         </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
                    <DoorOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{room.name}</h3>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{room.branch_id === 1 ? "Chi nhánh Bến Lức" : "Chi nhánh Hậu Nghĩa"}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Phụ thu giờ</div>
                    <div className="font-bold text-gray-900">{Number(room.extra_hour_price).toLocaleString("vi-VN")}đ / giờ</div>
                  </div>
                  {room.combos?.map((c: any, i: number) => (
                    <div key={i} className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                      <div className="text-[10px] text-yellow-600 font-bold uppercase mb-1">{c.name}</div>
                      <div className="font-bold text-yellow-900">{Number(c.price).toLocaleString("vi-VN")}đ</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-end border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                <button 
                  onClick={() => setEditingRoom(JSON.parse(JSON.stringify(room)))}
                  className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
                >
                  <Edit2 className="w-4 h-4 mr-2" /> Chỉnh sửa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingRoom && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-serif font-bold text-gray-900">Chỉnh sửa: {editingRoom.name}</h3>
              <button onClick={() => setEditingRoom(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="edit-room-form" onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Tên phòng</label>
                    <input 
                      required 
                      type="text" 
                      value={editingRoom.name} 
                      onChange={e => setEditingRoom({...editingRoom, name: e.target.value})} 
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Giá phụ thu giờ (VNĐ)</label>
                    <input 
                      required 
                      type="number" 
                      value={editingRoom.extra_hour_price} 
                      onChange={e => setEditingRoom({...editingRoom, extra_hour_price: Number(e.target.value)})} 
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none" 
                    />
                  </div>
                </div>

                
                <div className="mt-4 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={editingRoom.status === 'maintenance'}
                        onChange={(e) => setEditingRoom({...editingRoom, status: e.target.checked ? 'maintenance' : 'available'})}
                      />
                      <div className={`block w-14 h-8 rounded-full transition-colors ${editingRoom.status === 'maintenance' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${editingRoom.status === 'maintenance' ? 'transform translate-x-6' : ''}`}></div>
                    </div>
                    <div className="ml-3 text-sm font-bold text-gray-700">
                      {editingRoom.status === 'maintenance' ? 'ĐANG BẢO TRÌ (Khóa phòng)' : 'HOẠT ĐỘNG BÌNH THƯỜNG'}
                    </div>
                  </label>
                  <p className="text-xs text-gray-500 mt-2">Khi bật chế độ bảo trì, lễ tân và khách hàng sẽ không thể đặt phòng này.</p>
                </div>
<div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase">Các gói giờ (Combos)</label>
                    <button 
                      type="button"
                      onClick={() => setEditingRoom({...editingRoom, combos: [...(editingRoom.combos || []), { id: "combo-" + Date.now(), name: "Gói Mới", price: 0 }]})}
                      className="text-xs font-bold text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg flex items-center hover:bg-yellow-100"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Thêm gói
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {editingRoom.combos?.map((combo: any, index: number) => (
                      <div key={index} className="flex gap-3 items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div className="flex-1">
                          <input 
                            required 
                            type="text" 
                            value={combo.name} 
                            placeholder="Tên gói (VD: Gói 2H)"
                            onChange={e => {
                              const newCombos = [...editingRoom.combos];
                              newCombos[index].name = e.target.value;
                              setEditingRoom({...editingRoom, combos: newCombos});
                            }} 
                            className="w-full border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:border-yellow-500" 
                          />
                        </div>
                        <div className="flex-1">
                          <input 
                            required 
                            type="number" 
                            value={combo.price} 
                            placeholder="Giá (VNĐ)"
                            onChange={e => {
                              const newCombos = [...editingRoom.combos];
                              newCombos[index].price = Number(e.target.value);
                              setEditingRoom({...editingRoom, combos: newCombos});
                            }} 
                            className="w-full border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:border-yellow-500" 
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={() => {
                            const newCombos = [...editingRoom.combos];
                            newCombos.splice(index, 1);
                            setEditingRoom({...editingRoom, combos: newCombos});
                          }}
                          className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {(!editingRoom.combos || editingRoom.combos.length === 0) && (
                      <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                        Chưa có gói giờ nào
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-4">
              <button onClick={() => setEditingRoom(null)} className="px-6 py-2.5 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors">
                Hủy
              </button>
              <button form="edit-room-form" type="submit" className="px-6 py-2.5 bg-yellow-600 text-white font-bold rounded-xl hover:bg-yellow-700 transition-colors flex items-center">
                <Save className="w-4 h-4 mr-2" /> Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
