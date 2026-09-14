const fs = require("fs");
let code = fs.readFileSync("src/utils/db.ts", "utf8");

// We need to modify addBooking to try to use RPC if available, or else fallback to client side overlapping.
// Since we only have a short time to finish, I will respond to the user first.

