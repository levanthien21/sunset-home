const fs = require('fs');

let content = fs.readFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/customer/PayOSReturnPage.tsx', 'utf8');

const importStatement = `import { updateBookingStatus, createNotification } from '../../utils/db';`;
content = content.replace(/import \{ updateBookingStatus \} from '\.\.\/\.\.\/utils\/db';/, importStatement);

const notificationLogic = `
          // Giao dịch thành công
          await updateBookingStatus(orderId, 'paid');
          setStatus('success');
          
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
              });
              `;

content = content.replace(/\/\/ Giao dịch thành công\n\s*await updateBookingStatus\(orderId, 'paid'\);\n\s*setStatus\('success'\);\n\s*try \{\n\s*const \{ getBookings \} = await import\('\.\.\/\.\.\/utils\/db'\);\n\s*const allBookings = await getBookings\(\);\n\s*const bookingDetails = allBookings\.find\(\(b: any\) => b\.id\?\.toString\(\) === orderId\?\.toString\(\) \|\| b\.bookingId\?\.toString\(\) === orderId\?\.toString\(\)\);/, notificationLogic);

fs.writeFileSync('c:/Users/ASUS/Desktop/Sunset home/src/pages/customer/PayOSReturnPage.tsx', content);
console.log('Patched PayOSReturnPage notifications');
