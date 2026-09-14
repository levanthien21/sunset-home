const fs = require("fs");
let code = fs.readFileSync("src/pages/staff/StaffApp.tsx", "utf8");
code = code.replace(`import { motion } from "framer-motion";`, "");
code = code.replace("Plus, BedDouble, Coffee", "Plus, Coffee");
fs.writeFileSync("src/pages/staff/StaffApp.tsx", code);

