const fs = require("fs");
let code = fs.readFileSync("src/utils/db.ts", "utf8");

const rpcLogic = `
export const checkAvailabilityWithRPC = async (roomName: string, startTime: string, endTime: string) => {
  if (!supabase) return true;
  try {
    const { data, error } = await supabase.rpc("check_room_availability", {
      p_room_name: roomName,
      p_start_time: startTime,
      p_end_time: endTime
    });
    if (error) {
       console.error("RPC Error:", error);
       return true; // fallback to true if error
    }
    return data;
  } catch(e) {
    return true;
  }
};
`;

if (!code.includes("checkAvailabilityWithRPC")) {
  code = code + "\n" + rpcLogic;
  fs.writeFileSync("src/utils/db.ts", code);
}

