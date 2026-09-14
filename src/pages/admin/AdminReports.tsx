import { useState, useEffect, useMemo } from 'react';
import { getBookings } from '../../utils/db';
import { BarChart3, TrendingUp, Calendar, CreditCard, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminReports() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDB = async () => {
      try {
        const data = await getBookings();
        setBookings(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDB();
  }, []);

  // Compute stats
  const { totalRevenue, totalBookings, paidBookings, cancelledBookings } = useMemo(() => {
    let revenue = 0;
    let paid = 0;
    let cancelled = 0;

    bookings.forEach(b => {
      if (b.status === 'checked_out' || b.status === 'checked_in' || b.status === 'paid' || b.status === 'approved') {
        revenue += (b.total || 0);
        paid += 1;
      }
      if (b.status === 'cancelled') cancelled += 1;
    });

    return {
      totalRevenue: revenue,
      totalBookings: bookings.length,
      paidBookings: paid,
      cancelledBookings: cancelled
    };
  }, [bookings]);

  // Compute revenue by month for the chart
  const monthlyRevenue = useMemo(() => {
    const months = Array(12).fill(0);
    bookings.forEach(b => {
      if (b.status === 'checked_out' || b.status === 'checked_in' || b.status === 'paid' || b.status === 'approved') {
        if (b.date) {
          const m = new Date(b.date).getMonth(); // 0-11
          months[m] += (b.total || 0);
        }
      }
    });
    return months;
  }, [bookings]);

  const maxMonthRev = Math.max(...monthlyRevenue, 1); // prevent division by zero

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-gray-900 mb-2">Báo cáo & Thống kê</h1>
        <p className="text-gray-500">Xem tổng quan doanh thu và hiệu suất kinh doanh.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-yellow-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-xl"><TrendingUp size={20} /></div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Tổng doanh thu</h3>
              <p className="text-3xl font-bold text-gray-900">{totalRevenue.toLocaleString('vi-VN')} đ</p>
            </motion.div>

            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: 0.1}} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Calendar size={20} /></div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Tổng Booking</h3>
              <p className="text-3xl font-bold text-gray-900">{totalBookings}</p>
            </motion.div>

            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: 0.2}} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 size={20} /></div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Đơn thành công</h3>
              <p className="text-3xl font-bold text-gray-900">{paidBookings}</p>
            </motion.div>

            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: 0.3}} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-xl"><CreditCard size={20} /></div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Đơn đã hủy</h3>
              <p className="text-3xl font-bold text-gray-900">{cancelledBookings}</p>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-gray-400" />
                Biểu đồ Doanh thu năm nay
              </h3>
            </div>
            
            <div className="h-64 flex items-end justify-between space-x-2 pt-6">
              {monthlyRevenue.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-12 bg-gray-900 text-white text-xs py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {val.toLocaleString('vi-VN')} đ
                  </div>
                  
                  {/* Bar */}
                  <div className="w-full max-w-[48px] bg-gray-100 rounded-t-lg relative flex items-end h-full">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${(val / maxMonthRev) * 100}%` }}
                      transition={{ duration: 1, delay: i * 0.05 }}
                      className="w-full bg-yellow-500 rounded-t-lg group-hover:bg-yellow-400 transition-colors"
                    ></motion.div>
                  </div>
                  
                  {/* Label */}
                  <div className="mt-4 text-xs font-medium text-gray-500">T{i + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
