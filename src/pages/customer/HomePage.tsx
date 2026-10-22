import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatVND } from '../../utils/formatters';
import {
  Calendar,
  Clock,
  Sparkles,
  Leaf,
  ShieldCheck,
  Award,
  ChevronRight,
  ArrowRight,
  ShoppingBag,
  Star,
  Quote
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { services, products, addToCart } = useApp();

  const featuredServices = services.filter((s) => s.status === 'active').slice(0, 4);
  const featuredProducts = products.filter((p) => p.status === 'active').slice(0, 4);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center bg-[#1D2B20] text-white overflow-hidden">
        {/* Background Image with Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hero_spa_ambiance_1792632796767.jpg"
            alt="Không gian thư giãn An Nhiên Spa"
            className="w-full h-full object-cover object-center opacity-40 scale-105 transform animate-in fade-in duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#17221A] via-[#17221A]/85 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-2xl space-y-6">
            {/* Tagline kicker */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-[#B3CDB8] uppercase">
              <Leaf className="w-3.5 h-3.5 text-[#A1C9A7]" />
              <span>Liệu pháp thư giãn & Trị liệu thảo mộc Á Đông</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15] text-balance">
              An Yên Trong Từng Chạm, Đánh Thức Vẻ Đẹp Nguyên Bản
            </h1>

            <p className="text-base sm:text-lg text-[#C8D8CA] leading-relaxed font-light">
              Tại An Nhiên Spa, chúng tôi kết tinh tinh hoa thảo dược cổ truyền, năng lượng đá nóng tự nhiên và kỹ thuật bấm huyệt chuyên sâu để mang đến trải nghiệm phục hồi thân - tâm trọn vẹn nhất.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                to="/booking"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#4B6E52] hover:bg-[#3D5B43] text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <Calendar className="w-4 h-4" />
                <span>Đặt lịch trải nghiệm ngay</span>
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl backdrop-blur-md border border-white/20 transition-colors"
              >
                <span>Xem menu dịch vụ</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Trust highlights */}
            <div className="pt-8 grid grid-cols-3 gap-6 border-t border-white/15 text-xs text-[#BED2C0]">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white tabular-nums font-serif">100%</div>
                <div className="text-[11px] text-[#A6BFAB] mt-0.5">Thảo mộc tự nhiên</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white tabular-nums font-serif">8+ Năm</div>
                <div className="text-[11px] text-[#A6BFAB] mt-0.5">Kinh nghiệm trị liệu</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white tabular-nums font-serif">24 Giờ</div>
                <div className="text-[11px] text-[#A6BFAB] mt-0.5">Chính sách đổi hủy cọc</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BRAND MESSAGE & SHORT ABOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative">
            <div className="aspect-4/3 rounded-2xl overflow-hidden shadow-lg border border-[#E0DBCB]">
              <img
                src="/src/assets/images/service_body_scrub_1792632798359.jpg"
                alt="Nguyên liệu thảo dược thiên nhiên"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-6 -right-4 sm:right-6 bg-white p-4 rounded-xl shadow-md border border-[#E5DFCF] max-w-xs hidden sm:block">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#324C38] mb-1">
                <Leaf className="w-4 h-4 text-[#5D8565]" />
                <span>Nguồn gốc thảo mộc sạch</span>
              </div>
              <p className="text-[11px] text-[#647867]">
                Tất cả dược liệu ngải cứu, gừng sẻ, sả chanh đều được thu hái hữu cơ chuẩn y học cổ truyền.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="text-xs font-bold uppercase tracking-widest text-[#5C7E63]">
              Về An Nhiên Spa
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#233527] leading-tight text-balance">
              Chốn Dừng Chân Thanh Lặng Giữa Nhịp Sống Đô Thị Hối Hả
            </h2>
            <p className="text-sm sm:text-base text-[#4E6252] leading-relaxed">
              Thành lập với sứ mệnh tái tạo sự cân bằng cả về thể chất lẫn tinh thần, An Nhiên Spa không chỉ là nơi chăm sóc nhan sắc mà là một hành trình chữa lành. Từng góc nhỏ thơm hương tinh dầu trầm quế, từng giọt nước cất hoa hồng và từng thao tác miết cơ đá nóng đều được chăm chút bằng lòng thành kính và sự ân cần.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-[#F2EFE6] rounded-xl border border-[#DFDAC8]">
                <div className="font-semibold text-sm text-[#273B2C] mb-1">Liệu trình cá nhân hóa</div>
                <p className="text-xs text-[#5E7262]">
                  Lắng nghe cơ địa từng vị khách để điều chỉnh nhiệt độ đá, lực bấm huyệt và dòng dưỡng chất phù hợp nhất.
                </p>
              </div>
              <div className="p-4 bg-[#F2EFE6] rounded-xl border border-[#DFDAC8]">
                <div className="font-semibold text-sm text-[#273B2C] mb-1">Minh bạch & Chu đáo</div>
                <p className="text-xs text-[#5E7262]">
                  Quy trình đặt lịch rõ ràng, chính sách hoàn cọc bảo vệ quyền lợi khách hàng tuyệt đối khi có phát sinh.
                </p>
              </div>
            </div>
            <div>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#3C5D43] hover:text-[#233527] group"
              >
                <span>Đọc thêm về câu chuyện An Nhiên</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED SERVICES */}
      <section className="bg-[#F3F0E6] py-16 border-y border-[#E2DDCB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-widest text-[#5C7E63]">
                Dịch Vụ Nổi Bật
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#233527]">
                Các Liệu Trình Được Yêu Thích Nhất
              </h2>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#3C5D43] hover:text-[#223626]"
            >
              <span>Xem tất cả {services.length} dịch vụ</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow border border-[#E0DBCB] flex flex-col group"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                  <img
                    src={service.imageUrl}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[11px] font-semibold text-[#283C2D] px-2.5 py-1 rounded-md">
                    {service.categoryName}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-serif text-base font-bold text-[#243527] group-hover:text-[#3B5E41] transition-colors line-clamp-1">
                      {service.name}
                    </h3>
                    <p className="text-xs text-[#5D7060] line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#F0EBE0] space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#4F6452]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#738C77]" />
                        <span>{service.durationMinutes} phút</span>
                      </div>
                      <div className="font-semibold text-sm text-[#273B2C] tabular-nums">
                        {formatVND(service.price)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        to={`/services/${service.id}`}
                        className="text-center py-2 px-2 text-xs font-medium text-[#465E4B] bg-[#F3F0E6] hover:bg-[#EAE5D7] rounded-lg transition-colors"
                      >
                        Chi tiết
                      </Link>
                      <Link
                        to={`/booking?serviceId=${service.id}`}
                        className="text-center py-2 px-2 text-xs font-medium text-white bg-[#425E47] hover:bg-[#344D39] rounded-lg transition-colors"
                      >
                        Đặt lịch
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE AN NHIEN (4 PILLARS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="text-xs font-bold uppercase tracking-widest text-[#5C7E63]">
            Giá Trị Khác Biệt
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#233527] text-balance">
            Vì Sao Quý Khách An Tâm Lựa Chọn An Nhiên?
          </h2>
          <p className="text-sm text-[#546857]">
            Từng trải nghiệm được xây dựng trên sự thấu hiểu và tiêu chuẩn phục vụ tận tâm.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-[#DFDAC8] shadow-xs space-y-3">
            <div className="w-12 h-12 bg-[#EFF4F0] text-[#3E6144] rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#243728]">100% Thảo Mộc Tự Nhiên</h3>
            <p className="text-xs text-[#5D7060] leading-relaxed">
              Các vị thuốc ngâm bồn, cao đắp và tinh dầu được chiết xuất hữu cơ, không hóa chất bảo quản tổng hợp.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-[#DFDAC8] shadow-xs space-y-3">
            <div className="w-12 h-12 bg-[#EFF4F0] text-[#3E6144] rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#243728]">Kỹ Thuật Viên Đào Tạo Sâu</h3>
            <p className="text-xs text-[#5D7060] leading-relaxed">
              Đội ngũ trị liệu viên tốt nghiệp y học cổ truyền, am hiểu tường tận hệ kinh lạc, huyệt đạo và lực tay.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-[#DFDAC8] shadow-xs space-y-3">
            <div className="w-12 h-12 bg-[#EFF4F0] text-[#3E6144] rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#243728]">Không Gian Riêng Tư Tối Đa</h3>
            <p className="text-xs text-[#5D7060] leading-relaxed">
              Phòng trị liệu cách âm tiêu chuẩn, ánh sáng vàng dịu mắt và âm thanh tiếng nước chảy róc rách an tĩnh.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-[#DFDAC8] shadow-xs space-y-3">
            <div className="w-12 h-12 bg-[#EFF4F0] text-[#3E6144] rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#243728]">Chính Sách Hoàn Hủy Rõ Ràng</h3>
            <p className="text-xs text-[#5D7060] leading-relaxed">
              Hủy lịch trước $\ge$ 24h hoàn 100% tiền cọc, đổi lịch linh hoạt, hoàn toàn minh bạch trên tài khoản.
            </p>
          </div>
        </div>
      </section>

      {/* 5. SERVICE EXPERIENCE PROCESS */}
      <section className="bg-[#EFECE0] py-16 border-y border-[#DCD6C4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-[#5C7E63]">
              Quy Trình Chuẩn Mực
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#243628]">
              5 Bước Trải Nghiệm Thư Giãn Tại An Nhiên
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                step: '01',
                title: 'Đón Tiếp & Thưởng Trà',
                desc: 'Nhân viên mời tách trà hoa sen ấm, lắng nghe tình trạng mỏi mệt hoặc nhu cầu làn da.'
              },
              {
                step: '02',
                title: 'Ngâm Chân Khai Kinh',
                desc: 'Ngâm bồn nước ấm ngải cứu và muối khoáng, kích hoạt các huyệt đạo dưới lòng bàn chân.'
              },
              {
                step: '03',
                title: 'Thực Hiện Liệu Trình',
                desc: 'Kỹ thuật viên thực hiện các thao tác massage, chườm đá nóng hoặc chăm sóc da chuyên sâu.'
              },
              {
                step: '04',
                title: 'Định Tâm Chuông Xoay',
                desc: 'Lắng nghe ngân vang của chuông xoay Tây Tạng giúp ổn định sóng não và tái tạo sinh khí.'
              },
              {
                step: '05',
                title: 'Chè Dưỡng Nhan & Chăm Sóc',
                desc: 'Thưởng thức bát chè tuyết yến ấm nóng và nhận hướng dẫn duy trì làn da khỏe tại nhà.'
              }
            ].map((p) => (
              <div key={p.step} className="p-5 bg-white/70 backdrop-blur-xs rounded-xl border border-[#D7D1BF] space-y-2">
                <div className="font-serif text-2xl font-bold text-[#4B6F52]">{p.step}</div>
                <div className="font-semibold text-sm text-[#273B2C]">{p.title}</div>
                <p className="text-xs text-[#5C705F] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PROMOTIONS TEASER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#2E4534] to-[#1E2E22] rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8 border border-[#435F4A]">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#BCE0C3] bg-white/10 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chương trình ưu đãi tháng</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
              Thử Vận May Cùng Vòng Quay An Nhiên & Nhận Mã Giảm Đến 15%
            </h2>
            <p className="text-sm text-[#CBD8CD] leading-relaxed">
              Mỗi thành viên đăng nhập đều có 1 lượt quay miễn phí mỗi ngày để nhận phiếu giảm giá cho dịch vụ và sản phẩm dưỡng da.
            </p>
            <div className="pt-2">
              <Link
                to="/promotions"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#EAE5D7] hover:bg-white text-[#223526] text-sm font-semibold rounded-xl shadow-md transition-all"
              >
                <span>Quay thưởng ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="bg-white/10 p-6 rounded-2xl border border-white/15 backdrop-blur-md max-w-sm w-full space-y-3">
            <div className="text-xs font-semibold text-[#BCE0C3] uppercase tracking-wide">Mã ưu đãi nổi bật:</div>
            <div className="p-3 bg-white/15 rounded-xl border border-white/20 flex items-center justify-between">
              <div>
                <div className="font-mono text-sm font-bold text-white tracking-wider">ANNHIEN10</div>
                <div className="text-[11px] text-[#CBD8CD]">Giảm 10% cho đơn từ 300.000đ</div>
              </div>
              <span className="text-[10px] bg-[#4E7656] text-white px-2 py-1 rounded font-medium">Toàn sàn</span>
            </div>
            <div className="p-3 bg-white/15 rounded-xl border border-white/20 flex items-center justify-between">
              <div>
                <div className="font-mono text-sm font-bold text-white tracking-wider">ANNHIEN15</div>
                <div className="text-[11px] text-[#CBD8CD]">Giảm 15% mỹ phẩm từ 500.000đ</div>
              </div>
              <span className="text-[10px] bg-[#4E7656] text-white px-2 py-1 rounded font-medium">Sản phẩm</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-[#5C7E63]">
              Cửa Hàng Mỹ Phẩm
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#233527]">
              Sản Phẩm Chăm Sóc Da Tại Nhà
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#3C5D43] hover:text-[#223626]"
          >
            <span>Khám phá toàn bộ cửa hàng</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow border border-[#E0DBCB] flex flex-col group"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-[#FBF9F4]">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[11px] font-semibold text-[#283C2D] px-2.5 py-1 rounded-md">
                  {product.categoryName}
                </div>
                {product.stock <= 5 && product.stock > 0 && (
                  <div className="absolute top-3 right-3 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    Chỉ còn {product.stock}
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="text-[11px] text-[#708474] font-medium">{product.volumeOrWeight}</div>
                  <h3 className="font-serif text-base font-bold text-[#243527] group-hover:text-[#3B5E41] transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-[#5D7060] line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#F0EBE0] flex items-center justify-between">
                  <div className="font-semibold text-base text-[#273B2C] tabular-nums">
                    {formatVND(product.price)}
                  </div>
                  <button
                    onClick={() => addToCart(product.id, 1)}
                    className="p-2.5 bg-[#425E47] hover:bg-[#344D39] text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 text-xs font-medium"
                    title="Thêm vào giỏ hàng"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Mua ngay</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. SAMPLE TESTIMONIALS */}
      <section className="bg-[#F3F0E6] py-16 border-y border-[#E2DDCB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-[#5C7E63]">
              Cảm Nhận Khách Hàng
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#233527]">
              Những Khoảnh Khắc An Yên Được Ghi Lại
            </h2>
            <div className="text-xs text-[#7B8F7F] italic">(Nội dung minh họa trải nghiệm người dùng đồ án)</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Chị Mai Phương',
                role: 'Nhân viên thiết kế đồ họa',
                rating: 5,
                comment: 'Cổ vai gáy của mình đau buốt do ngồi vẽ nhiều tiếng liên tục. Sau 1 buổi trị liệu đá nóng kết hợp bấm huyệt ở An Nhiên, các bó cơ giãn hẳn và đêm đó mình ngủ một mạch đến sáng.'
              },
              {
                name: 'Anh Hoàng Dũng',
                role: 'Quản lý kinh doanh',
                rating: 5,
                comment: 'Rất ấn tượng với quy trình đặt lịch trực tuyến và chính sách hủy cọc minh bạch. Không gian sạch sẽ, mùi tinh dầu sả chanh tự nhiên không bị gắt như các spa thông thường.'
              },
              {
                name: 'Chị Bích Thảo',
                role: 'Giảng viên ngoại ngữ',
                rating: 5,
                comment: 'Gói chăm sóc da mặt thảo mộc chuyên sâu dùng mặt nạ ngọc trai cực kỳ mát và làm dịu da. Da mình dễ nổi mẩn đỏ nhưng khi làm ở đây hoàn toàn êm dịu.'
              }
            ].map((t, idx) => (
              <div key={idx} className="p-6 bg-white rounded-2xl border border-[#DFDAC8] shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-[#C9D6CB]" />
                  <p className="text-xs sm:text-sm text-[#4E6353] leading-relaxed">
                    "{t.comment}"
                  </p>
                </div>
                <div className="pt-3 border-t border-[#F2EEE4]">
                  <div className="font-serif font-bold text-sm text-[#273B2C]">{t.name}</div>
                  <div className="text-[11px] text-[#718575]">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#233527] text-balance">
          Dành Riêng Một Buổi Chiều Để Yêu Thương Chính Bạn
        </h2>
        <p className="text-sm sm:text-base text-[#546857] max-w-2xl mx-auto leading-relaxed">
          Hãy để An Nhiên chăm chút từng phút giây thư thái của bạn. Đặt hẹn ngay hôm nay để nhận tư vấn liệu trình phù hợp và ưu đãi đặt lịch trực tuyến.
        </p>
        <div>
          <Link
            to="/booking"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#425E47] hover:bg-[#344D39] text-white text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <Calendar className="w-5 h-5" />
            <span>Đặt lịch hẹn ngay hôm nay</span>
          </Link>
        </div>
      </section>
    </div>
  );
};
