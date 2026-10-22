import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Heart, Sparkles, Shield, Clock, Users, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-20 pb-20">
      {/* Header Banner */}
      <section className="bg-[#213224] text-white py-16 sm:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-[#B3CDB8] uppercase">
            <Leaf className="w-3.5 h-3.5 text-[#A1C9A7]" />
            <span>Câu chuyện thương hiệu</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Về An Nhiên Spa — Khơi Nguồn Năng Lượng Tự Nhiên
          </h1>
          <p className="text-base text-[#C7D9C9] font-light leading-relaxed">
            Nơi kết nối con người với thiên nhiên, mang lại sự bình yên sâu lắng trong tâm hồn và vẻ đẹp rạng rỡ từ làn da khỏe khoắn.
          </p>
        </div>
      </section>

      {/* Brand Story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="text-xs font-bold uppercase tracking-widest text-[#5C7E63]">
              Khởi nguồn
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#233527] leading-tight">
              Hành Trình Tìm Lại Cân Bằng Giữa Cuộc Sống Bận Rộn
            </h2>
            <div className="space-y-4 text-sm text-[#4E6252] leading-relaxed">
              <p>
                An Nhiên Spa ra đời từ mong ước giản dị: tạo nên một ốc đảo xanh an tịnh ngay giữa lòng phố thị, nơi mọi vị khách khi bước qua cánh cửa đều có thể trút bỏ những áp lực, lo toan để hòa mình vào hương thơm cỏ cây và thanh âm dịu dàng.
              </p>
              <p>
                Tên gọi <strong>“An Nhiên”</strong> đại diện cho tâm thế an yên, tự tại trước vạn vật. Chúng tôi tin rằng vẻ đẹp bền vững không đến từ những biện pháp xâm lấn cấp tốc, mà bắt nguồn từ một cơ thể khỏe mạnh, một khí huyết lưu thông và một tinh thần thanh thản.
              </p>
              <p>
                Toàn bộ liệu trình tại An Nhiên đều được nghiên cứu kỹ lưỡng, kết hợp giữa tri thức thảo dược Đông y truyền thống và kỹ thuật chăm sóc khoa học hiện đại, nhằm nuôi dưỡng làn da và hệ thần kinh một cách an toàn, lành tính nhất.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-4/3 rounded-2xl overflow-hidden shadow-xl border border-[#DFD9C8]">
              <img
                src="/src/assets/images/hero_spa_ambiance_1792632796767.jpg"
                alt="Không gian phòng trị liệu An Nhiên Spa"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-6 -left-4 sm:left-6 bg-white p-5 rounded-2xl shadow-lg border border-[#DFDAC8] max-w-xs hidden sm:block">
              <div className="font-serif font-bold text-sm text-[#273B2C] mb-1">Thiết kế chuẩn thiền vị</div>
              <p className="text-xs text-[#5E7262]">
                Sử dụng vật liệu tre nứa, đá cuội tự nhiên và ánh sáng dịu mắt để tạo sự thư giãn tối ưu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-[#F3F0E6] py-16 border-y border-[#E2DDCB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-[#5C7E63]">
              Tôn chỉ hoạt động
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#233527]">
              Sứ Mệnh & 4 Giá Trị Cốt Lõi
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-[#DFDAC8] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#EDF3EE] text-[#406747] flex items-center justify-center">
                <Leaf className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#233527]">Thuần Khiết Tự Nhiên</h3>
              <p className="text-xs text-[#5D7060] leading-relaxed">
                Nói không với các hóa chất độc hại, cam kết sử dụng nguyên liệu thảo mộc lành tính có xuất xứ rõ ràng.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#DFDAC8] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#EDF3EE] text-[#406747] flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#233527]">Chăm Sóc Tận Tâm</h3>
              <p className="text-xs text-[#5D7060] leading-relaxed">
                Xem khách hàng như người thân, lắng nghe tường tận từng mong muốn để mang lại sự phục vụ trọn vẹn nhất.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#DFDAC8] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#EDF3EE] text-[#406747] flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#233527]">Minh Bạch & Trách Nhiệm</h3>
              <p className="text-xs text-[#5D7060] leading-relaxed">
                Rõ ràng về giá cả, thời lượng dịch vụ và quy định đặt cọc hoàn tiền, không phát sinh chi phí ẩn.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#DFDAC8] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#EDF3EE] text-[#406747] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#233527]">Nâng Niu Cảm Xúc</h3>
              <p className="text-xs text-[#5D7060] leading-relaxed">
                Đem lại trải nghiệm đa giác quan: mắt ngắm cảnh xanh, mũi ngửi hương thơm, tai nghe tiếng nhạc thiền.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section (Sample / Demo) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-bold uppercase tracking-widest text-[#5C7E63]">
            Đội ngũ chuyên môn
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#233527]">
            Những Bàn Tay Khéo Léo & Tận Tụy
          </h2>
          <p className="text-xs text-[#7B8F7F] italic">(Đội ngũ nhân sự minh họa đồ án)</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              name: 'Lương Y Lê Thảo My',
              role: 'Cố vấn chuyên môn Trị liệu Đông Y',
              exp: '12 năm kinh nghiệm châm cứu, bấm huyệt và trị liệu cơ xương khớp tại các viện y học cổ truyền.',
              image: '/src/assets/images/service_facial_treatment_1792632797197.jpg'
            },
            {
              name: 'Chuyên Viên Vũ Ngọc Hà',
              role: 'Trưởng nhóm Chăm sóc da liễu',
              exp: '8 năm kinh nghiệm phục hồi da tổn thương, đạt chứng chỉ chuyên sâu về điện di nano và thảo dược học.',
              image: '/src/assets/images/service_body_scrub_1792632798359.jpg'
            },
            {
              name: 'Kỹ Thuật Viên Nguyễn Hoàng Nam',
              role: 'Chuyên gia Massage Đá Nóng & Chuông Xoay',
              exp: 'Đào tạo trị liệu chuông xoay năng lượng Tây Tạng và các kỹ thuật giải cơ sâu chuyên biệt cho nhân viên văn phòng.',
              image: '/src/assets/images/service_massage_therapy_1792632798168.jpg'
            }
          ].map((member, idx) => (
            <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-[#DFDAC8] shadow-xs flex flex-col">
              <div className="aspect-4/3 overflow-hidden bg-slate-100">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#233527]">{member.name}</h3>
                  <div className="text-xs font-medium text-[#466A4B] mt-0.5">{member.role}</div>
                  <p className="text-xs text-[#5D7060] mt-3 leading-relaxed">{member.exp}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Spa Space Gallery */}
      <section className="bg-[#FAF9F5] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="text-xs font-bold uppercase tracking-widest text-[#5C7E63]">
            Không Gian Trải Nghiệm
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#233527]">
            Góc Nhỏ An Nhiên
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="aspect-4/3 rounded-2xl overflow-hidden shadow-xs border border-[#E0DBCB]">
            <img
              src="/src/assets/images/hero_spa_ambiance_1792632796767.jpg"
              alt="Phòng trị liệu"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="aspect-4/3 rounded-2xl overflow-hidden shadow-xs border border-[#E0DBCB]">
            <img
              src="/src/assets/images/service_facial_treatment_1792632797197.jpg"
              alt="Khu vực chăm sóc da"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="aspect-4/3 rounded-2xl overflow-hidden shadow-xs border border-[#E0DBCB]">
            <img
              src="/src/assets/images/service_body_scrub_1792632798359.jpg"
              alt="Góc thảo dược và bồn tắm"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
