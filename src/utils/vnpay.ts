export async function generateVNPayUrl(amount: number, orderId: string, orderInfo: string) {
  // LƯU Ý BẢO MẬT: Trong dự án thực tế, KHÔNG ĐƯỢC để HashSecret ở Frontend.
  // Việc tạo URL và ký chữ ký (sign) phải được thực hiện ở Backend (như Supabase Edge Functions).
  // Đoạn code này chỉ dùng để DEMO/TESTING.
  
  const vnp_TmnCode = import.meta.env.VITE_VNP_TMNCODE || "DEMO1234";
  const vnp_HashSecret = import.meta.env.VITE_VNP_HASHSECRET || "DEMOSECRET";
  const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
  const vnp_ReturnUrl = window.location.origin + "/vnpay-return";

  const date = new Date();
  // YYYYMMDDHHmmss
  const createDate = date.getFullYear().toString() + 
    (date.getMonth() + 1).toString().padStart(2, '0') + 
    date.getDate().toString().padStart(2, '0') + 
    date.getHours().toString().padStart(2, '0') + 
    date.getMinutes().toString().padStart(2, '0') + 
    date.getSeconds().toString().padStart(2, '0');

  const expireDateObj = new Date(date.getTime() + 15 * 60000); // 15 mins expire
  const expireDate = expireDateObj.getFullYear().toString() + 
    (expireDateObj.getMonth() + 1).toString().padStart(2, '0') + 
    expireDateObj.getDate().toString().padStart(2, '0') + 
    expireDateObj.getHours().toString().padStart(2, '0') + 
    expireDateObj.getMinutes().toString().padStart(2, '0') + 
    expireDateObj.getSeconds().toString().padStart(2, '0');

  const vnp_Params: Record<string, string> = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: vnp_TmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "other",
    vnp_Amount: (amount * 100).toString(),
    vnp_ReturnUrl: vnp_ReturnUrl,
    vnp_IpAddr: "127.0.0.1", // In real env, get from server
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate
  };

  // Sort keys alphabetically
  const sortedKeys = Object.keys(vnp_Params).sort();
  const sortedParams: Record<string, string> = {};
  
  for (const key of sortedKeys) {
    sortedParams[key] = vnp_Params[key];
  }

  const signData = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value.toString())}`)
    .join('&');

  const secureHash = await hmacSha512(vnp_HashSecret, signData);
  
  const paymentUrl = `${vnp_Url}?${signData}&vnp_SecureHash=${secureHash}`;
  
  return paymentUrl;
}

export async function verifyVNPayReturn(queryString: string): Promise<boolean> {
  const urlParams = new URLSearchParams(queryString);
  const vnp_SecureHash = urlParams.get('vnp_SecureHash');
  
  if (!vnp_SecureHash) return false;
  
  // Xóa hash để kiểm tra chữ ký
  urlParams.delete('vnp_SecureHash');
  urlParams.delete('vnp_SecureHashType');
  
  const vnp_Params: Record<string, string> = {};
  for (const [key, value] of urlParams.entries()) {
    vnp_Params[key] = value;
  }
  
  const sortedKeys = Object.keys(vnp_Params).sort();
  const signData = sortedKeys
    .map(key => `${key}=${encodeURIComponent(vnp_Params[key])}`)
    .join('&');
    
  const vnp_HashSecret = import.meta.env.VITE_VNP_HASHSECRET || "DEMOSECRET";
  const calculatedHash = await hmacSha512(vnp_HashSecret, signData);
  
  return calculatedHash === vnp_SecureHash;
}

async function hmacSha512(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}
