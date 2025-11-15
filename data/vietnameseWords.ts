// Vietnamese words for civilians (all civilians get the same word)
// Only things/objects (nouns) - using proper Vietnamese classifiers
export interface WordPair {
  word1: string;
  word2: string;
  hint: string;
}

export const vietnameseWordPairs: WordPair[] = [
  // Đồ vật trong nhà (Household items)
  { word1: 'Cái bàn', word2: 'Cái ghế', hint: 'đồ vật' },
  { word1: 'Cái giường', word2: 'Cái gối', hint: 'đồ vật' },
  { word1: 'Cái chăn', word2: 'Cái gối', hint: 'đồ ngủ' },
  { word1: 'Cái tủ', word2: 'Cái kệ', hint: 'đồ vật' },
  { word1: 'Cái đèn', word2: 'Cái quạt', hint: 'thiết bị' },
  { word1: 'Cái điều hòa', word2: 'Cái quạt', hint: 'làm mát' },
  { word1: 'Cái tủ lạnh', word2: 'Cái lò vi sóng', hint: 'đồ bếp' },
  { word1: 'Cái nồi', word2: 'Cái chảo', hint: 'nấu ăn' },
  { word1: 'Cái gương', word2: 'Cái tranh', hint: 'treo tường' },
  { word1: 'Cái rèm', word2: 'Cái thảm', hint: 'trang trí' },
  
  // Đồ ăn uống (Food & Drink)
  { word1: 'Cơm', word2: 'Phở', hint: 'món ăn' },
  { word1: 'Bún', word2: 'Hủ tiếu', hint: 'món bún' },
  { word1: 'Bánh mì', word2: 'Bánh bao', hint: 'bánh' },
  { word1: 'Xôi', word2: 'Cháo', hint: 'món sáng' },
  { word1: 'Nem', word2: 'Chả giò', hint: 'món chiên' },
  { word1: 'Cà phê', word2: 'Trà', hint: 'đồ uống' },
  { word1: 'Bia', word2: 'Rượu', hint: 'có cồn' },
  { word1: 'Sữa', word2: 'Nước cam', hint: 'đồ uống' },
  
  // Trái cây (Fruits)
  { word1: 'Quả táo', word2: 'Quả lê', hint: 'trái cây' },
  { word1: 'Quả chuối', word2: 'Quả cam', hint: 'trái cây' },
  { word1: 'Quả dưa hấu', word2: 'Quả dưa chuột', hint: 'họ dưa' },
  { word1: 'Quả xoài', word2: 'Quả dứa', hint: 'trái nhiệt đới' },
  { word1: 'Quả nho', word2: 'Quả dâu', hint: 'quả nhỏ' },
  { word1: 'Quả đào', word2: 'Quả mận', hint: 'trái cây' },
  { word1: 'Quả nhãn', word2: 'Quả vải', hint: 'trái Việt Nam' },
  { word1: 'Quả mít', word2: 'Quả sầu riêng', hint: 'trái to' },
  { word1: 'Quả thanh long', word2: 'Quả chôm chôm', hint: 'trái nhiệt đới' },
  
  // Rau củ (Vegetables)
  { word1: 'Cà chua', word2: 'Cà rốt', hint: 'rau củ' },
  { word1: 'Khoai tây', word2: 'Khoai lang', hint: 'củ' },
  { word1: 'Bí đỏ', word2: 'Bí xanh', hint: 'họ bí' },
  { word1: 'Củ hành', word2: 'Tỏi', hint: 'gia vị' },
  { word1: 'Cải thảo', word2: 'Xà lách', hint: 'rau lá' },
  { word1: 'Rau muống', word2: 'Rau dền', hint: 'rau xanh' },
  
  // Động vật (Animals)
  { word1: 'Con chó', word2: 'Con mèo', hint: 'thú cưng' },
  { word1: 'Con gà', word2: 'Con vịt', hint: 'gia cầm' },
  { word1: 'Con lợn', word2: 'Con bò', hint: 'gia súc' },
  { word1: 'Con trâu', word2: 'Con bò', hint: 'gia súc' },
  { word1: 'Con ngựa', word2: 'Con lạc đà', hint: 'động vật lớn' },
  { word1: 'Con thỏ', word2: 'Con chuột', hint: 'động vật nhỏ' },
  { word1: 'Con hổ', word2: 'Con sư tử', hint: 'mãnh thú' },
  { word1: 'Con voi', word2: 'Con tê giác', hint: 'động vật to' },
  { word1: 'Con khỉ', word2: 'Con gấu', hint: 'động vật rừng' },
  { word1: 'Con sói', word2: 'Con cáo', hint: 'động vật hoang dã' },
  { word1: 'Con hươu', word2: 'Con nai', hint: 'có sừng' },
  { word1: 'Con dê', word2: 'Con cừu', hint: 'gia súc nhỏ' },
  { word1: 'Con cá heo', word2: 'Con cá mập', hint: 'động vật biển' },
  { word1: 'Con bạch tuộc', word2: 'Con mực', hint: 'động vật biển' },
  { word1: 'Con cua', word2: 'Con tôm', hint: 'hải sản' },
  { word1: 'Con ốc', word2: 'Con sò', hint: 'có vỏ' },
  { word1: 'Con cá ngừ', word2: 'Con cá hồi', hint: 'cá biển' },
  { word1: 'Con cá sấu', word2: 'Con rùa', hint: 'bò sát' },
  { word1: 'Con ếch', word2: 'Con nhái', hint: 'lưỡng cư' },
  
  // Côn trùng (Insects)
  { word1: 'Con bướm', word2: 'Con chuồn chuồn', hint: 'có cánh đẹp' },
  { word1: 'Con ong', word2: 'Con kiến', hint: 'côn trùng' },
  { word1: 'Con muỗi', word2: 'Con ruồi', hint: 'côn trùng bay' },
  { word1: 'Con nhện', word2: 'Con bọ cạp', hint: 'có nọc độc' },
  { word1: 'Con dế', word2: 'Con châu chấu', hint: 'côn trùng nhảy' },
  
  // Phương tiện (Vehicles)
  { word1: 'Xe máy', word2: 'Xe đạp', hint: 'phương tiện' },
  { word1: 'Xe hơi', word2: 'Xe buýt', hint: 'ô tô' },
  { word1: 'Máy bay', word2: 'Trực thăng', hint: 'bay' },
  { word1: 'Tàu hỏa', word2: 'Tàu thủy', hint: 'tàu' },
  { word1: 'Thuyền', word2: 'Canô', hint: 'đi nước' },
  
  // Quần áo (Clothes & Accessories)
  { word1: 'Áo', word2: 'Quần', hint: 'quần áo' },
  { word1: 'Váy', word2: 'Đầm', hint: 'nữ' },
  { word1: 'Áo khoác', word2: 'Áo len', hint: 'mặc ngoài' },
  { word1: 'Giày', word2: 'Dép', hint: 'đi chân' },
  { word1: 'Mũ', word2: 'Nón', hint: 'đội đầu' },
  { word1: 'Túi xách', word2: 'Ba lô', hint: 'đựng đồ' },
  { word1: 'Khuyên tai', word2: 'Vòng cổ', hint: 'trang sức' },
  
  // Thiết bị điện tử (Electronics)
  { word1: 'Điện thoại', word2: 'Máy tính bảng', hint: 'thiết bị' },
  { word1: 'Máy tính', word2: 'Laptop', hint: 'máy tính' },
  { word1: 'Tivi', word2: 'Radio', hint: 'nghe xem' },
  { word1: 'Loa', word2: 'Tai nghe', hint: 'âm thanh' },
  { word1: 'Camera', word2: 'Máy ảnh', hint: 'chụp ảnh' },
  { word1: 'Bàn phím', word2: 'Chuột', hint: 'thiết bị máy tính' },
  
  // Đồ dùng học tập (School supplies)
  { word1: 'Sách', word2: 'Vở', hint: 'học tập' },
  { word1: 'Bút chì', word2: 'Bút bi', hint: 'viết' },
  { word1: 'Thước', word2: 'Kéo', hint: 'dụng cụ học tập' },
  { word1: 'Tẩy', word2: 'Gọt bút chì', hint: 'dụng cụ' },
  { word1: 'Bảng', word2: 'Phấn', hint: 'lớp học' },
  
  // Bộ phận cơ thể (Body parts)
  { word1: 'Mắt', word2: 'Tai', hint: 'giác quan' },
  { word1: 'Mũi', word2: 'Miệng', hint: 'trên mặt' },
  { word1: 'Tay', word2: 'Chân', hint: 'chi' },
  { word1: 'Ngón tay', word2: 'Ngón chân', hint: 'ngón' },
  { word1: 'Vai', word2: 'Cổ', hint: 'bộ phận cơ thể' },
  { word1: 'Tim', word2: 'Phổi', hint: 'nội tạng' },
  
  // Địa điểm (Places)
  { word1: 'Nhà', word2: 'Khách sạn', hint: 'nơi ở' },
  { word1: 'Trường học', word2: 'Thư viện', hint: 'học tập' },
  { word1: 'Bệnh viện', word2: 'Nhà thuốc', hint: 'y tế' },
  { word1: 'Nhà hàng', word2: 'Quán cà phê', hint: 'ăn uống' },
  { word1: 'Công viên', word2: 'Sân vận động', hint: 'giải trí' },
  { word1: 'Rạp chiếu phim', word2: 'Bảo tàng', hint: 'văn hóa' },
  { word1: 'Chợ', word2: 'Siêu thị', hint: 'mua sắm' },
  { word1: 'Ngân hàng', word2: 'Bưu điện', hint: 'dịch vụ' },
  { word1: 'Sân bay', word2: 'Ga tàu', hint: 'giao thông' },
  { word1: 'Bãi biển', word2: 'Núi', hint: 'thiên nhiên' },
  { word1: 'Sông', word2: 'Hồ', hint: 'nước' },
  
  // Nghề nghiệp (Professions)
  { word1: 'Bác sĩ', word2: 'Y tá', hint: 'y tế' },
  { word1: 'Giáo viên', word2: 'Học sinh', hint: 'giáo dục' },
  { word1: 'Kỹ sư', word2: 'Lập trình viên', hint: 'kỹ thuật' },
  { word1: 'Đầu bếp', word2: 'Phục vụ', hint: 'nhà hàng' },
  { word1: 'Phi công', word2: 'Lái xe', hint: 'lái' },
  { word1: 'Cảnh sát', word2: 'Lính cứu hỏa', hint: 'an ninh' },
  { word1: 'Thợ xây', word2: 'Thợ điện', hint: 'thợ' },
  
  // Màu sắc (Colors)
  { word1: 'Màu đỏ', word2: 'Màu xanh', hint: 'màu sắc' },
  { word1: 'Màu vàng', word2: 'Màu cam', hint: 'màu ấm' },
  { word1: 'Màu trắng', word2: 'Màu đen', hint: 'màu cơ bản' },
  { word1: 'Màu hồng', word2: 'Màu tím', hint: 'màu sắc' },
  { word1: 'Màu xanh lá', word2: 'Màu xanh dương', hint: 'màu xanh' },
  
  // Thời tiết & Thiên nhiên (Weather & Nature)
  { word1: 'Mặt trời', word2: 'Mặt trăng', hint: 'thiên thể' },
  { word1: 'Mây', word2: 'Mưa', hint: 'thời tiết' },
  { word1: 'Tuyết', word2: 'Gió', hint: 'thời tiết' },
  { word1: 'Sấm', word2: 'Chớp', hint: 'dông' },
  { word1: 'Hoa', word2: 'Cây', hint: 'thực vật' },
  { word1: 'Lá', word2: 'Cành', hint: 'phần cây' },
  { word1: 'Đá', word2: 'Cát', hint: 'vật liệu' },
  { word1: 'Nước', word2: 'Lửa', hint: 'nguyên tố' },
  
  // Thể thao (Sports)
  { word1: 'Bóng đá', word2: 'Bóng rổ', hint: 'thể thao' },
  { word1: 'Bóng chuyền', word2: 'Cầu lông', hint: 'thể thao' },
  { word1: 'Bơi lội', word2: 'Chạy bộ', hint: 'thể thao' },
  { word1: 'Cờ vua', word2: 'Cờ tướng', hint: 'trò chơi' },
  
  // Âm nhạc (Music)
  { word1: 'Đàn piano', word2: 'Đàn guitar', hint: 'nhạc cụ' },
  { word1: 'Trống', word2: 'Sáo', hint: 'nhạc cụ' },
  { word1: 'Nhạc', word2: 'Bài hát', hint: 'âm nhạc' },
  
  // Khác (Others)
  { word1: 'Vàng', word2: 'Bạc', hint: 'kim loại quý' },
  { word1: 'Giấy', word2: 'Bút', hint: 'văn phòng phẩm' },
  { word1: 'Ảnh', word2: 'Video', hint: 'hình ảnh' },
  { word1: 'Búp bê', word2: 'Robot', hint: 'đồ chơi' },
];

// Imposter word (all imposters get this word when Spy is disabled)
export const IMPOSTER_WORD = 'Kẻ giả mạo'

// Function to get a random word pair
export function getRandomWordPair(): WordPair {
  const randomIndex = Math.floor(Math.random() * vietnameseWordPairs.length)
  return vietnameseWordPairs[randomIndex]
}

// Function to get a random civilian word (for backward compatibility when Spy is disabled)
export function getRandomCivilianWord(): string {
  const wordPair = getRandomWordPair()
  // Randomly choose word1 or word2 for civilians
  return Math.random() < 0.5 ? wordPair.word1 : wordPair.word2
}
