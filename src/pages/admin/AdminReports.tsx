import { useState, useEffect, useMemo } from 'react';
import { getBookings } from '../../utils/db';
import { BarChart3, TrendingUp, Calendar, XCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const MONTHS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

export default function AdminReports() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

  const PAID_STATUSES = ['checked_out_dirty', 'checked_out', 'checked_in', 'paid', 'approved', 'completed'];

  const yearBookings = useMemo(() => {
    return bookings.filter(b => {
      const d = b.date || b.created_at;
      if (!d) return false;
      return new Date(d).getFullYear() === selectedYear;
    });
  }, [bookings, selectedYear]);

  const { totalRevenue, totalBookings, paidBookings, cancelledBookings } = useMemo(() => {
    let revenue = 0, paid = 0, cancelled = 0;
    yearBookings.forEach(b => {
      if (PAID_STATUSES.includes(b.status)) { revenue += (b.total || 0); paid += 1; }
      if (b.status === 'cancelled') cancelled += 1;
    });
    return { totalRevenue: revenue, totalBookings: yearBookings.length, paidBookings: paid, cancelledBookings: cancelled };
  }, [yearBookings]);

  const monthlyRevenue = useMemo(() => {
    const months = Array(12).fill(0);
    yearBookings.forEach(b => {
      if (PAID_STATUSES.includes(b.status)) {
        const d = b.date || b.created_at;
        if (d) months[new Date(d).getMonth()] += (b.total || 0);
      }
    });
    return months;
  }, [yearBookings]);

  const topRooms = useMemo(() => {
    const map: Record<string, number> = {};
    yearBookings.forEach(b => {
      if (PAID_STATUSES.includes(b.status) && b.roomName) {
        map[b.roomName] = (map[b.roomName] || 0) + (b.total || 0);
      }
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [yearBookings]);

  const maxMonthRev = Math.max(...monthlyRevenue, 1);
  const availableYears = Array.from(new Set(bookings.map(b => {
    const d = b.date || b.created_at;
    return d ? new Date(d).getFullYear() : null;
  }).filter(Boolean))).sort((a, b) => (b as number) - (a as number));
  if (!availableYears.includes(selectedYear)) availableYears.unshift(selectedYear);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 mb-1">Báo cáo & Thống kê</h1>
          <p className="text-gray-500">Tổng quan doanh thu và hiệu suất kinh doanh.</p>
        </div>
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(Number(e.target.value))}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          {availableYears.map(y => <option key={y as number} value={y as number}>Năm {y}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-yellow-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {[
              { label: 'Tổng doanh thu', value: totalRevenue.toLocaleString('vi-VN') + 'đ', icon: <TrendingUp size={20}/>, color: 'bg-green-50 text-green-600' },
              { label: 'Tổng Booking', value: totalBookings, icon: <Calendar size={20}/>, color: 'bg-blue-50 text-blue-600' },
              { label: 'Đơn thành công', value: paidBookings, icon: <CheckCircle2 size={20}/>, color: 'bg-emerald-50 text-emerald-600' },
              { label: 'Đơn đã hủy', value: cancelledBookings, icon: <XCircle size={20}/>, color: 'bg-red-50 text-red-600' },
            ].map((card, i) => (
              <motion.div key={card.label} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: i*0.1}} className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className={`p-2.5 rounded-xl ${card.color} w-fit mb-3`}>{card.icon}</div>
                <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">{card.label}</p>
                <p className="text-xl md:text-3xl font-bold text-gray-900">{card.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center mb-6">
                <BarChart3 className="w-5 h-5 mr-2 text-gray-400" /> Doanh thu theo tháng — {selectedYear}
              </h3>
              <div className="h-48 md:h-64 flex items-end justify-between space-x-1 md:space-x-2">
                {monthlyRevenue.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center group relative">
                    {val > 0 && (
                      <div className="absolute -top-10 bg-gray-900 text-white text-xs py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        {val.toLocaleString('vi-VN')}đ
                      </div>
                    )}
                    <div className="w-full bg-gray-100 rounded-t-lg relative flex items-end h-full">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(val / maxMonthRev) * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.05 }}
                        className="w-full bg-yellow-500 rounded-t-lg group-hover:bg-yellow-400 transition-colors"
                      ></motion.div>
                    </div>
                    <div className="mt-2 text-[10px] md:text-xs font-medium text-gray-500">{MONTHS[i]}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-yellow-600" /> Top phòng doanh thu
              </h3>
              {topRooms.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Chưa có dữ liệu.</p>
              ) : (
                <div className="space-y-3">
                  {topRooms.map(([name, rev], i) => (
                    <div key={name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-gray-800 truncate">{i+1}. {name}</span>
                        <span className="text-gray-500 font-mono text-xs ml-2">{(rev as number).toLocaleString('vi-VN')}đ</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full">
                        <div
                          className="h-1.5 bg-yellow-500 rounded-full"
                          style={{ width: `${((rev as number) / topRooms[0][1] as number) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
