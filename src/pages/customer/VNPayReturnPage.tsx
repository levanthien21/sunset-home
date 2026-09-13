import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyVNPayReturn } from '../../utils/vnpay';
import { updateBookingStatus } from '../../utils/db';
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VNPayReturnPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    const checkPayment = async () => {
      try {
        const isValid = await verifyVNPayReturn(location.search);
        
        if (!isValid) {
          setStatus('invalid');
          return;
        }

        const urlParams = new URLSearchParams(location.search);
        const vnp_ResponseCode = urlParams.get('vnp_ResponseCode');
        const vnp_TxnRef = urlParams.get('vnp_TxnRef') || '';
        const vnp_Amount = parseInt(urlParams.get('vnp_Amount') || '0') / 100;
        
        setOrderId(vnp_TxnRef);
        setAmount(vnp_Amount);

        if (vnp_ResponseCode === '00') {
          // Giao dịch thành công
          await updateBookingStatus(vnp_TxnRef, 'paid');
          setStatus('success');
        } else {
          // Giao dịch thất bại
          await updateBookingStatus(vnp_TxnRef, 'cancelled');
          setStatus('error');
        }
      } catch (error) {
        console.error("Lỗi xử lý kết quả VNPay:", error);
        setStatus('error');
      }
    };

    checkPayment();
  }, [location]);

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center border border-stone-200"
      >
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-stone-200 border-t-yellow-600 rounded-full animate-spin mb-6"></div>
            <h2 className="text-xl font-bold text-stone-900">Đang xử lý thanh toán...</h2>
            <p className="text-stone-500 mt-2">Vui lòng không đóng trình duyệt</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">Thanh toán thành công!</h2>
            <p className="text-stone-600 mb-6">
              Mã đơn <strong>{orderId}</strong> đã được thanh toán số tiền <strong>{amount.toLocaleString()}đ</strong>.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-yellow-600 text-white rounded-xl font-bold hover:bg-yellow-700 transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">Thanh toán thất bại</h2>
            <p className="text-stone-600 mb-6">
              Giao dịch của bạn đã bị hủy hoặc có lỗi xảy ra trong quá trình thanh toán.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => navigate('/')}
                className="px-6 py-3 border border-stone-300 text-stone-700 rounded-xl font-bold hover:bg-stone-50 transition-colors flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
              </button>
            </div>
          </div>
        )}

        {status === 'invalid' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10 text-orange-600" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">Dữ liệu không hợp lệ</h2>
            <p className="text-stone-600 mb-6">
              Chữ ký bảo mật không khớp hoặc dữ liệu đã bị can thiệp.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
