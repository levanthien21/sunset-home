const fs = require('fs');
let code = fs.readFileSync('src/pages/staff/StaffApp.tsx', 'utf8');

// Add styles logic
code = code.replace(
  'holding: { wrapper: "bg-purple-50 border-purple-300 hover:border-purple-400 opacity-90", header: "text-purple-700", badge: "bg-purple-100 text-purple-700 animate-pulse", inner: "bg-white/60" }',
  'holding: { wrapper: "bg-purple-50 border-purple-300 hover:border-purple-400 opacity-90", header: "text-purple-700", badge: "bg-purple-100 text-purple-700 animate-pulse", inner: "bg-white/60" },\n            maintenance: { wrapper: "bg-gray-100 border-gray-300 opacity-70 cursor-not-allowed", header: "text-gray-600", badge: "bg-gray-200 text-gray-700", inner: "bg-gray-50/50" }'
);

// Add text logic
code = code.replace(
  'status === "dirty" ? "🟡 CHỜ DỌN" : "🟣 KHÁCH ĐANG CHỌN"}',
  'status === "dirty" ? "🟡 CHỜ DỌN" : status === "maintenance" ? "⚫ BẢO TRÌ" : "🟣 KHÁCH ĐANG CHỌN"}'
);

// Add click logic
code = code.replace(
  'if (status === "holding") {',
  'if (status === "maintenance") {\n                  alert("Phòng đang bảo trì. Bạn không thể thao tác trên phòng này!");\n                  return;\n                }\n                if (status === "holding") {'
);

fs.writeFileSync('src/pages/staff/StaffApp.tsx', code);
console.log('StaffApp UI patched');
