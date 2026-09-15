const fs = require('fs');

let content = fs.readFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/customer/PayOSReturnPage.tsx', 'utf8');

const targetStr = `          // Giao dịch thành công
          await updateBookingStatus(orderId, 'paid');
          setStatus('success');
          
          // Gửi email xác nhận sau khi thanh toán thành công
          try {
            const { getBookings } = await import('../../utils/db');
            const allBookings = await getBookings();
            const bookingDetails = allBookings.find((b: any) => b.id?.toString() === orderId?.toString() || b.bookingId?.toString() === orderId?.toString());
            
            if (bookingDetails) {`;

const newStr = `          // Giao dịch thành công
          await updateBookingStatus(orderId, 'paid');
          setStatus('success');
          
          // Gửi email xác nhận sau khi thanh toán thành công
          try {
            const { getBookings } = await import('../../utils/db');
            const allBookings = await getBookings();
            const bookingDetails = allBookings.find((b: any) => b.id?.toString() === orderId?.toString() || b.bookingId?.toString() === orderId?.toString());
            
            if (bookingDetails) {
              // Create in-app notifications
              await createNotification({
                userId: bookingDetails.user_id, // customer
                title: 'Đặt phòng thành công',
                message: \`Bạn đã đặt thành công phòng \${bookingDetails.roomName}. Mã đơn: \${orderId}\`,
                link: '/profile'
              });
              
              await createNotification({
                targetRole: 'admin',
                title: 'Có đơn đặt phòng mới',
                message: \`Khách \${bookingDetails.customerName} đã đặt phòng \${bookingDetails.roomName}. Mã đơn: \${orderId}\`,
                link: '/admin/bookings'
              });
              
              await createNotification({
                targetRole: 'staff',
                title: 'Có đơn đặt phòng mới',
                message: \`Khách \${bookingDetails.customerName} đã đặt phòng \${bookingDetails.roomName}. Mã đơn: \${orderId}\`,
                link: '/staff'
              });`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  fs.writeFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/customer/PayOSReturnPage.tsx', content);
  console.log('Successfully patched PayOS return');
} else {
  console.log('Target string not found');
}
