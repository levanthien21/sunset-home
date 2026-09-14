const fs = require('fs');
let code = fs.readFileSync('src/pages/staff/StaffApp.tsx', 'utf8');

if (!code.includes('const [holds, setHolds]')) {
  // Add state
  code = code.replace(
    'const [bookings, setBookings] = useState<any[]>([]);',
    'const [bookings, setBookings] = useState<any[]>([]);\n  const [holds, setHolds] = useState<any[]>([]);'
  );
  
  // Add fetch
  code = code.replace(
    'const { getRooms, getBookings, updateBookingStatus } = await import("../../utils/db");',
    'const { getRooms, getBookings, updateBookingStatus, getBookingHolds } = await import("../../utils/db");'
  );
  code = code.replace(
    'const data = await getBookings();',
    'const data = await getBookings();\n        const holdsData = await getBookingHolds();\n        setHolds(holdsData);'
  );
  
  // Add polling for holds (every 10 seconds)
  const oldUseEffect = '  useEffect(() => {\n    loadData();';
  const newUseEffect = `  useEffect(() => {
    const pollHolds = setInterval(async () => {
      try {
        const { getBookingHolds } = await import("../../utils/db");
        const holdsData = await getBookingHolds();
        setHolds(holdsData);
      } catch (e) {}
    }, 10000);
    return () => clearInterval(pollHolds);
  }, []);

  useEffect(() => {
    loadData();`;
  
  code = code.replace(oldUseEffect, newUseEffect);
  
  // Update Realtime Status calculation to include Holds
  const oldGetStatus = `  const getRoomRealtimeStatus = (roomName: string) => {
    const roomBookings = bookings.filter(b => b.roomName === roomName);
    const active = roomBookings.find(b => b.status === "checked_in");
    if (active) return { status: "occupied", booking: active };
    const dirty = roomBookings.find(b => b.status === "checked_out_dirty");
    if (dirty) return { status: "dirty", booking: dirty };
    return { status: "available", booking: null };
  };`;
  
  const newGetStatus = `  const getRoomRealtimeStatus = (roomName: string) => {
    const roomBookings = bookings.filter(b => b.roomName === roomName);
    const active = roomBookings.find(b => b.status === "checked_in");
    if (active) return { status: "occupied", booking: active };
    const dirty = roomBookings.find(b => b.status === "checked_out_dirty");
    if (dirty) return { status: "dirty", booking: dirty };
    
    // Check if there is a hold
    const isHold = holds.find(h => h.room_name === roomName);
    if (isHold) return { status: "holding", booking: null };
    
    return { status: "available", booking: null };
  };`;
  
  code = code.replace(oldGetStatus, newGetStatus);
  
  // Update UI logic for styling holding
  const oldStyles = `          const styles = {
            available: { wrapper: "bg-white border-green-200 hover:border-green-500", header: "text-green-700", badge: "bg-green-100 text-green-700", inner: "bg-gray-50/50" },
            occupied: { wrapper: "bg-red-50 border-red-200 hover:border-red-300", header: "text-red-700", badge: "bg-red-100 text-red-700", inner: "bg-white/60" },
            dirty: { wrapper: "bg-yellow-50 border-yellow-300 hover:border-yellow-400", header: "text-yellow-700", badge: "bg-yellow-100 text-yellow-700", inner: "bg-white/60" }
          };`;
          
  const newStyles = `          const styles = {
            available: { wrapper: "bg-white border-green-200 hover:border-green-500", header: "text-green-700", badge: "bg-green-100 text-green-700", inner: "bg-gray-50/50" },
            occupied: { wrapper: "bg-red-50 border-red-200 hover:border-red-300", header: "text-red-700", badge: "bg-red-100 text-red-700", inner: "bg-white/60" },
            dirty: { wrapper: "bg-yellow-50 border-yellow-300 hover:border-yellow-400", header: "text-yellow-700", badge: "bg-yellow-100 text-yellow-700", inner: "bg-white/60" },
            holding: { wrapper: "bg-purple-50 border-purple-300 hover:border-purple-400 opacity-90", header: "text-purple-700", badge: "bg-purple-100 text-purple-700 animate-pulse", inner: "bg-white/60" }
          };`;
  code = code.replace(oldStyles, newStyles);
  
  // Update Badge logic
  const oldBadge = `{status === "available" ? "🟢 TRỐNG" : status === "occupied" ? "🔴 ĐANG Ở" : "🟡 CHỜ DỌN"}`;
  const newBadge = `{status === "available" ? "🟢 TRỐNG" : status === "occupied" ? "🔴 ĐANG Ở" : status === "dirty" ? "🟡 CHỜ DỌN" : "🟣 KHÁCH ĐANG CHỌN"}`;
  code = code.replace(oldBadge, newBadge);
  
  // Update OnClick logic so they can't book a holding room
  const oldClick = `if (status === "available") {`;
  const newClick = `if (status === "holding") {
                  alert("Phòng đang có khách chọn trực tuyến và chờ thanh toán. Vui lòng đợi trong vài phút để tránh trùng đơn!");
                  return;
                }
                if (status === "available") {`;
  code = code.replace(oldClick, newClick);
  
  fs.writeFileSync('src/pages/staff/StaffApp.tsx', code);
  console.log("Success integrating holds");
}
