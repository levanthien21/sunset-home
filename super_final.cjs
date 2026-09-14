const fs = require('fs');
let code = fs.readFileSync('src/pages/staff/StaffApp.tsx', 'utf8');

// 1. Add state
code = code.replace(
  'const [bookings, setBookings] = useState<any[]>([]);',
  'const [bookings, setBookings] = useState<any[]>([]);\n  const [holds, setHolds] = useState<any[]>([]);'
);

// 2. Add to loadData
code = code.replace(
  'const { getBookings, getRooms } = await import("../../utils/db");\n    setBookings(await getBookings());',
  'const { getBookings, getRooms, getBookingHolds } = await import("../../utils/db");\n    setBookings(await getBookings());\n    setHolds(await getBookingHolds());'
);

// 3. Add polling in useEffect
code = code.replace(
  'useEffect(() => {\n    loadData();\n  }, []);',
  'useEffect(() => {\n    loadData();\n    const pollHolds = setInterval(async () => {\n      try {\n        const { getBookingHolds } = await import("../../utils/db");\n        const holdsData = await getBookingHolds();\n        setHolds(holdsData);\n      } catch (e) {}\n    }, 10000);\n    return () => clearInterval(pollHolds);\n  }, []);'
);

// 4. Status logic
code = code.replace(
  'const dirty = roomBookings.find(b => b.status === "checked_out_dirty");\n    if (dirty) return { status: "dirty", booking: dirty };\n    return { status: "available", booking: null };',
  'const dirty = roomBookings.find(b => b.status === "checked_out_dirty");\n    if (dirty) return { status: "dirty", booking: dirty };\n    const isHold = holds.find(h => h.room_name === roomName);\n    if (isHold) return { status: "holding", booking: null };\n    return { status: "available", booking: null };'
);

// 5. Styles logic
code = code.replace(
  'dirty: { wrapper: "bg-yellow-50 border-yellow-300 hover:border-yellow-400", header: "text-yellow-700", badge: "bg-yellow-100 text-yellow-700", inner: "bg-white/60" }\n          };',
  'dirty: { wrapper: "bg-yellow-50 border-yellow-300 hover:border-yellow-400", header: "text-yellow-700", badge: "bg-yellow-100 text-yellow-700", inner: "bg-white/60" },\n            holding: { wrapper: "bg-purple-50 border-purple-300 hover:border-purple-400 opacity-90", header: "text-purple-700", badge: "bg-purple-100 text-purple-700 animate-pulse", inner: "bg-white/60" }\n          };'
);

// 6. Badge logic
code = code.replace(
  '{status === "available" ? "🟢 TRỐNG" : status === "occupied" ? "🔴 ĐANG Ở" : "🟡 CHỜ DỌN"}',
  '{status === "available" ? "🟢 TRỐNG" : status === "occupied" ? "🔴 ĐANG Ở" : status === "dirty" ? "🟡 CHỜ DỌN" : "🟣 KHÁCH ĐANG CHỌN"}'
);

// 7. Onclick block
code = code.replace(
  'if (status === "available") {\n                  setManualForm',
  'if (status === "holding") {\n                  alert("Phòng đang có khách chọn trực tuyến và chờ thanh toán. Vui lòng đợi trong vài phút để tránh trùng đơn!");\n                  return;\n                }\n                if (status === "available") {\n                  setManualForm'
);

fs.writeFileSync('src/pages/staff/StaffApp.tsx', code);
console.log('Success holds');
