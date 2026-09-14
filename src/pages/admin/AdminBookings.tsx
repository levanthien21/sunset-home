import { useState, useEffect } from 'react';
import { getBookings, updateBookingStatus, supabase } from '../../utils/db';
import { Search, Filter, Trash2, Edit2, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchDB = async () => {
    setLoading(true);
    try {
      const data = await getBookings();
      setBookings(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDB();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đơn này vĩnh viễn?')) return;
    if (supabase) {
      try {
        const { error } = await supabase.from('bookings').delete().match({ id });
        if (error) throw error;
        await fetchDB();
      } catch (e) {
        console.error(e);
        alert('Lỗi khi xóa!');
      }
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchSearch = (b.customerName?.toLowerCase().includes(search.toLowerCase()) || 
                         b.phone?.includes(search) || 
                         b.id?.toString().includes(search));
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Quản lý Đơn đặt phòng</h1>
          <p className="text-gray-500">Xem và quản lý tất cả đơn hàng trên hệ thống.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Tìm theo tên, SĐT, Mã đơn..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
        <div className="md:w-48 relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 appearance-none bg-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="paid">Đã thanh toán (PayOS)</option>
            <option value="checked_in">Đang lưu trú</option>
            <option value="checked_out">Đã hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin"></div></div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Không tìm thấy đơn nào.</div>
        ) : (
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
              <tr>
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Phòng / Ngày</th>
                <th className="p-4">Tổng tiền</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.map((b: any) => (
                <tr key={b.id || b.bookingId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{b.customerName}</div>
                    <div className="text-sm text-gray-500">{b.phone}</div>
                    <div className="text-xs text-gray-400 mt-0.5">Mã: {b.id?.toString().slice(-8) || b.bookingId?.toString().slice(-8)}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-800">{b.roomName}</div>
                    <div className="text-sm text-gray-600 mt-1">{b.checkIn}</div>
                    <div className="text-xs text-gray-500">{b.checkOut}</div>
                  </td>
                  <td className="p-4">
                  <div className="font-bold text-gray-900">{b.total?.toLocaleString('vi-VN')}đ</div>
                  {b.paymentMethod === 'qr' ? (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] uppercase font-bold rounded-sm border border-blue-100">PayOS</span>
                  ) : b.paymentMethod === 'transfer' ? (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] uppercase font-bold rounded-sm border border-purple-100">Chuyển khoản</span>
                  ) : null}
                </td>
                  <td className="p-4">
                    {b.status === 'pending' || b.status === 'pending_payment' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700"><Clock className="w-3 h-3 mr-1" /> Chờ xử lý</span>
                    ) : b.status === 'paid' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700"><CheckCircle2 className="w-3 h-3 mr-1" /> Đã thanh toán</span>
                    ) : b.status === 'checked_in' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">Đang lưu trú</span>
                    ) : b.status === 'checked_out' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">Đã Check-out</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700"><XCircle className="w-3 h-3 mr-1" /> Đã hủy</span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => {
                        const newStatus = window.prompt("Nhập trạng thái mới (pending, paid, checked_in, checked_out, cancelled):", b.status);
                        if (newStatus) {
                          updateBookingStatus(b.id || b.bookingId, newStatus).then(() => fetchDB());
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50 rounded-lg inline-flex" title="Sửa trạng thái"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(b.id || b.bookingId)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors bg-gray-50 hover:bg-red-50 rounded-lg inline-flex" title="Xóa đơn"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
