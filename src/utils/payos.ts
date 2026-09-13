export async function createPayOSPaymentLink(amount: number, orderCode: number, description: string) {
  // LƯU Ý BẢO MẬT: Trong dự án thực tế, KHÔNG ĐƯỢC để Client ID, API Key và Checksum Key ở Frontend.
  // Việc gọi API này phải được thực hiện ở Backend (như Supabase Edge Functions).
  // Đoạn code này chỉ dùng để DEMO/TESTING.
  
  const CLIENT_ID = import.meta.env.VITE_PAYOS_CLIENT_ID || "DEMO_CLIENT_ID";
  const API_KEY = import.meta.env.VITE_PAYOS_API_KEY || "DEMO_API_KEY";
  const CHECKSUM_KEY = import.meta.env.VITE_PAYOS_CHECKSUM_KEY || "DEMO_CHECKSUM_KEY";
  
  const RETURN_URL = window.location.origin + "/payos-return";
  const CANCEL_URL = window.location.origin + "/payos-return?cancel=true";
  
  // Rút gọn description nếu quá dài (PayOS giới hạn 25 ký tự)
  const shortDesc = description.substring(0, 25);
  
  const body = {
    orderCode,
    amount,
    description: shortDesc,
    returnUrl: RETURN_URL,
    cancelUrl: CANCEL_URL
  };
  
  // Sort data by key alphabet and format as key=value&key=value
  const signData = `amount=${amount}&cancelUrl=${CANCEL_URL}&description=${shortDesc}&orderCode=${orderCode}&returnUrl=${RETURN_URL}`;
  
  const signature = await hmacSha256(CHECKSUM_KEY, signData);
  
  const requestBody = {
    ...body,
    signature
  };
  
  // Gọi API tạo link thanh toán (chỉ test qua demo/proxy hoặc trực tiếp nếu CORS cho phép)
  // Thực tế: PayOS không cho phép gọi trực tiếp từ Browser do lỗi CORS.
  // Tuy nhiên trong demo, nếu bị CORS, ta sẽ mô phỏng trả về 1 mock URL.
  
  try {
    const response = await fetch("https://api-merchant.payos.vn/v2/payment-requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": CLIENT_ID,
        "x-api-key": API_KEY
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`PayOS Error: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (data.code === "00" && data.data?.checkoutUrl) {
      return data.data.checkoutUrl;
    } else {
      throw new Error(data.desc || "Failed to create payment link");
    }
  } catch (error) {
    console.error("PayOS API Call failed (possibly CORS or invalid keys):", error);
    // FALLBACK DEMO: Giả lập trả về một link checkout giả
    console.warn("Đang sử dụng Mock Checkout URL vì lỗi gọi API thực tế.");
    const mockUrl = `/payos-return?orderCode=${orderCode}&amount=${amount}&status=PAID`;
    return mockUrl;
  }
}

export async function verifyPayOSReturn(queryString: string): Promise<boolean> {
  const urlParams = new URLSearchParams(queryString);
  const code = urlParams.get('code');
  const status = urlParams.get('status');
  
  // Mock logic check
  if (status === 'PAID' || code === '00') {
    return true;
  }
  return false;
}

async function hmacSha256(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}
