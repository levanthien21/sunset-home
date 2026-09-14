const fs = require("fs");
let code = fs.readFileSync("src/pages/customer/BookingPage.tsx", "utf8");
code = code.replace(/<div[^>]*>\s*<label[^>]*>Email.*?<\/label>\s*<input[^>]*type="email"[^>]*>\s*<\/div>/, "");
fs.writeFileSync("src/pages/customer/BookingPage.tsx", code);
