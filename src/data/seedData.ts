import {
  User,
  ServiceItem,
  ProductItem,
  Booking,
  Order,
  Coupon,
  ContactMessage,
  SpaSettings
} from '../types';
import { IMAGES } from '../assets/images';

export const SEED_USERS: User[] = [
  {
    id: 'USR-CUST-01',
    name: 'Nguyễn Thu Trang',
    email: 'khachhang@gmail.com',
    phone: '0912345678',
    role: 'customer',
    createdAt: '2026-02-15T10:30:00Z',
    status: 'active'
  },
  {
    id: 'USR-CUST-02',
    name: 'Trần Lan Anh',
    email: 'lananh@gmail.com',
    phone: '0987654321',
    role: 'customer',
    createdAt: '2026-03-01T14:20:00Z',
    status: 'active'
  }
];

export const SEED_SERVICES: ServiceItem[] = [
  {
    id: 'SRV-01',
    name: 'Chăm Sóc Da Mặt Thảo Mộc Chuyên Sâu',
    category: 'facial',
    categoryName: 'Chăm sóc da mặt',
    description: 'Làm sạch sâu đa tầng, tẩy da chết dịu nhẹ và cung cấp dưỡng chất từ thảo mộc thiên nhiên giúp da sáng hồng căng mịn.',
    fullDescription: 'Liệu trình chăm sóc da mặt chuyên sâu kết hợp phương pháp xông hơi thảo dược cung đình, hút dầu bã nhờn dịu êm, massage kích hoạt lưu thông máu và đắp mặt nạ ngọc trai thiên nhiên. Phù hợp cho mọi loại da, đặc biệt là da xỉn màu, mệt mỏi.',
    price: 450000,
    durationMinutes: 75,
    imageUrl: IMAGES.serviceFacialTreatment,
    steps: [
      'Tẩy trang sinh học & Rửa mặt tạo bọt thảo mộc',
      'Tẩy tế bào chết enzyme hoa quả dịu nhẹ',
      'Xông hơi tinh dầu tràm sả & Hút dầu mụn cám chân không',
      'Massage bấm huyệt nâng cơ mặt bằng tinh dầu jojoba',
      'Đắp mặt nạ ngọc trai thảo dược dưỡng ẩm sâu',
      'Điện di ion lạnh khóa ẩm và thoa kem chống nắng bảo vệ'
    ],
    benefits: [
      'Loại bỏ bụi bẩn và bã nhờn sâu trong lỗ chân lông',
      'Phục hồi độ ẩm cân bằng tự nhiên cho làn da',
      'Tăng sinh tuần hoàn máu, giúp da hồng hào rạng rỡ',
      'Thư giãn cơ mặt, giảm nếp nhăn li ti'
    ],
    notes: 'Không trang điểm đậm trong 6 giờ sau khi thực hiện liệu trình để dưỡng chất thẩm thấu tối đa.',
    status: 'active'
  },
  {
    id: 'SRV-02',
    name: 'Massage Đá Nóng Himalaya Trị Liệu Thư Giãn',
    category: 'massage',
    categoryName: 'Massage thư giãn',
    description: 'Sử dụng các phiến đá núi lửa basalt giữ nhiệt kết hợp muối khoáng hồng Himalaya giúp đả thông kinh lạc và giảm đau mỏi.',
    fullDescription: 'Liệu pháp ứng dụng nhiệt năng từ đá nham thạch tự nhiên và muối khoáng cổ Himalaya tác động lên các luân xa dọc sống lưng. Tinh dầu oải hương cùng bàn tay kỹ thuật viên điêu luyện giúp xua tan áp lực thần kinh và kích thích giấc ngủ sâu.',
    price: 550000,
    durationMinutes: 90,
    imageUrl: IMAGES.serviceMassageTherapy,
    steps: [
      'Ngâm chân thảo dược nước ấm với gừng tươi và muối khoáng',
      'Khởi động ấn huyệt khô toàn thân khai thông kinh mạch',
      'Thoa tinh dầu thảo mộc ấm & Massage miết cơ sâu',
      'Chườm và trượt đá nóng basalt trên các vùng lưng, vai gáy',
      'Xoa bóp giảm căng thẳng vùng đầu, cổ và bắp chân',
      'Lau ấm khăn thảo dược và thưởng thức trà hoa cúc mật ong'
    ],
    benefits: [
      'Giải tỏa tình trạng căng cứng cơ bắp và đau mỏi vai gáy',
      'Kích thích lưu thông máu và thải độc cơ thể',
      'Cải thiện chất lượng giấc ngủ rõ rệt',
      'Cân bằng năng lượng tinh thần, giảm stress'
    ],
    notes: 'Báo trước với kỹ thuật viên nếu quý khách đang mang thai hoặc có tiền sử tim mạch/huyết áp cao.',
    status: 'active'
  },
  {
    id: 'SRV-03',
    name: 'Tẩy Tế Bào Chết Toàn Thân Muối Hồng & Sữa Non',
    category: 'body',
    categoryName: 'Chăm sóc cơ thể',
    description: 'Tẩy sạch lớp sừng già cỗi, nuôi dưỡng làn da mịn màng mượt mà với tinh thể muối hồng và sữa non cô đặc nguyên chất.',
    fullDescription: 'Liệu trình tái tạo bề mặt da body nhẹ nhàng mà hiệu quả. Các hạt muối hồng Himalaya xay mịn kết hợp với tinh dầu hạnh nhân và sữa non giúp loại bỏ hoàn toàn các tế bào chết sần sùi ở khuỷu tay, đầu gối, lưng, mang lại làn da trắng sáng mềm mượt.',
    price: 420000,
    durationMinutes: 60,
    imageUrl: IMAGES.serviceBodyScrub,
    steps: [
      'Tắm tráng ấm kích nở lỗ chân lông',
      'Thoa hỗn hợp muối khoáng Himalaya kết hợp sữa non toàn thân',
      'Massage xoa tròn nhẹ nhàng lấy đi lớp tế bào sần sùi',
      'Ủ ấm thư giãn trong 15 phút với màng sinh học thảo mộc',
      'Tắm sạch dưới vòi sen mưa hoa sen ấm',
      'Thoa kem dưỡng ẩm body chiết xuất bơ hạt mỡ hữu cơ'
    ],
    benefits: [
      'Làm sáng đều màu da body, giảm viêm lỗ chân lông',
      'Cung cấp độ ẩm mịn màng tức thì cho làn da',
      'Hỗ trợ thẩm thấu dưỡng chất dưỡng thể gấp 3 lần'
    ],
    notes: 'Tránh tắm nước quá nóng trong vòng 24 giờ sau liệu trình.',
    status: 'active'
  },
  {
    id: 'SRV-04',
    name: 'Cấy Tinh Chất Hoa Hồng Hữu Cơ Cấp Ẩm Glowing',
    category: 'skincare_treatment',
    categoryName: 'Liệu trình dưỡng da',
    description: 'Liệu pháp đưa nano tinh chất hoa hồng hữu cơ và Hyaluronic Acid đa phân tử vào tầng biểu bì, tái sinh làn da căng bóng ngậm nước.',
    fullDescription: 'Công nghệ điện di nano không xâm lấn đưa trực tiếp dưỡng chất hoa hồng Damask hữu cơ và HA đa tầng sâu vào hạ bì, giúp giải quyết triệt để tình trạng da khô ráp, bong tróc hoặc đổ dầu do thiếu nước.',
    price: 680000,
    durationMinutes: 80,
    imageUrl: IMAGES.serviceFacialTreatment,
    steps: [
      'Làm sạch sâu 3 bước và tẩy da chết sinh học',
      'Xông hơi cấp ẩm với sương hoa hồng hữu cơ',
      'Điện di lạnh tinh chất hoa hồng Damask và HA 3 tầng',
      'Đắp mặt nạ sinh học thạch dừa lên men tự nhiên',
      'Chiếu ánh sáng sinh học vàng kích thích collagen',
      'Khóa ẩm bằng tinh dầu squalane thực vật'
    ],
    benefits: [
      'Căng bóng mịn màng, ngậm nước suốt 72 giờ',
      'Thu nhỏ lỗ chân lông và làm dịu kích ứng',
      'Tăng độ đàn hồi, ngăn ngừa lão hóa sớm'
    ],
    notes: 'Uống nhiều nước ấm sau liệu trình để tối ưu hiệu quả cấp ẩm.',
    status: 'active'
  },
  {
    id: 'SRV-05',
    name: 'Trị Liệu Cổ Vai Gáy & Đả Thông Kinh Lạc Đông Y',
    category: 'massage',
    categoryName: 'Massage thư giãn',
    description: 'Liệu trình đặc trị hội chứng mỏi vai gáy cho dân văn phòng bằng kỹ thuật ấn huyệt sâu kết hợp rượu thuốc cổ truyền.',
    fullDescription: 'Phương pháp xoa bóp trị liệu chuyên sâu kết hợp bấm các huyệt Phong Trì, Kiên Tỉnh, Đại Chùy kết hợp đắp cao thảo dược giữ ấm vùng gáy lưng. Giúp đánh tan các cục u xơ cơ bắp, hỗ trợ giảm hẳn chứng đau đầu hoa mắt do thiếu máu não.',
    price: 390000,
    durationMinutes: 60,
    imageUrl: IMAGES.serviceMassageTherapy,
    steps: [
      'Thăm khám tình trạng co cứng cơ vùng vai gáy',
      'Đắp túi thảo dược ngải cứu nóng vùng gáy',
      'Xoa bóp bấm huyệt thông kinh lạc vai gáy lưng trên',
      'Cạo gió ngọc bích hoặc giác hơi chân không (tùy chọn)',
      'Thoa cao thảo mộc gừng quế ấm nóng',
      'Hướng dẫn các động tác kéo giãn cột sống cổ tại nhà'
    ],
    benefits: [
      'Giảm đau nhức mỏi cổ vai gáy tức thì',
      'Tăng cường tuần hoàn máu lên não, giảm đau đầu chóng mặt',
      'Giải tỏa co rút các dải cơ bắp do ngồi máy tính lâu'
    ],
    notes: 'Khách hàng nên giữ ấm vùng cổ sau khi làm liệu trình.',
    status: 'active'
  },
  {
    id: 'SRV-06',
    name: 'Thanh Lọc Da Mặt Than Hoạt Tính & Oxy Tươi Detox',
    category: 'facial',
    categoryName: 'Chăm sóc da mặt',
    description: 'Thanh lọc độc tố kim loại nặng, khói bụi đô thị bằng mặt nạ than hoạt tính và phun oxy tươi áp lực cao tinh khiết 98%.',
    fullDescription: 'Làn da sống giữa môi trường khói bụi đô thị dễ tích tụ độc tố và bít tắc. Liệu trình kết hợp than tre hoạt tính hữu cơ và công nghệ oxy jet thổi bay bụi bẩn vi mô, kích hoạt hô hấp tế bào da khỏe mạnh.',
    price: 490000,
    durationMinutes: 70,
    imageUrl: IMAGES.serviceFacialTreatment,
    steps: [
      'Tẩy trang và rửa mặt bằng gel tràm trà tạo bọt mịn',
      'Tẩy da chết enzym bí ngô sinh học',
      'Hút chân không bã nhờn và sợi bã nhờn cánh mũi',
      'Đắp mặt nạ than tre hoạt tính hút chì và độc tố',
      'Phun oxy tươi tinh khiết áp suất thẩm thấu',
      'Thoa kem dưỡng dịu da chiết xuất rau má'
    ],
    benefits: [
      'Thải độc tố, làm sạch thông thoáng từng lỗ chân lông',
      'Ngăn ngừa mụn ẩn, mụn đầu đen tái phát',
      'Cung cấp oxy tươi cho tế bào tái sinh rạng ngời'
    ],
    notes: 'Thích hợp cho cả nam và nữ tiếp xúc thường xuyên với bụi bẩn hoặc màn hình máy tính.',
    status: 'active'
  },
  {
    id: 'SRV-07',
    name: 'Liệu Trình Ủ Trắng Toàn Thân Tinh Chất Ngọc Trai & Sữa Dê',
    category: 'intensive',
    categoryName: 'Chăm sóc chuyên sâu',
    description: 'Ủ dưỡng toàn thân trong lồng ánh sáng hồng ngoại cùng bột ngọc trai Phú Quốc và sữa dê tươi giàu vitamin A, E.',
    fullDescription: 'Liệu pháp dưỡng trắng body tự nhiên không lột tẩy. Dưỡng chất từ ngọc trai tự nhiên kết hợp sữa dê tươi nguyên chất thẩm thấu sâu nhờ nhiệt lượng máy phi thuyền quang phổ, tái tạo sắc tố da đều màu, bật tông an toàn.',
    price: 850000,
    durationMinutes: 90,
    imageUrl: IMAGES.serviceBodyScrub,
    steps: [
      'Tẩy tế bào chết toàn thân với cám gạo sữa non',
      'Thoa hỗn hợp ủ bột ngọc trai xay mịn và sữa dê tươi',
      'Nằm lồng ủ ánh sáng sinh học hồng ngoại 25 phút',
      'Tắm tráng sạch bằng sữa tắm thảo mộc',
      'Thoa kem dưỡng khóa trắng chiết xuất cam thảo hữu cơ'
    ],
    benefits: [
      'Bật tông da tự nhiên, làm mờ thâm sạm các vùng da tối',
      'Nuôi dưỡng làn da căng mướt, đàn hồi và mọng nước',
      'Không gây bào mòn hay châm chích khó chịu'
    ],
    notes: 'Cần thoa kem chống nắng toàn thân và che chắn khi ra nắng sau liệu trình.',
    status: 'active'
  },
  {
    id: 'SRV-08',
    name: 'Trị Liệu Thư Giãn Chuông Xoay Tây Tạng & Thảo Dược',
    category: 'massage',
    categoryName: 'Massage thư giãn',
    description: 'Phương pháp trị liệu bằng sóng âm chuông xoay kết hợp kỹ thuật vuốt nhẹ năng lượng, chữa lành sâu tâm trí và thân thể.',
    fullDescription: 'Tận hưởng âm vang trầm bổng từ bộ chuông xoay Tây Tạng hợp kim 7 kim loại. Tần số rung động vi mô của chuông lan tỏa qua từng tế bào nước trong cơ thể, giải phóng mọi bức bối lo âu và đưa tâm trí vào trạng thái an yên tuyệt đối.',
    price: 600000,
    durationMinutes: 75,
    imageUrl: IMAGES.heroSpaAmbiance,
    steps: [
      'Lắng đọng tâm trí với trà thảo mộc hoa sen',
      'Khởi chuông định tâm 3 hồi',
      'Đặt chuông xoay lên các luân xa lưng và rung chuông truyền sóng âm',
      'Massage nhẹ nhàng đầu, trán với tinh dầu trầm hương',
      'Hít thở phục hồi năng lượng và kết thúc nghi thức'
    ],
    benefits: [
      'Giảm bớt suy nghĩ căng thẳng, lo âu mạn tính',
      'Đưa sóng não về trạng thái Alpha và Theta sâu lắng',
      'Phục hồi năng lượng tinh thần tích cực và sáng tạo'
    ],
    notes: 'Không sử dụng điện thoại trước và trong buổi trị liệu để đạt hiệu quả an trú tốt nhất.',
    status: 'active'
  }
];

export const SEED_PRODUCTS: ProductItem[] = [
  {
    id: 'PRD-01',
    code: 'AN-SRM-01',
    name: 'Tinh Chất Phục Hồi Da An Nhiên Herbal Rejuvenation Serum',
    category: 'serum',
    categoryName: 'Serum & Tinh chất',
    description: 'Chiết xuất từ hoa cúc la mã, rau má hữu cơ và Hyaluronic Acid giúp làm dịu, phục hồi hàng rào ẩm tự nhiên của da.',
    fullDescription: 'Sản phẩm serum phục hồi chuyên sâu chứa 85% chiết xuất thảo mộc hữu cơ. Kết cấu lỏng nhẹ, thẩm thấu nhanh trong 10 giây mà không bết dính. Hỗ trợ phục hồi da sau nặn mụn, treatment hoặc da nhạy cảm dễ kích ứng.',
    price: 380000,
    stock: 24,
    imageUrl: IMAGES.productHerbalSerum,
    volumeOrWeight: '30ml',
    status: 'active'
  },
  {
    id: 'PRD-02',
    code: 'AN-CRM-02',
    name: 'Kem Dưỡng Ẩm Chuyên Sâu Hoa Cúc Calendula Organic',
    category: 'cream',
    categoryName: 'Kem dưỡng ẩm',
    description: 'Cấp ẩm sâu 48h, làm mềm da khô nẻ và bảo vệ làn da khỏi tác động của không khí điều hòa và thời tiết khô hanh.',
    fullDescription: 'Kem dưỡng ẩm dịu nhẹ bào chế từ cánh hoa cúc xu xi (Calendula) thu hoạch thủ công kết hợp bơ hạt mỡ organic. Cung cấp độ ẩm dồi dào, tái tạo màng lipid bảo vệ da mà không gây bít tắc lỗ chân lông.',
    price: 320000,
    stock: 18,
    imageUrl: IMAGES.productHerbalSerum,
    volumeOrWeight: '50ml',
    status: 'active'
  },
  {
    id: 'PRD-03',
    code: 'AN-CLN-03',
    name: 'Sữa Rửa Mặt Tạo Bọt Dịu Nhẹ Tràm Trà & Trà Xanh',
    category: 'cleanser',
    categoryName: 'Sữa rửa mặt',
    description: 'Độ pH 5.5 cân bằng sinh học, kháng khuẩn ngừa mụn hiệu quả và giữ nguyên độ ẩm tự nhiên cho làn da.',
    fullDescription: 'Dạng gel tạo bọt mịn tơi như bông gòn, rửa sạch bụi mịn PM2.5 và dầu thừa mà không làm da căng rát. Chiết xuất tinh dầu tràm trà Úc kiểm soát mụn viêm kết hợp polyphenol trong trà xanh chống oxy hóa mạnh mẽ.',
    price: 240000,
    stock: 35,
    imageUrl: IMAGES.productHerbalSerum,
    volumeOrWeight: '150ml',
    status: 'active'
  },
  {
    id: 'PRD-04',
    code: 'AN-MSK-04',
    name: 'Mặt Nạ Bùn Khoáng Núi Lửa & Tràm Trà Thanh Lọc Lỗ Chân Lông',
    category: 'mask',
    categoryName: 'Mặt nạ dưỡng da',
    description: 'Hút sạch bã nhờn cứng đầu, làm dịu các nốt mụn sưng đỏ và se khít lỗ chân lông chỉ sau 15 phút đắp.',
    fullDescription: 'Hỗn hợp bùn khoáng thiên nhiên giàu nguyên tố vi lượng kết hợp với bột tràm trà và than tre hoạt tính. Có khả năng hấp phụ bã nhờn gấp 5 lần đất sét thông thường, mang lại cảm giác the mát sảng khoái.',
    price: 260000,
    stock: 15,
    imageUrl: IMAGES.productHerbalSerum,
    volumeOrWeight: '100g',
    status: 'active'
  },
  {
    id: 'PRD-05',
    code: 'AN-OIL-05',
    name: 'Tinh Dầu Massage Gừng Cổ Truyền & Sả Chanh Thư Giãn',
    category: 'essential_oil',
    categoryName: 'Tinh dầu trị liệu',
    description: 'Dầu massage nguyên chất từ gừng già và sả chanh, giúp làm ấm cơ thể, thông kinh lạc và giảm đau mỏi gân cốt.',
    fullDescription: 'Chiết xuất từ gừng củ già trồng tự nhiên hòa quyện với tinh dầu sả chanh thanh khiết trên nền dầu hạnh nhân ép lạnh. Mùi hương ấm áp giải tỏa mọi mệt mỏi, hỗ trợ kích thích lưu thông máu và ngủ ngon.',
    price: 210000,
    stock: 40,
    imageUrl: IMAGES.serviceBodyScrub,
    volumeOrWeight: '100ml',
    status: 'active'
  },
  {
    id: 'PRD-06',
    code: 'AN-MIS-06',
    name: 'Xịt Khoáng Tinh Khiết Nước Cất Hoa Hồng Damask',
    category: 'serum',
    categoryName: 'Serum & Tinh chất',
    description: 'Chưng cất lôi cuốn hơi nước 100% từ hoa hồng tươi Damask, cấp ẩm tức thì và cố định lớp trang điểm tự nhiên.',
    fullDescription: 'Nước cất hoa hồng hữu cơ tinh khiết không cồn, không hương liệu tổng hợp. Tia xịt siêu mịn bao phủ làn da như làn sương mỏng, làm dịu da cháy nắng và duy trì độ mềm mại suốt ngày dài năng động.',
    price: 195000,
    stock: 28,
    imageUrl: IMAGES.productHerbalSerum,
    volumeOrWeight: '120ml',
    status: 'active'
  },
  {
    id: 'PRD-07',
    code: 'AN-SUN-07',
    name: 'Kem Chống Nắng Vật Lý Thảo Mộc SPF50+ PA++++',
    category: 'cream',
    categoryName: 'Kem dưỡng ẩm',
    description: 'Chống tia UVA/UVB toàn diện, nâng tông nhẹ tự nhiên, không vón cục và kiểm soát dầu suốt 8 giờ.',
    fullDescription: 'Kem chống nắng thuần vật lý với Zinc Oxide siêu vi hạt, kết hợp chiết xuất rau má và trà xanh. Kháng nước tốt, tạo hiệu ứng da trắng hồng rạng rỡ không bóng nhờn.',
    price: 360000,
    stock: 22,
    imageUrl: IMAGES.productHerbalSerum,
    volumeOrWeight: '50ml',
    status: 'active'
  },
  {
    id: 'PRD-08',
    code: 'AN-SLT-08',
    name: 'Muối Ngâm Bồn Thảo Dược Cổ Truyền Ngải Cứu & Quế Chi',
    category: 'body',
    categoryName: 'Chăm sóc cơ thể',
    description: 'Muối khoáng biển thô kết hợp 7 vị thuốc bắc giúp xua tan hàn khí, hỗ trợ giấc ngủ sâu và làm ấm bàn chân.',
    fullDescription: 'Công thức ngâm bồn thư giãn chuẩn đông y với muối biển hầm, ngải cứu khô, quế chi, hoa hồi và tinh dầu tràm gió. Giúp thư giãn gân cốt, khử mùi hôi chân và mang lại trạng thái thư thái cho toàn thân.',
    price: 180000,
    stock: 30,
    imageUrl: IMAGES.serviceBodyScrub,
    volumeOrWeight: '350g',
    status: 'active'
  }
];

export const SEED_BOOKINGS: Booking[] = [
  {
    id: 'AN-BK-7319',
    userId: 'USR-CUST-01',
    customerName: 'Nguyễn Thu Trang',
    customerPhone: '0912345678',
    customerEmail: 'khachhang@gmail.com',
    serviceId: 'SRV-01',
    serviceName: 'Chăm Sóc Da Mặt Thảo Mộc Chuyên Sâu',
    servicePrice: 450000,
    date: '2026-10-25', // > 24 hours away
    timeSlot: '14:00',
    notes: 'Tôi có tiền sử da nhạy cảm nhẹ quanh khóe mũi.',
    totalAmount: 450000,
    depositAmount: 135000, // 30%
    remainingAmount: 315000,
    depositPaid: true,
    paymentStatus: 'deposit_paid',
    status: 'confirmed',
    createdAt: '2026-10-21T09:15:00Z',
    rescheduleHistory: []
  },
  {
    id: 'AN-BK-6821',
    userId: 'USR-CUST-02',
    customerName: 'Trần Lan Anh',
    customerPhone: '0987654321',
    customerEmail: 'lananh@gmail.com',
    serviceId: 'SRV-02',
    serviceName: 'Massage Đá Nóng Himalaya Trị Liệu Thư Giãn',
    servicePrice: 550000,
    date: '2026-10-22', // close by
    timeSlot: '16:30',
    notes: 'Muốn tập trung xoa bóp vùng thắt lưng và vai gáy.',
    totalAmount: 550000,
    depositAmount: 165000,
    remainingAmount: 385000,
    depositPaid: true,
    paymentStatus: 'deposit_paid',
    status: 'pending',
    createdAt: '2026-10-21T11:00:00Z'
  },
  {
    id: 'AN-BK-5192',
    userId: 'USR-CUST-01',
    customerName: 'Nguyễn Thu Trang',
    customerPhone: '0912345678',
    customerEmail: 'khachhang@gmail.com',
    serviceId: 'SRV-05',
    serviceName: 'Trị Liệu Cổ Vai Gáy & Đả Thông Kinh Lạc Đông Y',
    servicePrice: 390000,
    date: '2026-10-18', // Past
    timeSlot: '10:00',
    notes: 'Kỹ thuật viên phục vụ rất chu đáo.',
    totalAmount: 390000,
    depositAmount: 117000,
    remainingAmount: 273000,
    depositPaid: true,
    paymentStatus: 'deposit_paid',
    status: 'completed',
    createdAt: '2026-10-15T08:20:00Z'
  },
  {
    id: 'AN-BK-4081',
    userId: 'USR-CUST-02',
    customerName: 'Trần Lan Anh',
    customerPhone: '0987654321',
    customerEmail: 'lananh@gmail.com',
    serviceId: 'SRV-03',
    serviceName: 'Tẩy Tế Bào Chết Toàn Thân Muối Hồng & Sữa Non',
    servicePrice: 420000,
    date: '2026-10-19',
    timeSlot: '15:00',
    notes: 'Bận việc đột xuất nên đã hủy trước 3 ngày.',
    totalAmount: 420000,
    depositAmount: 126000,
    remainingAmount: 294000,
    depositPaid: true,
    paymentStatus: 'refunded_full',
    status: 'cancelled',
    cancelledAt: '2026-10-16T12:00:00Z',
    refundAmount: 126000,
    retainedAmount: 0,
    createdAt: '2026-10-14T10:00:00Z'
  }
];

export const SEED_ORDERS: Order[] = [
  {
    id: 'AN-ORD-2091',
    userId: 'USR-CUST-01',
    customerName: 'Nguyễn Thu Trang',
    customerPhone: '0912345678',
    customerEmail: 'khachhang@gmail.com',
    shippingAddress: 'Tòa Landmark 4, Vinhomes Central Park, Bình Thạnh, TP.HCM',
    items: [
      {
        productId: 'PRD-01',
        code: 'AN-SRM-01',
        name: 'Tinh Chất Phục Hồi Da An Nhiên Herbal Rejuvenation Serum',
        price: 380000,
        quantity: 1,
        imageUrl: IMAGES.productHerbalSerum
      },
      {
        productId: 'PRD-03',
        code: 'AN-CLN-03',
        name: 'Sữa Rửa Mặt Tạo Bọt Dịu Nhẹ Tràm Trà & Trà Xanh',
        price: 240000,
        quantity: 1,
        imageUrl: IMAGES.productHerbalSerum
      }
    ],
    subtotal: 620000,
    discountAmount: 62000,
    couponCode: 'ANNHIEN10',
    totalAmount: 558000,
    paymentMethod: 'card_simulation',
    paymentStatus: 'paid',
    status: 'shipping',
    createdAt: '2026-10-20T14:30:00Z',
    notes: 'Giao trong giờ hành chính giúp mình nhé.'
  },
  {
    id: 'AN-ORD-1845',
    userId: 'USR-CUST-02',
    customerName: 'Trần Lan Anh',
    customerPhone: '0987654321',
    customerEmail: 'lananh@gmail.com',
    shippingAddress: '45 Đường số 12, P. Thảo Điền, TP. Thủ Đức, TP.HCM',
    items: [
      {
        productId: 'PRD-05',
        code: 'AN-OIL-05',
        name: 'Tinh Dầu Massage Gừng Cổ Truyền & Sả Chanh Thư Giãn',
        price: 210000,
        quantity: 2,
        imageUrl: IMAGES.serviceBodyScrub
      }
    ],
    subtotal: 420000,
    discountAmount: 0,
    totalAmount: 420000,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    status: 'completed',
    createdAt: '2026-10-17T09:10:00Z'
  }
];

export const SEED_COUPONS: Coupon[] = [
  {
    id: 'CP-01',
    code: 'ANNHIEN10',
    description: 'Giảm 10% tổng hóa đơn cho khách hàng thành viên',
    discountType: 'percent',
    discountValue: 10,
    minOrderValue: 300000,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    usageLimit: 100,
    usedCount: 14,
    applicableTo: 'all',
    status: 'active'
  },
  {
    id: 'CP-02',
    code: 'ANNHIEN15',
    description: 'Giảm 15% khi mua mỹ phẩm dưỡng da chăm sóc',
    discountType: 'percent',
    discountValue: 15,
    minOrderValue: 500000,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    usageLimit: 50,
    usedCount: 8,
    applicableTo: 'products',
    status: 'active'
  },
  {
    id: 'CP-03',
    code: 'GIAM20K',
    description: 'Giảm ngay 20.000đ từ vòng quay may mắn may mắn',
    discountType: 'fixed',
    discountValue: 20000,
    minOrderValue: 200000,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    usageLimit: 200,
    usedCount: 31,
    applicableTo: 'all',
    status: 'active'
  },
  {
    id: 'CP-04',
    code: 'SPAHE2026',
    description: 'Ưu đãi hè - Giảm 50.000đ cho đơn từ 600.000đ',
    discountType: 'fixed',
    discountValue: 50000,
    minOrderValue: 600000,
    startDate: '2026-05-01',
    endDate: '2026-08-31',
    usageLimit: 50,
    usedCount: 50,
    applicableTo: 'all',
    status: 'inactive' // Expired / limit reached
  }
];

export const SEED_MESSAGES: ContactMessage[] = [
  {
    id: 'MSG-01',
    name: 'Võ Hoàng Yến',
    email: 'hoangyen.vo@gmail.com',
    phone: '0933112233',
    subject: 'Tư vấn gói trị liệu dành cho cô dâu trước ngày cưới',
    message: 'Chào An Nhiên, mình sắp cưới vào tháng tới và muốn đăng ký gói chăm sóc da mặt và ủ trắng ngọc trai toàn thân cho 2 người (mình và mẹ). Xin tư vấn liệu trình phù hợp.',
    createdAt: '2026-10-21T08:45:00Z',
    status: 'unread'
  },
  {
    id: 'MSG-02',
    name: 'Đặng Tuấn Kiệt',
    email: 'tuankiet@outlook.com',
    phone: '0977889900',
    subject: 'Đặt lịch massage đá nóng cho nhóm 3 người',
    message: 'Spa cho hỏi chủ nhật này lúc 15:00 có đủ 3 giường đơn cho nhóm bạn mình trải nghiệm dịch vụ massage đá nóng cùng lúc không ạ?',
    createdAt: '2026-10-20T16:20:00Z',
    status: 'read'
  }
];

export const SEED_SETTINGS: SpaSettings = {
  spaName: 'An Nhiên Spa',
  hotline: '0908 123 456',
  email: 'contact@annhienspa.vn',
  address: '124/8 Đường Thảo Điền, Phường Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh',
  openingHours: '09:00 - 20:30 (Tất cả các ngày trong tuần)',
  depositRate: 0.30, // 30% cọc
  footerBio: 'An Nhiên Spa - Nơi tìm về sự an yên nguyên bản, kết hợp tinh hoa thảo mộc Á Đông và kỹ thuật chăm sóc sức khỏe, sắc đẹp chuẩn mực.'
};
