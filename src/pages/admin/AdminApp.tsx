import { Routes, Route, Link } from 'react-router-dom';
import { Home, MapPin, Settings, LogOut, BarChart3, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

function AdminDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [uploadingRoomId, setUploadingRoomId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { getBookings, getRooms } = await import('../../utils/db');
      setBookings(await getBookings());
      setRooms(await getRooms());
    };
    load();
  }, []);

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

  const approvedBookings = bookings.filter(b => b.status === 'approved');
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
            Quản lý Ảnh Phòng
            {rooms.length === 0 && <span className="text-xs text-red-500">Chưa có dữ liệu phòng. Hãy chạy SQL!</span>}
          </h2>
          <div className="space-y-8">
            {rooms.map(room => (
              <div key={room.id} className="p-5 bg-gray-50 rounded-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{room.name}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Cơ sở {room.branch_id}</p>
                  </div>
                  <div>
                    <label className={`cursor-pointer px-4 py-2 text-xs font-bold tracking-wider uppercase rounded-sm transition-colors ${uploadingRoomId === room.id ? 'bg-gray-300 text-gray-600' : 'bg-yellow-600 text-white hover:bg-yellow-700'}`}>
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
                      <button 
                        onClick={() => handleRemoveImage(room.id, idx, room.images)}
                        className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs transition-opacity"
                      >
                        X
                      </button>
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
    </div>
  );
}

export default function AdminApp() {
  return (
    <div className="flex h-screen bg-[#F9F8F6] font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-8 border-b border-gray-800">
          <h2 className="text-2xl font-serif text-white tracking-widest uppercase">Sunset</h2>
          <p className="text-xs text-yellow-500 tracking-widest uppercase mt-1">Admin Portal</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-8">
          <Link to="/admin" className="flex items-center space-x-3 p-3 bg-white/10 rounded-sm text-white">
            <Home size={18} />
            <span className="text-sm font-medium tracking-wide">Tổng quan</span>
          </Link>
          <a href="#" className="flex items-center space-x-3 p-3 hover:bg-white/5 rounded-sm text-gray-400 transition-colors">
            <MapPin size={18} />
            <span className="text-sm font-medium tracking-wide">Cơ sở & Phòng</span>
          </a>
          <a href="#" className="flex items-center space-x-3 p-3 hover:bg-white/5 rounded-sm text-gray-400 transition-colors">
            <Settings size={18} />
            <span className="text-sm font-medium tracking-wide">Cài đặt</span>
          </a>
        </nav>
        <div className="p-6 border-t border-gray-800">
          <Link to="/" className="flex items-center space-x-3 text-red-400 p-2 hover:bg-white/5 rounded-sm transition-colors">
            <LogOut size={18} />
            <span className="text-sm font-medium tracking-wide">Đăng xuất</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
        </Routes>
      </div>
    </div>
  );
}
