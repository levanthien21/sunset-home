const fs = require("fs");
let code = fs.readFileSync("src/utils/db.ts", "utf8");

const holdsFn = `
export const getBookingHolds = async () => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("booking_holds")
        .select("*")
        .gt("expires_at", new Date().toISOString());
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error("L?i l?y holds:", e);
      return [];
    }
  }
  return [];
};
`;

if (!code.includes("getBookingHolds")) {
  code = code + "\\n" + holdsFn;
  fs.writeFileSync("src/utils/db.ts", code);
}

