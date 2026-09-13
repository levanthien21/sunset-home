import { motion } from 'framer-motion';

export default function PoliciesPage() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-24 px-6 max-w-4xl mx-auto font-sans text-gray-900"
    >
      <div className="text-center mb-16">
        <h1 className="text-4xl font-serif mb-4">Chính sách & Quy định</h1>
        <p className="text-gray-500 font-light">Những điều bạn cần biết khi trải nghiệm tại Sunset Home</p>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-xl font-bold uppercase tracking-widest text-yellow-600 mb-6 border-b border-gray-200 pb-2">1. Thời gian nhận & trả phòng</h2>
          <ul className="space-y-4 font-light text-gray-600">
            <li><strong className="font-semibold text-gray-900">Nhận phòng (Check-in):</strong> Từ 14:00. Nếu có phòng trống sớm hơn, chúng tôi sẽ hỗ trợ không phụ thu.</li>
            <li><strong className="font-semibold text-gray-900">Trả phòng (Check-out):</strong> Trước 12:00 trưa ngày hôm sau.</li>
            <li>Phụ thu trả phòng trễ: 100.000đ/giờ (từ 12:00 đến 18:00). Trả phòng sau 18:00 sẽ tính 100% tiền phòng 1 đêm.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-widest text-yellow-600 mb-6 border-b border-gray-200 pb-2">2. Chính sách hoàn & hủy phòng</h2>
          <ul className="space-y-4 font-light text-gray-600">
            <li>Hủy trước 07 ngày so với ngày check-in: Hoàn 100% tiền cọc.</li>
            <li>Hủy trước 03-06 ngày: Hoàn 50% tiền cọc.</li>
            <li>Hủy trong vòng 48 giờ hoặc Không đến (No-show): Không hoàn tiền cọc.</li>
            <li>Trong trường hợp bất khả kháng (dịch bệnh, bão lũ), Sunset Home sẽ hỗ trợ bảo lưu tiền cọc cho lần đặt sau.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-widest text-yellow-600 mb-6 border-b border-gray-200 pb-2">3. Nội quy Homestay</h2>
          <ul className="space-y-4 font-light text-gray-600">
            <li><strong className="font-semibold text-gray-900">Không hút thuốc:</strong> Tuyệt đối không hút thuốc trong phòng và các khu vực sinh hoạt chung (áp dụng cả thuốc lá điện tử). Quý khách vui lòng chỉ hút thuốc ngoài ban công.</li>
            <li><strong className="font-semibold text-gray-900">Giữ yên tĩnh:</strong> Vui lòng giảm âm lượng và không tụ tập ồn ào sau 22:00 để đảm bảo không gian nghỉ ngơi cho mọi người xung quanh.</li>
            <li><strong className="font-semibold text-gray-900">Giữ gìn vệ sinh chung:</strong> Quý khách tự dọn dẹp sau khi nấu nướng và tổ chức tiệc BBQ. Nếu không, phí dọn dẹp phụ thu là 300.000đ.</li>
            <li><strong className="font-semibold text-gray-900">Vật nuôi:</strong> Vui lòng liên hệ trước với chúng tôi nếu bạn muốn mang theo thú cưng.</li>
          </ul>
        </section>
      </div>
    </motion.div>
  );
}
