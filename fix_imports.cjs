const fs = require("fs");
let staff = fs.readFileSync("src/pages/staff/StaffApp.tsx", "utf8");
staff = staff.replace(`import { Home, LogOut, CheckCircle2, Clock, Search, LogIn, LogOut as CheckOutIcon, X, Plus, Trash2, Edit2, Shield, Calendar, BedDouble, Check, Coffee } from "lucide-react";`, `import { LogOut, X, Plus, BedDouble, Coffee } from "lucide-react";`);
staff = staff.replace(`import { Routes, Route, Link, useNavigate } from "react-router-dom";`, `import { Routes, Route, useNavigate } from "react-router-dom";`);
staff = staff.replace(`  const [searchTerm, setSearchTerm] = useState("");`, ``);
staff = staff.replace(`  const [showAddonsModal, setShowAddonsModal] = useState(false);`, ``);
fs.writeFileSync("src/pages/staff/StaffApp.tsx", staff);

let admin = fs.readFileSync("src/pages/admin/AdminRooms.tsx", "utf8");
admin = admin.replace(`import { motion } from "framer-motion";`, ``);
fs.writeFileSync("src/pages/admin/AdminRooms.tsx", admin);
