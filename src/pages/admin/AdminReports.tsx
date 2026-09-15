import { useState, useEffect, useMemo } from 'react';
import { getBookings } from '../../utils/db';
import { BarChart3, TrendingUp, Calendar, XCircle, CheckCircle2, Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const MONTHS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
const WEEKDAYS = ['CN','T2','T3','T4','T5','T6','T7'];
const PAID_STATUSES = ['checked_out_dirty','checked_out','checked_in','paid','approved','completed'];

type ViewMode = 'day' | 'week' | 'month' | 'year';

function Bar({ val, max, label, tooltip }: { val: number; max: number; label: string; tooltip: string }) {
  const pct = max > 0 ? (val / max) * 100 : 0;
  return (
    <div className="flex-1 flex flex-col items-center group relative min-w-0">
      {val > 0 && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
          {tooltip}
        </div>
      )}
      <div className="w-full bg-gray-100 rounded-t-md relative flex items-end" style={{ height: '160px' }}>
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${pct}%` }}
          transition={{ duration: 0.6 }}
          className={`w-full rounded-t-md transition-colors ${val > 0 ? 'bg-yellow-500 group-hover:bg-yellow-400' : 'bg-gray-100'}`}
        />
      </div>
      <div className="mt-1.5 text-[9px] md:text-[10px] font-medium text-gray-500 text-center leading-tight truncate w-full px-0.5">{label}</div>
    </div>
  );
}

export default function AdminReports() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay()); // Sunday
    d.setHours(0,0,0,0);
    return d;
  });
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchDB = async () => {
      try {
        const data = await getBookings();
        setBookings(data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchDB();
  }, []);

  // Utility
  const getDate = (b: any) => {
    const d = b.date || b.created_at;
    return d ? new Date(d) : null;
  };

  // --- FILTERED BOOKINGS ---
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const d = getDate(b);
      if (!d) return false;
      if (viewMode === 'year') return d.getFullYear() === selectedYear;
      if (viewMode === 'month') return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
      if (viewMode === 'week') {
        const end = new Date(selectedWeekStart.getTime() + 7 * 24 * 3600 * 1000);
        return d >= selectedWeekStart && d < end;
      }
      if (viewMode === 'day') return d.toISOString().split('T')[0] === selectedDay;
      return true;
    });
  }, [bookings, viewMode, selectedYear, selectedMonth, selectedWeekStart, selectedDay]);

  // --- KPIs ---
  const kpis = useMemo(() => {
    let revenue = 0, paid = 0, cancelled = 0, pending = 0;
    filteredBookings.forEach(b => {
      if (PAID_STATUSES.includes(b.status)) { revenue += (b.total || 0); paid += 1; }
      if (b.status === 'cancelled') cancelled += 1;
      if (b.status === 'pending' || b.status === 'pending_payment') pending += 1;
    });
    const rate = filteredBookings.length > 0 ? Math.round((paid / filteredBookings.length) * 100) : 0;
    const avg = paid > 0 ? Math.round(revenue / paid) : 0;
    return { revenue, total: filteredBookings.length, paid, cancelled, pending, rate, avg };
  }, [filteredBookings]);

  // --- CHART DATA ---
  const chartData = useMemo(() => {
    if (viewMode === 'year') {
      const arr = Array(12).fill(0);
      filteredBookings.forEach(b => {
        if (PAID_STATUSES.includes(b.status)) { const d = getDate(b); if (d) arr[d.getMonth()] += (b.total || 0); }
      });
      return arr.map((v, i) => ({ label: MONTHS[i], val: v, tooltip: MONTHS[i] + ': ' + v.toLocaleString('vi-VN') + 'đ' }));
    }
    if (viewMode === 'month') {
      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      const arr = Array(daysInMonth).fill(0);
      filteredBookings.forEach(b => {
        if (PAID_STATUSES.includes(b.status)) { const d = getDate(b); if (d) arr[d.getDate() - 1] += (b.total || 0); }
      });
      return arr.map((v, i) => ({ label: String(i + 1), val: v, tooltip: `Ngày ${i+1}: ${v.toLocaleString('vi-VN')}đ` }));
    }
    if (viewMode === 'week') {
      const arr = Array(7).fill(0);
      filteredBookings.forEach(b => {
        if (PAID_STATUSES.includes(b.status)) {
          const d = getDate(b);
          if (d) { const day = d.getDay(); arr[day] += (b.total || 0); }
        }
      });
      return arr.map((v, i) => {
        const date = new Date(selectedWeekStart.getTime() + i * 24 * 3600 * 1000);
        return { label: WEEKDAYS[i] + ' ' + date.getDate(), val: v, tooltip: WEEKDAYS[i] + ': ' + v.toLocaleString('vi-VN') + 'đ' };
      });
    }
    // day: group by hour
    if (viewMode === 'day') {
      const arr = Array(24).fill(0);
      filteredBookings.forEach(b => {
        if (PAID_STATUSES.includes(b.status)) { const d = getDate(b); if (d) arr[d.getHours()] += (b.total || 0); }
      });
      return arr.map((v, i) => ({ label: i + 'h', val: v, tooltip: `${i}:00 - ${i+1}:00: ${v.toLocaleString('vi-VN')}đ` }));
    }
    return [];
  }, [filteredBookings, viewMode, selectedYear, selectedMonth, selectedWeekStart, selectedDay]);

  const maxChartVal = Math.max(...chartData.map(d => d.val), 1);

  // --- TOP ROOMS ---
  const topRooms = useMemo(() => {
    const map: Record<string, { revenue: number; count: number }> = {};
    filteredBookings.forEach(b => {
      if (PAID_STATUSES.includes(b.status) && b.roomName) {
        if (!map[b.roomName]) map[b.roomName] = { revenue: 0, count: 0 };
        map[b.roomName].revenue += (b.total || 0);
        map[b.roomName].count += 1;
      }
    });
    return Object.entries(map).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5);
  }, [filteredBookings]);

  // --- STATUS BREAKDOWN ---
  const statusBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredBookings.forEach(b => { map[b.status] = (map[b.status] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredBookings]);

  const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending_payment: { label: 'Chờ TT', color: 'bg-orange-400' },
    pending: { label: 'Chờ duyệt', color: 'bg-yellow-400' },
    approved: { label: 'Đã duyệt', color: 'bg-sky-400' },
    paid: { label: 'Đã TT', color: 'bg-emerald-500' },
    checked_in: { label: 'Lưu trú', color: 'bg-blue-500' },
    checked_out_dirty: { label: 'Dọn phòng', color: 'bg-amber-500' },
    completed: { label: 'Hoàn thành', color: 'bg-gray-400' },
    cancelled: { label: 'Đã hủy', color: 'bg-red-400' },
  };

  // --- AVAILABLE YEARS ---
  const availableYears = Array.from(new Set(bookings.map(b => { const d = getDate(b); return d ? d.getFullYear() : null; }).filter(Boolean))).sort((a, b) => (b as number) - (a as number)) as number[];
  if (!availableYears.includes(selectedYear)) availableYears.unshift(selectedYear);

  // Period label
  const periodLabel = viewMode === 'year' ? `Năm ${selectedYear}`
    : viewMode === 'month' ? `Tháng ${selectedMonth + 1}/${selectedYear}`
    : viewMode === 'week' ? `Tuần ${selectedWeekStart.toLocaleDateString('vi-VN')} – ${new Date(selectedWeekStart.getTime() + 6*24*3600*1000).toLocaleDateString('vi-VN')}`
    : `Ngày ${new Date(selectedDay).toLocaleDateString('vi-VN')}`;

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-gray-900 mb-1">Báo cáo & Thống kê</h1>
          <p className="text-gray-500 text-sm">Đang xem: <b>{periodLabel}</b></p>
        </div>
        {/* Controls */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* View Mode Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            {(['day','week','month','year'] as ViewMode[]).map(m => (
              <button key={m} onClick={() => setViewMode(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === m ? 'bg-white shadow text-yellow-700' : 'text-gray-500 hover:text-gray-700'}`}>
                {m === 'day' ? 'Ngày' : m === 'week' ? 'Tuần' : m === 'month' ? 'Tháng' : 'Năm'}
              </button>
            ))}
          </div>

          {/* Date pickers */}
          {viewMode === 'day' && (
            <input type="date" value={selectedDay} onChange={e => setSelectedDay(e.target.value)}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          )}
          {viewMode === 'week' && (
            <div className="flex gap-2">
              <button onClick={() => setSelectedWeekStart(new Date(selectedWeekStart.getTime() - 7*24*3600*1000))}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50">← Tuần trước</button>
              <button onClick={() => setSelectedWeekStart(new Date(selectedWeekStart.getTime() + 7*24*3600*1000))}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50">Tuần sau →</button>
            </div>
          )}
          {(viewMode === 'month' || viewMode === 'year') && (
            <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500">
              {availableYears.map(y => <option key={y} value={y}>Năm {y}</option>)}
            </select>
          )}
          {viewMode === 'month' && (
            <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500">
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}/{selectedYear}</option>)}
            </select>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-gray-200 border-t-yellow-600 rounded-full animate-spin" /></div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {[
              { label: 'Doanh thu', value: kpis.revenue.toLocaleString('vi-VN') + 'đ', icon: <TrendingUp size={18}/>, color: 'bg-green-50 text-green-600', big: true },
              { label: 'Tổng đơn', value: String(kpis.total), icon: <Calendar size={18}/>, color: 'bg-blue-50 text-blue-600' },
              { label: 'Thành công', value: String(kpis.paid), icon: <CheckCircle2 size={18}/>, color: 'bg-emerald-50 text-emerald-600' },
              { label: 'Tỉ lệ', value: kpis.rate + '%', icon: <BarChart3 size={18}/>, color: 'bg-purple-50 text-purple-600' },
              { label: 'TB/đơn', value: kpis.avg.toLocaleString('vi-VN') + 'đ', icon: <Users size={18}/>, color: 'bg-sky-50 text-sky-600' },
              { label: 'Đã hủy', value: String(kpis.cancelled), icon: <XCircle size={18}/>, color: 'bg-red-50 text-red-600' },
            ].map((card, i) => (
              <motion.div key={card.label} initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} transition={{delay: i*0.07}}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className={`p-2 rounded-xl ${card.color} w-fit mb-2`}>{card.icon}</div>
                <p className="text-gray-500 text-[10px] md:text-xs font-medium">{card.label}</p>
                <p className={`font-bold text-gray-900 ${card.big ? 'text-sm md:text-base' : 'text-lg md:text-xl'}`}>{card.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Main Chart */}
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center text-sm md:text-base">
                <BarChart3 className="w-4 h-4 mr-2 text-gray-400" />
                Biểu đồ doanh thu — {periodLabel}
              </h3>
              <span className="text-xs text-gray-400">{chartData.filter(d => d.val > 0).length} mốc có doanh thu</span>
            </div>
            {chartData.every(d => d.val === 0) ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
                <BarChart3 className="w-10 h-10 mb-2 opacity-30" />
                Chưa có doanh thu trong giai đoạn này
              </div>
            ) : (
              <div className="flex items-end gap-1 overflow-x-auto pb-2" style={{ minHeight: '200px' }}>
                {chartData.map((d, i) => (
                  <Bar key={i} val={d.val} max={maxChartVal} label={d.label} tooltip={d.tooltip} />
                ))}
              </div>
            )}
          </div>

          {/* Bottom Grid */}
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {/* Top Rooms */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 mr-2 text-yellow-600" /> Top phòng doanh thu
              </h3>
              {topRooms.length === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-6">Chưa có dữ liệu</p>
              ) : (
                <div className="space-y-3">
                  {topRooms.map(([name, data], i) => (
                    <div key={name}>
                      <div className="flex justify-between items-start text-xs mb-1">
                        <span className="font-bold text-gray-800 flex items-center gap-1">
                          <span className={`w-4 h-4 rounded-full text-white text-[9px] flex items-center justify-center font-black ${i===0?'bg-yellow-500':i===1?'bg-gray-400':i===2?'bg-amber-700':'bg-gray-300'}`}>{i+1}</span>
                          {name}
                        </span>
                        <span className="text-gray-500 font-mono shrink-0 ml-1">{data.revenue.toLocaleString('vi-VN')}đ</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                          <div className="h-1.5 bg-yellow-500 rounded-full transition-all" style={{ width: `${(data.revenue / topRooms[0][1].revenue) * 100}%` }} />
                        </div>
                        <span className="text-[9px] text-gray-400 shrink-0">{data.count} đơn</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status Breakdown */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center text-sm">
                <Clock className="w-4 h-4 mr-2 text-blue-500" /> Phân loại trạng thái
              </h3>
              {statusBreakdown.length === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-6">Chưa có dữ liệu</p>
              ) : (
                <div className="space-y-2">
                  {statusBreakdown.map(([status, count]) => {
                    const info = STATUS_LABELS[status] || { label: status, color: 'bg-gray-300' };
                    const pct = filteredBookings.length > 0 ? Math.round((count / filteredBookings.length) * 100) : 0;
                    return (
                      <div key={status} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${info.color} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center text-xs mb-0.5">
                            <span className="font-medium text-gray-700 truncate">{info.label}</span>
                            <span className="text-gray-500 ml-1 shrink-0">{count} ({pct}%)</span>
                          </div>
                          <div className="h-1 bg-gray-100 rounded-full">
                            <div className={`h-1 rounded-full ${info.color}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Booking List Preview */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-emerald-500" /> Đơn gần nhất
              </h3>
              {filteredBookings.length === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-6">Chưa có đơn</p>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  {[...filteredBookings].sort((a,b) => new Date(b.date||b.created_at||0).getTime() - new Date(a.date||a.created_at||0).getTime()).slice(0, 10).map((b, i) => {
                    const info = STATUS_LABELS[b.status] || { label: b.status, color: 'bg-gray-300' };
                    return (
                      <div key={b.id || i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <div className={`w-2 h-2 rounded-full ${info.color} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">{b.customerName || 'Khách vãng lai'}</p>
                          <p className="text-[10px] text-gray-500 truncate">{b.roomName} — {(b.total||0).toLocaleString('vi-VN')}đ</p>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md text-white ${info.color}`}>{info.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
