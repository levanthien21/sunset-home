import { useState, useEffect } from 'react';
import { getBookings, updateBookingStatus, supabase } from '../../utils/db';
import { Search, Filter, Trash2, RefreshCw, X, CheckCircle2 } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'pending_payment', label: 'Chờ thanh toán', color: 'bg-orange-50 text-orange-700' },
  { value: 'pending', label: 'Chờ duyệt', color: 'bg-yellow-50 text-yellow-700' },
  { value: 'approved', label: 'Đã duyệt', color: 'bg-sky-50 text-sky-700' },
  { value: 'paid', label: 'Đã thanh toán (QR)', color: 'bg-emerald-50 text-emerald-700' },
  { value: 'checked_in', label: 'Đang lưu trú', color: 'bg-blue-50 text-blue-700' },
  { value: 'checked_out_dirty', label: 'Chờ dọn phòng', color: 'bg-yellow-50 text-yellow-800' },
  { value: 'completed', label: 'Hoàn thành', color: 'bg-gray-100 text-gray-600' },
  { value: 'cancelled', label: 'Đã hủy', color: 'bg-red-50 text-red-700' },
];

function StatusBadge({ status }: { status: string }) {
  const opt = STATUS_OPTIONS.find(s => s.value === status);
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${opt?.color || 'bg-gray-100 text-gray-600'}`}>
      {opt?.label || status}
    </span>
  );
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editModal, setEditModal] = useState<any | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);

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
    const interval = setInterval(fetchDB, 15000); // Auto-refresh every 15s
    return () => clearInterval(interval);
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

  const handleSaveStatus = async () => {
    if (!editModal || !editStatus) return;
    setSaving(true);
    try {
      await updateBookingStatus(editModal.id || editModal.bookingId, editStatus);
      setBookings(bookings.map(b => (b.id === editModal.id || b.bookingId === editModal.bookingId) ? { ...b, status: editStatus } : b));
      setEditModal(null);
    } catch (e) {
      alert('Lỗi cập nhật trạng thái!');
    }
    setSaving(false);
  };

  const filteredBookings = bookings.filter(b => {
    const matchSearch = (b.customerName?.toLowerCase().includes(search.toLowerCase()) ||
                         b.phone?.includes(search) ||
                         b.id?.toString().includes(search) ||
                         b.roomName?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 mb-1">Quản lý Đơn đặt phòng</h1>
          <p className="text-gray-500 text-sm">Tự động cập nhật mỗi 15 giây. Tổng: <b>{filteredBookings.length}</b> đơn.</p>
        </div>
        <button onClick={fetchDB} className="flex items-center text-sm text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors gap-2">
          <RefreshCw className="w-4 h-4" /> Làm mới
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm theo tên, SĐT, Mã đơn, Phòng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
        <div className="md:w-56 relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 appearance-none bg-white"
          >
            <option value="all">Tất cả trạng thái</option>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin"></div></div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Không tìm thấy đơn nào.</div>
        ) : (
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
              <tr>
                <th className="p-4">Mã đơn</th>
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Phòng / Giờ nhận / Gói</th>
                <th className="p-4">Tổng tiền</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.sort((a, b) => new Date(b.date || b.created_at || 0).getTime() - new Date(a.date || a.created_at || 0).getTime()).map((b: any) => (
                <tr key={b.id || b.bookingId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md inline-block">#{(b.id || b.bookingId)?.toString().slice(-8)}</div>
                    <div className="text-[10px] text-gray-400 mt-1">{b.date ? new Date(b.date).toLocaleDateString('vi-VN') : ''}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{b.customerName || 'Khách vãng lai'}</div>
                    <div className="text-sm text-gray-500">{b.phone || '—'}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{b.email || ''}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-gray-800">{b.roomName}</div>
                    <div className="text-sm text-blue-600 font-mono mt-0.5">Nhận: {b.checkIn}</div>
                    <div className="text-xs text-gray-500">Gói: {b.checkOut}</div>
                    {b.branchName && <div className="text-[10px] text-gray-400 mt-0.5">{b.branchName}</div>}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{b.total?.toLocaleString('vi-VN')}đ</div>
                    {b.paymentMethod === 'qr' ? (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] uppercase font-bold rounded-sm border border-blue-100">QR Code</span>
                    ) : b.paymentMethod === 'transfer' ? (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] uppercase font-bold rounded-sm border border-purple-100">Chuyển khoản</span>
                    ) : null}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => { setEditModal(b); setEditStatus(b.status); }}
                      className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      Cập nhật
                    </button>
                    <button
                      onClick={() => handleDelete(b.id || b.bookingId)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors bg-gray-50 hover:bg-red-50 rounded-lg inline-flex"
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

      {/* Edit Status Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-serif font-bold text-lg text-gray-900">Cập nhật trạng thái đơn</h3>
                <p className="text-xs text-gray-500 mt-0.5">Đơn #{(editModal.id || editModal.bookingId)?.toString().slice(-8)} — {editModal.roomName}</p>
              </div>
              <button onClick={() => setEditModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Chọn trạng thái mới:</p>
              <div className="space-y-2">
                {STATUS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setEditStatus(opt.value)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all ${editStatus === opt.value ? 'border-yellow-500 bg-yellow-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}
                  >
                    <span className={`text-sm font-bold px-2 py-0.5 rounded-md ${opt.color}`}>{opt.label}</span>
                    {editStatus === opt.value && <CheckCircle2 className="w-5 h-5 text-yellow-600" />}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setEditModal(null)} className="px-5 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Hủy</button>
              <button onClick={handleSaveStatus} disabled={saving} className="px-5 py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50">
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
