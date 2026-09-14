const fs = require('fs');

function fixCharset(file) {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');
  
  // Basic menu
  code = code.replace(/T ng quan/g, 'Tổng quan');
  code = code.replace(/Qun lA \?n/g, 'Quản lý đơn');
  code = code.replace(/PhAng & GiA/g, 'Phòng & Giá');
  code = code.replace(/BAo cAo/g, 'Báo cáo');
  code = code.replace(/TAi khon/g, 'Tài khoản');
  code = code.replace(/\?ng xut/g, 'Đăng xuất');

  // AdminUsers specific
  code = code.replace(/Qun lA KhAch hAng/g, 'Quản lý Người dùng');
  code = code.replace(/Danh sAch tAi khon `A `ng kA trAn h th`ng/g, 'Danh sách tài khoản trên hệ thống');
  code = code.replace(/T ng tAi khon/g, 'Tổng tài khoản');
  code = code.replace(/KhA'ng th kt n`i CSDL Supabase./g, 'Không thể kết nối CSDL Supabase.');
  code = code.replace(/CA3 l-i xy ra khi ly danh sAch ng\?i dA1ng/g, 'Có lỗi xảy ra khi lấy danh sách người dùng');
  code = code.replace(/Cha cA3 ng\?i dA1ng nAo/g, 'Chưa có người dùng nào');
  code = code.replace(/PhAn quy\?n/g, 'Phân quyền');
  code = code.replace(/NgAy tham gia/g, 'Ngày tham gia');
  code = code.replace(/KhAch hAng/g, 'Khách hàng');
  code = code.replace(/Bn cA3 ch_c mu`n cp quy\?n/g, 'Bạn có chắc muốn phân quyền');
  code = code.replace(/L-i c-p nh-t phAn quy\?n/g, 'Lỗi cập nhật phân quyền');
  code = code.replace(/L. tAn/g, 'Lễ tân');
  code = code.replace(/Qun lA/g, 'Quản lý');
  
  fs.writeFileSync(file, code);
}

fixCharset('src/pages/admin/AdminApp.tsx');
fixCharset('src/pages/admin/AdminUsers.tsx');
console.log('Fixed charset');
