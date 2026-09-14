const fs = require('fs');
let code = fs.readFileSync('src/pages/staff/StaffApp.tsx', 'utf8');

code = code.replace(
  /const data = await getBookings\(\);\s*setBookings\(data\);/g,
  'const data = await getBookings();\n        const holdsData = await getBookingHolds();\n        setHolds(holdsData);\n        setBookings(data);'
);

code = code.replace(
  'useEffect(() => {\n    loadData();',
  'useEffect(() => {\n    const pollHolds = setInterval(async () => {\n      try {\n        const { getBookingHolds } = await import("../../utils/db");\n        const holdsData = await getBookingHolds();\n        setHolds(holdsData);\n      } catch (e) {}\n    }, 10000);\n    return () => clearInterval(pollHolds);\n  }, []);\n\n  useEffect(() => {\n    loadData();'
);

fs.writeFileSync('src/pages/staff/StaffApp.tsx', code);
