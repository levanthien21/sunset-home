import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Home, Settings, LogOut, BarChart3, TrendingUp, Plus, Trash2, Edit2, X, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import AdminUsers from './AdminUsers';
import AdminReports from './AdminReports';
import AdminBookings from './AdminBookings';
import AdminRooms from './AdminRooms';

function AdminDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [uploadingRoomId, setUploadingRoomId] = useState<string | null>(null);
  const [uploadingBranchId, setUploadingBranchId] = useState<number | null>(null);

  // Modals
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);

  const refreshData = async () => {
    const { getRooms, getBranches } = await import('../../utils/db');
    setRooms(await getRooms());
    setBranches(await getBranches());
  };

  useEffect(() => {
    const load = async () => {
      const { getBookings } = await import('../../utils/db');
      setBookings(await getBookings());
      await refreshData();
    };
    load();
  }, []);

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    const { addBranch, updateBranch } = await import('../../utils/db');
    if (editingBranch.id) {
      await updateBranch(editingBranch.id, {
        name: editingBranch.name,
        address: editingBranch.address,
        has_rooms: editingBranch.has_rooms
      });
    } else {
      await addBranch({
        name: editingBranch.name,
        address: editingBranch.address,
        has_rooms: editingBranch.has_rooms,
        img: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80'
      });
    }
    await refreshData();
    setIsBranchModalOpen(false);
  };

  const handleDeleteBranch = async (branchId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa cơ sở này?')) return;
    try {
      const { deleteBranch } = await import('../../utils/db');
      await deleteBranch(branchId);
      await refreshData();
    } catch (e) {
      alert("Không thể xóa cơ sở. Vui lòng xóa hết các phòng thuộc cơ sở này trước.");
    }
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const { addRoom, updateRoom } = await import('../../utils/db');
    if (editingRoom.id) {
      await updateRoom(editingRoom.id, {
        branch_id: editingRoom.branch_id,
        name: editingRoom.name,
        extra_hour_price: editingRoom.extra_hour_price,
        features: editingRoom.features,
        combos: editingRoom.combos
      });
    } else {
      await addRoom({
        branch_id: editingRoom.branch_id,
        name: editingRoom.name,
        extra_hour_price: editingRoom.extra_hour_price,
        features: editingRoom.features || [],
        combos: editingRoom.combos || [],
        images: []
      });
    }
    await refreshData();
    setIsRoomModalOpen(false);
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phòng này?')) return;
    try {
      const { deleteRoom } = await import('../../utils/db');
      await deleteRoom(roomId);
      await refreshData();
    } catch (e) {
      alert("Lỗi khi xóa phòng.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, roomId: string, existingImages: string[]) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploadingRoomId(roomId);
    
    try {
      const { uploadRoomImage, updateRoomImages } = await import('../../utils/db');
      
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadRoomImage(files[i]);
        if (url) newUrls.push(url);
      }
      
      if (newUrls.length > 0) {
        const combinedImages = [...existingImages, ...newUrls];
        await updateRoomImages(roomId, combinedImages);
        // Cập nhật lại UI tạm thời
        setRooms(rooms.map(r => r.id === roomId ? { ...r, images: combinedImages } : r));
      }
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi khi tải ảnh lên.");
    } finally {
      setUploadingRoomId(null);
    }
  };

  const handleBranchUpload = async (e: React.ChangeEvent<HTMLInputElement>, branchId: number) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploadingBranchId(branchId);
    try {
      const { uploadRoomImage, updateBranch } = await import('../../utils/db');
      // Tạm dùng chung uploadRoomImage cho nhánh vì đều upload ảnh
      const url = await uploadRoomImage(files[0]);
      if (url) {
        await updateBranch(branchId, { img: url });
        setBranches(branches.map(b => b.id === branchId ? { ...b, img: url } : b));
      }
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi khi tải ảnh cơ sở lên.");
    } finally {
      setUploadingBranchId(null);
    }
  };

  const handleRemoveImage = async (roomId: string, imgIndex: number, existingImages: string[]) => {
    if (!window.confirm("Bạn có chắc muốn xóa ảnh này?")) return;
    try {
      const { updateRoomImages } = await import('../../utils/db');
      const updatedImages = existingImages.filter((_, idx) => idx !== imgIndex);
      await updateRoomImages(roomId, updatedImages);
      setRooms(rooms.map(r => r.id === roomId ? { ...r, images: updatedImages } : r));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetCoverImage = async (roomId: string, imgIndex: number, existingImages: string[]) => {
    if (imgIndex === 0) return;
    try {
      const { updateRoomImages } = await import('../../utils/db');
      const updatedImages = [...existingImages];
      const [movedImg] = updatedImages.splice(imgIndex, 1);
      updatedImages.unshift(movedImg);
      await updateRoomImages(roomId, updatedImages);
      setRooms(rooms.map(r => r.id === roomId ? { ...r, images: updatedImages } : r));
    } catch (err) {
      console.error(err);
    }
  };

  const approvedBookings = bookings.filter(b => ['approved', 'paid'].includes(b.status));
  const expectedRevenue = approvedBookings.reduce((sum, b) => sum + b.total, 0);
  const collectedRevenue = approvedBookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);

  return (
    <div className="p-8 font-sans">
      <h1 className="text-3xl font-serif text-gray-900 mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp size={48} /></div>
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Thực thu</h3>
          <p className="text-3xl font-serif mt-2 text-green-600">{collectedRevenue.toLocaleString()}đ</p>
          <p className="text-xs text-gray-400 mt-2">Dự kiến: {expectedRevenue.toLocaleString()}đ</p>
        </div>
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Tổng cơ sở</h3>
          <p className="text-3xl font-serif mt-2">2</p>
        </div>
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Tổng phòng</h3>
          <p className="text-3xl font-serif mt-2">{rooms.length}</p>
        </div>
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Nhân sự</h3>
          <p className="text-3xl font-serif mt-2">4</p>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8">
        <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
          <h2 className="text-xl font-serif text-gray-900 mb-6 flex justify-between items-center">
            <span>Quản lý Cơ sở (Chi nhánh) {branches.length === 0 && <span className="text-xs text-red-500 ml-2">Chưa có dữ liệu cơ sở. Hãy chạy SQL!</span>}</span>
            <button onClick={() => { setEditingBranch({ name: '', address: '', has_rooms: true }); setIsBranchModalOpen(true); }} className="bg-yellow-600 text-white px-4 py-2 rounded-sm text-sm font-bold flex items-center hover:bg-yellow-700">
              <Plus size={16} className="mr-2" /> Thêm Cơ sở
            </button>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {branches.map(branch => (
              <div key={branch.id} className="p-5 bg-gray-50 rounded-sm border border-gray-100 flex gap-4">
                <div className="w-1/3 relative aspect-[4/3] rounded-sm overflow-hidden bg-gray-200">
                  <img src={branch.img} alt={branch.name} className="w-full h-full object-cover" />
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded-sm">
                      {uploadingBranchId === branch.id ? 'Đang tải...' : 'Đổi Ảnh'}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleBranchUpload(e, branch.id)}
                      disabled={uploadingBranchId === branch.id}
                    />
                  </label>
                </div>
                <div className="w-2/3 flex flex-col justify-center">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-gray-900 pr-2">{branch.name}</h3>
                    <div className="flex space-x-2 shrink-0">
                      <button onClick={() => { setEditingBranch(branch); setIsBranchModalOpen(true); }} className="text-yellow-600 hover:text-yellow-700"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteBranch(branch.id)} className="text-red-500 hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{branch.address}</p>
                  <p className="text-xs font-semibold mt-2 text-yellow-600 uppercase tracking-wider">
                    Trạng thái: {branch.has_rooms ? 'Đang hoạt động' : 'Sắp ra mắt'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
          <h2 className="text-xl font-serif text-gray-900 mb-6 flex justify-between items-center">
            <span>Quản lý Phòng {rooms.length === 0 && <span className="text-xs text-red-500 ml-2">Chưa có dữ liệu phòng. Hãy chạy SQL!</span>}</span>
            <button onClick={() => { setEditingRoom({ branch_id: branches[0]?.id || 1, name: '', extra_hour_price: 50000, features: [], combos: [] }); setIsRoomModalOpen(true); }} className="bg-yellow-600 text-white px-4 py-2 rounded-sm text-sm font-bold flex items-center hover:bg-yellow-700">
              <Plus size={16} className="mr-2" /> Thêm Phòng
            </button>
          </h2>
          <div className="space-y-8">
            {rooms.map(room => (
              <div key={room.id} className="p-5 bg-gray-50 rounded-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{room.name}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">{branches.find(b => b.id === room.branch_id)?.name || `Cơ sở ${room.branch_id}`}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button onClick={() => { setEditingRoom(room); setIsRoomModalOpen(true); }} className="text-gray-500 hover:text-yellow-600" title="Sửa thông tin phòng"><Edit2 size={18} /></button>
                    <button onClick={() => handleDeleteRoom(room.id)} className="text-gray-500 hover:text-red-600" title="Xóa phòng"><Trash2 size={18} /></button>
                    <label className={`cursor-pointer ml-4 px-4 py-2 text-xs font-bold tracking-wider uppercase rounded-sm transition-colors ${uploadingRoomId === room.id ? 'bg-gray-300 text-gray-600' : 'bg-yellow-600 text-white hover:bg-yellow-700'}`}>
                      {uploadingRoomId === room.id ? 'Đang Upload...' : 'Thêm Ảnh'}
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, room.id, room.images || [])}
                        disabled={uploadingRoomId === room.id}
                      />
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {room.images && room.images.map((img: string, idx: number) => (
                    <div key={idx} className="relative group aspect-square rounded-sm overflow-hidden border border-gray-200">
                      <img src={img} alt={`Room ${idx}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <div className="absolute top-1 left-1 bg-yellow-600 text-white px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm shadow-sm">
                          Ảnh Bìa
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-2">
                        {idx !== 0 && (
                          <button 
                            onClick={() => handleSetCoverImage(room.id, idx, room.images)}
                            className="bg-yellow-600 text-white px-3 py-1.5 rounded-sm text-xs font-semibold hover:bg-yellow-700"
                          >
                            Làm Ảnh Bìa
                          </button>
                        )}
                        <button 
                          onClick={() => handleRemoveImage(room.id, idx, room.images)}
                          className="bg-red-500 text-white px-3 py-1.5 rounded-sm text-xs font-bold hover:bg-red-600"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!room.images || room.images.length === 0) && (
                    <div className="col-span-full text-sm text-gray-400 italic">Chưa có ảnh nào cho phòng này.</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 flex items-center justify-center min-h-[300px]">
          <div className="text-center text-gray-400">
            <BarChart3 size={48} className="mx-auto mb-4 opacity-50 text-yellow-600" />
            <p className="font-medium">Chưa đủ dữ liệu biểu đồ</p>
            <p className="text-sm mt-1">Hệ thống sẽ cập nhật khi có &gt;10 booking.</p>
          </div>
        </div>
      </div>
      
      {/* Branch Modal */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingBranch?.id ? 'Chỉnh sửa Cơ sở' : 'Thêm Cơ sở mới'}</h3>
              <button onClick={() => setIsBranchModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveBranch} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Tên cơ sở</label>
                <input required type="text" value={editingBranch?.name || ''} onChange={e => setEditingBranch({...editingBranch, name: e.target.value})} className="w-full border border-gray-300 p-2 rounded-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Địa chỉ</label>
                <input required type="text" value={editingBranch?.address || ''} onChange={e => setEditingBranch({...editingBranch, address: e.target.value})} className="w-full border border-gray-300 p-2 rounded-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Trạng thái</label>
                <select value={editingBranch?.has_rooms ? 'true' : 'false'} onChange={e => setEditingBranch({...editingBranch, has_rooms: e.target.value === 'true'})} className="w-full border border-gray-300 p-2 rounded-sm">
                  <option value="true">Đang hoạt động</option>
                  <option value="false">Sắp ra mắt</option>
                </select>
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" className="bg-yellow-600 text-white px-6 py-2 font-bold rounded-sm hover:bg-yellow-700">Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room Modal */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-sm w-full max-w-3xl p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingRoom?.id ? 'Chỉnh sửa Phòng' : 'Thêm Phòng mới'}</h3>
              <button onClick={() => setIsRoomModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveRoom} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Tên phòng</label>
                  <input required type="text" value={editingRoom?.name || ''} onChange={e => setEditingRoom({...editingRoom, name: e.target.value})} className="w-full border border-gray-300 p-2 rounded-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Thuộc Cơ sở</label>
                  <select required value={editingRoom?.branch_id || ''} onChange={e => setEditingRoom({...editingRoom, branch_id: Number(e.target.value)})} className="w-full border border-gray-300 p-2 rounded-sm">
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-1">Giá phụ thu thêm giờ (VNĐ/1h)</label>
                  <input required type="number" value={editingRoom?.extra_hour_price || 0} onChange={e => setEditingRoom({...editingRoom, extra_hour_price: Number(e.target.value)})} className="w-full md:w-1/2 border border-gray-300 p-2 rounded-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 flex justify-between items-center">
                  <span>Tiện ích phòng</span>
                  <button type="button" onClick={() => setEditingRoom({...editingRoom, features: [...(editingRoom?.features||[]), '']})} className="text-yellow-600 text-sm flex items-center font-bold hover:text-yellow-700 bg-yellow-50 px-3 py-1 rounded-sm"><Plus size={16} className="mr-1"/> Thêm tiện ích</button>
                </label>
                {editingRoom?.features?.map((f: string, idx: number) => (
                  <div key={idx} className="flex mb-2 space-x-2">
                    <input type="text" value={f} onChange={e => {
                      const newF = [...editingRoom.features];
                      newF[idx] = e.target.value;
                      setEditingRoom({...editingRoom, features: newF});
                    }} className="flex-1 border border-gray-300 p-2 rounded-sm text-sm" placeholder="VD: Bồn tắm, Tivi lớn..." required />
                    <button type="button" onClick={() => {
                      const newF = editingRoom.features.filter((_:any, i:number) => i !== idx);
                      setEditingRoom({...editingRoom, features: newF});
                    }} className="bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 px-3 border border-red-200 rounded-sm"><Trash2 size={16}/></button>
                  </div>
                ))}
                {(!editingRoom?.features || editingRoom.features.length === 0) && <p className="text-xs text-gray-500 italic">Chưa có tiện ích nào.</p>}
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 flex justify-between items-center">
                  <span>Các gói Combo Giá</span>
                  <button type="button" onClick={() => setEditingRoom({...editingRoom, combos: [...(editingRoom?.combos||[]), { id: Date.now().toString(), name: '', price: 0 }]})} className="text-yellow-600 text-sm flex items-center font-bold hover:text-yellow-700 bg-yellow-50 px-3 py-1 rounded-sm"><Plus size={16} className="mr-1"/> Thêm gói giá</button>
                </label>
                {editingRoom?.combos?.map((c: any, idx: number) => (
                  <div key={idx} className="flex flex-col md:flex-row mb-2 gap-2 bg-gray-50 p-3 rounded-sm border border-gray-200">
                    <input type="text" value={c.name} onChange={e => {
                      const newC = [...editingRoom.combos];
                      newC[idx].name = e.target.value;
                      setEditingRoom({...editingRoom, combos: newC});
                    }} className="flex-1 border border-gray-300 p-2 rounded-sm text-sm" placeholder="Tên gói (VD: Combo 3h)" required />
                    <input type="number" value={c.price} onChange={e => {
                      const newC = [...editingRoom.combos];
                      newC[idx].price = Number(e.target.value);
                      setEditingRoom({...editingRoom, combos: newC});
                    }} className="w-full md:w-1/3 border border-gray-300 p-2 rounded-sm text-sm" placeholder="Giá (VD: 249000)" required />
                    <button type="button" onClick={() => {
                      const newC = editingRoom.combos.filter((_:any, i:number) => i !== idx);
                      setEditingRoom({...editingRoom, combos: newC});
                    }} className="bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 px-3 py-2 md:py-0 border border-red-200 rounded-sm flex items-center justify-center"><Trash2 size={16}/></button>
                  </div>
                ))}
                {(!editingRoom?.combos || editingRoom.combos.length === 0) && <p className="text-xs text-gray-500 italic">Chưa có combo giá nào.</p>}
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
                <button type="submit" className="bg-yellow-600 text-white px-8 py-3 font-bold rounded-sm hover:bg-yellow-700 shadow-md">Lưu Phòng</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminApp() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('auth_role');
    if (role !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="flex h-screen bg-[#F9F8F6] font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-8 border-b border-gray-800">
          <h2 className="text-2xl font-serif text-white tracking-widest uppercase">Sunset</h2>
          <p className="text-xs text-yellow-500 tracking-widest uppercase mt-1">Admin Portal</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-8">
          <Link to="/admin" className="flex items-center space-x-3 p-3 hover:bg-white/10 rounded-sm text-gray-300 transition-colors">
            <Home size={18} />
            <span className="text-sm font-medium tracking-wide">Tổng quan</span>
          </Link>
          <Link to="/admin/bookings" className="flex items-center space-x-3 p-3 hover:bg-white/10 rounded-sm text-gray-300 transition-colors">
            <Settings size={18} />
            <span className="text-sm font-medium tracking-wide">Quản lý Đơn</span>
          </Link>
          <Link to="/admin/rooms" className="flex items-center space-x-3 p-3 hover:bg-white/10 rounded-sm text-gray-300 transition-colors">
            <Edit2 size={18} />
            <span className="text-sm font-medium tracking-wide">Phòng & Giá</span>
          </Link>
          <Link to="/admin/reports" className="flex items-center space-x-3 p-3 hover:bg-white/10 rounded-sm text-gray-300 transition-colors">
            <BarChart3 size={18} />
            <span className="text-sm font-medium tracking-wide">Báo cáo</span>
          </Link>
          <Link to="/admin/users" className="flex items-center space-x-3 p-3 hover:bg-white/10 rounded-sm text-gray-300 transition-colors">
            <Users size={18} />
            <span className="text-sm font-medium tracking-wide">Tài khoản</span>
          </Link>
        </nav>
        <div className="p-6 border-t border-gray-800">
          <button 
            onClick={() => {
              localStorage.removeItem('auth_role');
              navigate('/login');
            }}
            className="flex items-center space-x-3 text-red-400 p-2 hover:bg-white/5 rounded-sm transition-colors w-full"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium tracking-wide">Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/bookings" element={<AdminBookings />} />
          <Route path="/rooms" element={<AdminRooms />} />
          <Route path="/reports" element={<AdminReports />} />
          <Route path="/users" element={<AdminUsers />} />
        </Routes>
      </div>
    </div>
  );
}
