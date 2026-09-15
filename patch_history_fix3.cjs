const fs = require('fs');

let content = fs.readFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/customer/ProfilePage.tsx', 'utf8');

const regex = /<div className="space-y-4">[\s\S]*?<\/motion\.div>\s*\)\)\}\s*<\/div>/;

const replacement = `<div className="space-y-4">
            {bookings.map((b, i) => (
              <BookingCard key={b.id || i} booking={b} index={i} />
            ))}
          </div>`;

content = content.replace(regex, replacement);

// Also we need to add the BookingCard function before export default function ProfilePage()
if (!content.includes('function BookingCard')) {
  const bookingCardCode = `
function BookingCard({ booking: b, index: i }: { booking: any, index: number }) {
  const [expanded, setExpanded] = useState(false);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">Đã thanh toán</span>;
      case 'cancelled': return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-100">Đã hủy</span>;
      case 'checked_in': return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-100">Đang lưu trú</span>;
      case 'checked_out': return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200">Hoàn thành</span>;
      default: return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100">Chờ thanh toán</span>;
    }
  };

  const isPending = b.status === 'pending' || b.status === 'approved';

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
            {getStatusBadge(b.status)}
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
                <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3 border-b border-stone-200 pb-2">Thông tin khách hàng & Thanh toán</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-stone-500 flex items-center"><UserIcon className="w-4 h-4 mr-2" /> Người đặt:</span>
                    <span className="font-medium text-stone-900 text-right">{b.customerName || 'Khách vãng lai'}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-stone-500 flex items-center"><Phone className="w-4 h-4 mr-2" /> Số ĐT:</span>
                    <span className="font-medium text-stone-900 text-right">{b.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-stone-500 flex items-center"><Receipt className="w-4 h-4 mr-2" /> Tổng tiền:</span>
                    <span className="font-bold text-stone-900 text-right">{b.total?.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-stone-500 flex items-center"><CreditCard className="w-4 h-4 mr-2" /> Phương thức:</span>
                    <span className="font-medium text-stone-900 text-right uppercase text-[11px] tracking-wider px-2 py-0.5 bg-stone-200 rounded">
                      {b.paymentMethod === 'transfer' ? 'Chuyển khoản' : b.paymentMethod === 'cash' ? 'Tiền mặt' : 'Khác'}
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
                {isPending && (
                  <div className="flex gap-3 pt-2">
                    <button className="flex-1 py-2.5 bg-stone-900 text-white rounded-lg text-sm font-bold hover:bg-stone-800 transition-colors">
                      Liên hệ hỗ trợ
                    </button>
                    {b.paymentMethod === 'transfer' && (
                      <button className="flex-1 py-2.5 bg-yellow-600 text-white rounded-lg text-sm font-bold hover:bg-yellow-700 transition-colors shadow-[0_4px_15px_rgba(202,138,4,0.3)]">
                        Thanh toán ngay
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ProfilePage() {`;
  content = content.replace('export default function ProfilePage() {', bookingCardCode);
}

fs.writeFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/customer/ProfilePage.tsx', content);
console.log('Replaced bookings correctly');
