const fs = require('fs');

let content = fs.readFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/customer/ProfilePage.tsx', 'utf8');

// 1. Fix Edit Form Overlay
const oldEditForm = /\{\/\* Edit Form Overlay \*\/\}.*?\{isEditing && \([\s\S]*?\}\s*\)\}/;
const newEditForm = `{/* Edit Form Modal */}
          {isEditing && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-serif font-bold text-stone-900">Cập nhật thông tin</h3>
                  <button onClick={() => setIsEditing(false)} className="p-2 bg-stone-100 rounded-full text-stone-400 hover:text-stone-900 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Họ và tên</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:bg-white transition-colors"
                      placeholder="Nhập họ tên..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Số điện thoại</label>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:bg-white transition-colors"
                      placeholder="Nhập số điện thoại..."
                    />
                  </div>
                  
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="w-full mt-6 flex justify-center items-center px-5 py-3.5 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors font-bold disabled:opacity-50"
                  >
                    {isSaving ? 'Đang lưu...' : <><Save className="w-4 h-4 mr-2" /> Lưu thay đổi</>}
                  </button>
                </div>
              </div>
            </div>
          )}`;

content = content.replace(oldEditForm, newEditForm);


// 2. Expand BookingCard and add Rebook functionality
const oldBookingCard = /function BookingCard\(\{ booking: b, index: i \}: \{ booking: any, index: number \}\) \{[\s\S]*?export default function ProfilePage\(\) \{/;
const newBookingCard = `import { updateBookingStatus } from '../../utils/db';\n\nfunction BookingCard({ booking: b, index: i }: { booking: any, index: number }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">Đã thanh toán</span>;
      case 'cancelled': return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-100">Đã hủy</span>;
      case 'checked_in': return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-100">Đang lưu trú</span>;
      case 'checked_out': return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200">Hoàn thành</span>;
      default: return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100">Chờ thanh toán</span>;
    }
  };

  const bookingDate = new Date(b.date || b.created_at || Date.now());
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - bookingDate.getTime()) / 60000);
  
  const isPending = b.status === 'pending' || b.status === 'pending_payment' || b.status === 'approved';
  const isExpired = isPending && diffMinutes > 10;
  
  // Update status if expired
  useEffect(() => {
    if (isExpired && b.status !== 'cancelled') {
      updateBookingStatus(b.id, 'cancelled');
    }
  }, [isExpired, b.id, b.status]);

  const handleRebook = () => {
    // Navigates back to booking page
    navigate('/booking');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.1 }}
      className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div 
        onClick={() => setExpanded(!expanded)}
        className="p-5 md:p-6 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-stone-50/50 transition-colors"
      >
        <div className="flex-1 w-full">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className="font-serif font-bold text-stone-900 text-xl">{b.roomName}</h3>
            <span className="text-[10px] px-2.5 py-1 rounded-md font-bold bg-stone-100 text-stone-600 tracking-widest border border-stone-200">
              MÃ: {b.id?.toString().slice(-6) || 'N/A'}
            </span>
            {isExpired ? (
               <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-100">Đã hủy (Hết hạn)</span>
            ) : getStatusBadge(b.status)}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm text-stone-600">
            <span className="flex items-center font-medium"><Calendar className="w-4 h-4 mr-2 text-stone-400" /> {b.checkIn}</span>
            <span className="flex items-center font-medium"><Clock className="w-4 h-4 mr-2 text-stone-400" /> {b.checkOut}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between w-full md:w-auto md:flex-col md:items-end gap-2 border-t md:border-t-0 border-stone-100 pt-4 md:pt-0">
          <div className="font-bold text-yellow-600 text-xl tracking-tight">
            {b.total?.toLocaleString('vi-VN')}đ
          </div>
          <button className="text-stone-400 hover:text-stone-600 transition-colors flex items-center text-xs font-bold uppercase tracking-wider">
            {expanded ? <><ChevronUp className="w-4 h-4 mr-1" /> Thu gọn</> : <><ChevronDown className="w-4 h-4 mr-1" /> Chi tiết</>}
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-stone-100 bg-stone-50/30 overflow-hidden"
          >
            <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3 border-b border-stone-200 pb-2">Thông tin chi tiết</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-stone-500 flex items-center">Thời gian đặt:</span>
                    <span className="font-medium text-stone-900 text-right">{bookingDate.toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-stone-500 flex items-center">Cơ sở:</span>
                    <span className="font-medium text-stone-900 text-right">{b.branchName || 'Sunset Tây Ninh'}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-stone-500 flex items-center">Loại phòng:</span>
                    <span className="font-medium text-stone-900 text-right">{b.roomName}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-stone-500 flex items-center">Số khách:</span>
                    <span className="font-medium text-stone-900 text-right">{b.guests || 2} người</span>
                  </div>
                </div>
                
                <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mt-6 mb-3 border-b border-stone-200 pb-2">Khách hàng & Thanh toán</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-stone-500 flex items-center">Người đặt:</span>
                    <span className="font-medium text-stone-900 text-right">{b.customerName || 'Khách vãng lai'}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-stone-500 flex items-center">Số ĐT:</span>
                    <span className="font-medium text-stone-900 text-right">{b.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-stone-500 flex items-center">Tổng tiền:</span>
                    <span className="font-bold text-stone-900 text-right">{b.total?.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-stone-500 flex items-center">Phương thức:</span>
                    <span className="font-medium text-stone-900 text-right uppercase text-[11px] tracking-wider px-2 py-0.5 bg-stone-200 rounded">
                      {b.paymentMethod === 'transfer' || b.paymentMethod === 'qr' ? 'Chuyển khoản' : b.paymentMethod === 'cash' ? 'Tiền mặt' : 'Khác'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 flex flex-col h-full">
                <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3 border-b border-stone-200 pb-2">Ghi chú & Hỗ trợ</h4>
                <div className="text-sm bg-white p-4 rounded-xl border border-stone-200 flex-1">
                  <div className="flex items-start text-stone-600 mb-2">
                    <FileText className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-stone-400" />
                    <p className="font-light italic">{b.note || 'Không có ghi chú nào từ khách hàng.'}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-stone-100">
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      Lưu ý: Bạn có thể thay đổi lịch trình hoặc hủy miễn phí trước 7 ngày. Liên hệ hotline: <a href="tel:0364135809" className="font-bold text-stone-600 hover:text-yellow-600">0364.135.809</a>.
                    </p>
                  </div>
                </div>
                
                {isExpired ? (
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleRebook} className="flex-1 py-3 bg-stone-900 text-white rounded-lg text-sm font-bold hover:bg-stone-800 transition-colors shadow-lg shadow-stone-200">
                      ĐẶT LẠI PHÒNG NÀY
                    </button>
                  </div>
                ) : isPending ? (
                  <div className="flex gap-3 pt-2">
                    <button className="flex-1 py-2.5 bg-stone-100 text-stone-600 rounded-lg text-sm font-bold hover:bg-stone-200 transition-colors">
                      Liên hệ hỗ trợ
                    </button>
                    {(b.paymentMethod === 'transfer' || b.paymentMethod === 'qr') && (
                      <button onClick={async () => {
                         try {
                           const { createPayOSPaymentLink } = await import('../../utils/payos');
                           const paymentUrl = await createPayOSPaymentLink(b.total, parseInt(b.id), "Thanh toan don " + b.id);
                           window.location.href = paymentUrl;
                         } catch(e) {
                           alert('Đơn đã quá hạn, vui lòng đặt lại!');
                         }
                      }} className="flex-1 py-2.5 bg-yellow-600 text-white rounded-lg text-sm font-bold hover:bg-yellow-700 transition-colors shadow-[0_4px_15px_rgba(202,138,4,0.3)]">
                        Thanh toán ngay ({10 - diffMinutes}p)
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ProfilePage() {`;

content = content.replace(oldBookingCard, newBookingCard);
fs.writeFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/customer/ProfilePage.tsx', content);
console.log('Patched ProfilePage');
