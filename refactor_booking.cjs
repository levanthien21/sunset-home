const fs = require("fs");
let code = fs.readFileSync("src/pages/customer/BookingPage.tsx", "utf8");

// Remove email logic
code = code.replace("const [email, setEmail] = useState('');\\n", "");
code = code.replace("email: email,", "");

// We will simplify the JSX. 
// Right now, Step 1 lists rooms. Step 2 lists contact info.
// I can just replace the specific JSX parts.

