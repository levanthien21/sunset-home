import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyPayOSReturn } from '../../utils/payos';
import { updateBookingStatus } from '../../utils/db';
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PayOSReturnPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'cancel'>('loading');
  const [orderCode, setOrderCode] = useState('');

  useEffect(() => {
    const checkPayment = async () => {
      try {
        const urlParams = new URLSearchParams(location.search);
        const orderId = urlParams.get('orderCode') || '';
        const cancel = urlParams.get('cancel') === 'true';
        
        setOrderCode(orderId);

        if (cancel) {
          await updateBookingStatus(orderId, 'cancelled');
          setStatus('cancel');
          return;
        }

        const isValid = await verifyPayOSReturn(location.search);
        
        if (isValid) {
          // Giao dịch thành công
          await updateBookingStatus(orderId, 'paid');
          setStatus('success');
        } else {
          // Giao dịch thất bại
          await updateBookingStatus(orderId, 'cancelled');
          setStatus('error');
        }
      } catch (error) {
        console.error("Lỗi xử lý kết quả PayOS:", error);
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
            <h2 className="text-xl font-bold text-stone-900">Đang kiểm tra giao dịch...</h2>
            <p className="text-stone-500 mt-2">Vui lòng đợi giây lát</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">Thanh toán thành công!</h2>
            <p className="text-stone-600 mb-6">
              Mã đơn <strong>{orderCode}</strong> đã được thanh toán. Bạn sẽ sớm nhận được email xác nhận.
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
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">Giao dịch thất bại</h2>
            <p className="text-stone-600 mb-6">
              Có lỗi xảy ra trong quá trình thanh toán hoặc giao dịch không hợp lệ.
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

        {status === 'cancel' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10 text-orange-600" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">Đã hủy thanh toán</h2>
            <p className="text-stone-600 mb-6">
              Bạn đã hủy giao dịch thanh toán.
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
