const fs = require("fs");
let code = fs.readFileSync("src/pages/staff/StaffApp.tsx", "utf8");

code = code.replace(/let endStr = .N\\/A.;/g, "let endStr = b.checkOut;");
code = code.replace(/endStr = .10:00\\(hsau\\).;/g, "endStr = \\\"10:00 (hsau)\\\";");
code = code.replace(/endStr = .12:00\\(hsau\\).;/g, "endStr = \\\"12:00 (hsau)\\\";");

fs.writeFileSync("src/pages/staff/StaffApp.tsx", code);

