// Vietnamese words for civilians (all civilians get the same word)
// Only things/objects (nouns) - using proper Vietnamese classifiers
export interface WordPair {
  word1: string;
  word2: string;
  hint: string;
}

export const vietnameseWordPairs: WordPair[] = [
  // Đồ vật trong nhà (Household items)
  { word1: 'Cái bàn', word2: 'Cái ghế', hint: 'Đồ vật' },
  { word1: 'Cái giường', word2: 'Cái gối', hint: 'Đồ vật' },
  { word1: 'Cái chăn', word2: 'Cái gối', hint: 'Đồ vật' },
  { word1: 'Cái tủ', word2: 'Cái kệ', hint: 'Đồ vật' },
  { word1: 'Cái đèn', word2: 'Cái quạt', hint: 'Đồ vật' },
  { word1: 'Cái điều hòa', word2: 'Cái quạt', hint: 'Đồ vật' },
  { word1: 'Cái tủ lạnh', word2: 'Cái lò vi sóng', hint: 'Đồ vật' },
  { word1: 'Cái nồi', word2: 'Cái chảo', hint: 'Đồ vật' },
  { word1: 'Cái gương', word2: 'Cái tranh', hint: 'Đồ vật' },
  { word1: 'Cái rèm', word2: 'Cái thảm', hint: 'Đồ vật' },
  { word1: 'Cái bát', word2: 'Cái đũa', hint: 'Đồ vật' },
  { word1: 'Cái cốc', word2: 'Cái chén', hint: 'Đồ vật' },
  { word1: 'Con dao', word2: 'Cái thớt', hint: 'Đồ vật' },
  { word1: 'Cái chổi', word2: 'Cái hót rác', hint: 'Đồ vật' },
  { word1: 'Xà bông', word2: 'Khăn mặt', hint: 'Đồ vật' },
  
  // Đồ ăn uống (Food & Drink)
  { word1: 'Cơm', word2: 'Phở', hint: 'Ăn uống' },
  { word1: 'Bún', word2: 'Hủ tiếu', hint: 'Ăn uống' },
  { word1: 'Bánh mì', word2: 'Bánh bao', hint: 'Ăn uống' },
  { word1: 'Xôi', word2: 'Cháo', hint: 'Ăn uống' },
  { word1: 'Nem', word2: 'Chả giò', hint: 'Ăn uống' },
  { word1: 'Cà phê', word2: 'Trà', hint: 'Ăn uống' },
  { word1: 'Bia', word2: 'Rượu', hint: 'Ăn uống' },
  { word1: 'Sữa', word2: 'Nước cam', hint: 'Ăn uống' },
  { word1: 'Bánh chưng', word2: 'Bánh tét', hint: 'Ăn uống' },
  { word1: 'Kem', word2: 'Sữa chua', hint: 'Ăn uống' },
  { word1: 'Kẹo', word2: 'Bánh quy', hint: 'Ăn uống' },
  { word1: 'Nước ngọt', word2: 'Nước suối', hint: 'Ăn uống' },
  
  // Trái cây (Fruits)
  { word1: 'Quả táo', word2: 'Quả lê', hint: 'Trái cây' },
  { word1: 'Quả chuối', word2: 'Quả cam', hint: 'Trái cây' },
  { word1: 'Quả dưa hấu', word2: 'Quả dưa chuột', hint: 'Trái cây' },
  { word1: 'Quả xoài', word2: 'Quả dứa', hint: 'Trái cây' },
  { word1: 'Quả nho', word2: 'Quả dâu', hint: 'Trái cây' },
  { word1: 'Quả đào', word2: 'Quả mận', hint: 'Trái cây' },
  { word1: 'Quả nhãn', word2: 'Quả vải', hint: 'Trái cây' },
  { word1: 'Quả mít', word2: 'Quả sầu riêng', hint: 'Trái cây' },
  { word1: 'Quả thanh long', word2: 'Quả chôm chôm', hint: 'Trái cây' },
  { word1: 'Quả bưởi', word2: 'Quả cam', hint: 'Trái cây' },
  { word1: 'Quả chanh', word2: 'Quả tắc', hint: 'Trái cây' },
  
  // Rau củ (Vegetables)
  { word1: 'Cà chua', word2: 'Cà rốt', hint: 'Rau củ' },
  { word1: 'Khoai tây', word2: 'Khoai lang', hint: 'Rau củ' },
  { word1: 'Bí đỏ', word2: 'Bí xanh', hint: 'Rau củ' },
  { word1: 'Củ hành', word2: 'Tỏi', hint: 'Rau củ' },
  { word1: 'Cải thảo', word2: 'Xà lách', hint: 'Rau củ' },
  { word1: 'Rau muống', word2: 'Rau dền', hint: 'Rau củ' },
  { word1: 'Su hào', word2: 'Súp lơ', hint: 'Rau củ' },
  { word1: 'Ớt', word2: 'Gừng', hint: 'Rau củ' },
  { word1: 'Đậu đũa', word2: 'Đậu cove', hint: 'Rau củ' },
  
  // Động vật (Animals)
  { word1: 'Con chó', word2: 'Con mèo', hint: 'Động vật' },
  { word1: 'Con gà', word2: 'Con vịt', hint: 'Động vật' },
  { word1: 'Con lợn', word2: 'Con bò', hint: 'Động vật' },
  { word1: 'Con trâu', word2: 'Con bò', hint: 'Động vật' },
  { word1: 'Con ngựa', word2: 'Con lạc đà', hint: 'Động vật' },
  { word1: 'Con thỏ', word2: 'Con chuột', hint: 'Động vật' },
  { word1: 'Con hổ', word2: 'Con sư tử', hint: 'Động vật' },
  { word1: 'Con voi', word2: 'Con tê giác', hint: 'Động vật' },
  { word1: 'Con khỉ', word2: 'Con gấu', hint: 'Động vật' },
  { word1: 'Con sói', word2: 'Con cáo', hint: 'Động vật' },
  { word1: 'Con hươu', word2: 'Con nai', hint: 'Động vật' },
  { word1: 'Con dê', word2: 'Con cừu', hint: 'Động vật' },
  { word1: 'Con cá heo', word2: 'Con cá mập', hint: 'Động vật' },
  { word1: 'Con bạch tuộc', word2: 'Con mực', hint: 'Động vật' },
  { word1: 'Con cua', word2: 'Con tôm', hint: 'Động vật' },
  { word1: 'Con ốc', word2: 'Con sò', hint: 'Động vật' },
  { word1: 'Con cá ngừ', word2: 'Con cá hồi', hint: 'Động vật' },
  { word1: 'Con cá sấu', word2: 'Con rùa', hint: 'Động vật' },
  { word1: 'Con ếch', word2: 'Con nhái', hint: 'Động vật' },
  { word1: 'Con chim', word2: 'Con cò', hint: 'Động vật' },
  { word1: 'Con rắn', word2: 'Con trăn', hint: 'Động vật' },
  { word1: 'Con sứa', word2: 'Con sao biển', hint: 'Động vật' },
  
  // Côn trùng (Insects)
  { word1: 'Con bướm', word2: 'Con chuồn chuồn', hint: 'Côn trùng' },
  { word1: 'Con ong', word2: 'Con kiến', hint: 'Côn trùng' },
  { word1: 'Con muỗi', word2: 'Con ruồi', hint: 'Côn trùng' },
  { word1: 'Con nhện', word2: 'Con bọ cạp', hint: 'Côn trùng' },
  { word1: 'Con dế', word2: 'Con châu chấu', hint: 'Côn trùng' },
  
  // Phương tiện (Vehicles)
  { word1: 'Xe máy', word2: 'Xe đạp', hint: 'Phương tiện' },
  { word1: 'Xe hơi', word2: 'Xe buýt', hint: 'Phương tiện' },
  { word1: 'Máy bay', word2: 'Trực thăng', hint: 'Phương tiện' },
  { word1: 'Tàu hỏa', word2: 'Tàu thủy', hint: 'Phương tiện' },
  { word1: 'Thuyền', word2: 'Canô', hint: 'Phương tiện' },
  { word1: 'Xe tải', word2: 'Xe container', hint: 'Phương tiện' },
  { word1: 'Xe cứu thương', word2: 'Xe cứu hỏa', hint: 'Phương tiện' },
  { word1: 'Xe xích lô', word2: 'Xe ba gác', hint: 'Phương tiện' },
  
  // Quần áo (Clothes & Accessories)
  { word1: 'Áo', word2: 'Quần', hint: 'Quần áo' },
  { word1: 'Váy', word2: 'Đầm', hint: 'Quần áo' },
  { word1: 'Áo khoác', word2: 'Áo len', hint: 'Quần áo' },
  { word1: 'Giày', word2: 'Dép', hint: 'Quần áo' },
  { word1: 'Mũ', word2: 'Nón', hint: 'Quần áo' },
  { word1: 'Túi xách', word2: 'Ba lô', hint: 'Quần áo' },
  { word1: 'Khuyên tai', word2: 'Vòng cổ', hint: 'Quần áo' },
  { word1: 'Đồng hồ', word2: 'Kính mắt', hint: 'Quần áo' },
  { word1: 'Găng tay', word2: 'Khăn quàng', hint: 'Quần áo' },
  { word1: 'Cà vạt', word2: 'Cái nơ', hint: 'Quần áo' },
  
  // Thiết bị điện tử (Electronics)
  { word1: 'Điện thoại', word2: 'Máy tính bảng', hint: 'Điện tử' },
  { word1: 'Máy tính', word2: 'Laptop', hint: 'Điện tử' },
  { word1: 'Tivi', word2: 'Radio', hint: 'Điện tử' },
  { word1: 'Loa', word2: 'Tai nghe', hint: 'Điện tử' },
  { word1: 'Camera', word2: 'Máy ảnh', hint: 'Điện tử' },
  { word1: 'Bàn phím', word2: 'Chuột', hint: 'Điện tử' },
  { word1: 'Pin', word2: 'Sạc', hint: 'Điện tử' },
  { word1: 'USB', word2: 'Ổ cứng', hint: 'Điện tử' },
  { word1: 'Ảnh', word2: 'Video', hint: 'Điện tử' },
  
  // Đồ dùng học tập (School supplies)
  { word1: 'Sách', word2: 'Vở', hint: 'Học tập' },
  { word1: 'Bút chì', word2: 'Bút bi', hint: 'Học tập' },
  { word1: 'Thước', word2: 'Kéo', hint: 'Học tập' },
  { word1: 'Tẩy', word2: 'Gọt bút chì', hint: 'Học tập' },
  { word1: 'Bảng', word2: 'Phấn', hint: 'Học tập' },
  { word1: 'Cặp sách', word2: 'Hộp bút', hint: 'Học tập' },
  { word1: 'Compa', word2: 'Êke', hint: 'Học tập' },
  { word1: 'Giấy', word2: 'Bút', hint: 'Học tập' },
  
  // Bộ phận cơ thể (Body parts)
  { word1: 'Mắt', word2: 'Tai', hint: 'Cơ thể' },
  { word1: 'Mũi', word2: 'Miệng', hint: 'Cơ thể' },
  { word1: 'Tay', word2: 'Chân', hint: 'Cơ thể' },
  { word1: 'Ngón tay', word2: 'Ngón chân', hint: 'Cơ thể' },
  { word1: 'Vai', word2: 'Cổ', hint: 'Cơ thể' },
  { word1: 'Tim', word2: 'Phổi', hint: 'Cơ thể' },
  { word1: 'Đầu', word2: 'Tóc', hint: 'Cơ thể' },
  { word1: 'Dạ dày', word2: 'Gan', hint: 'Cơ thể' },
  { word1: 'Khuỷu tay', word2: 'Đầu gối', hint: 'Cơ thể' },
  
  // Địa điểm (Places)
  { word1: 'Nhà', word2: 'Khách sạn', hint: 'Địa điểm' },
  { word1: 'Trường học', word2: 'Thư viện', hint: 'Địa điểm' },
  { word1: 'Bệnh viện', word2: 'Nhà thuốc', hint: 'Địa điểm' },
  { word1: 'Nhà hàng', word2: 'Quán cà phê', hint: 'Địa điểm' },
  { word1: 'Công viên', word2: 'Sân vận động', hint: 'Địa điểm' },
  { word1: 'Rạp chiếu phim', word2: 'Bảo tàng', hint: 'Địa điểm' },
  { word1: 'Chợ', word2: 'Siêu thị', hint: 'Địa điểm' },
  { word1: 'Ngân hàng', word2: 'Bưu điện', hint: 'Địa điểm' },
  { word1: 'Sân bay', word2: 'Ga tàu', hint: 'Địa điểm' },
  { word1: 'Bãi biển', word2: 'Núi', hint: 'Địa điểm' },
  { word1: 'Sông', word2: 'Hồ', hint: 'Địa điểm' },
  { word1: 'Nhà thờ', word2: 'Ngôi chùa', hint: 'Địa điểm' },
  { word1: 'Đồng ruộng', word2: 'Cánh đồng', hint: 'Địa điểm' },
  
  // Nghề nghiệp (Professions)
  { word1: 'Bác sĩ', word2: 'Y tá', hint: 'Nghề nghiệp' },
  { word1: 'Giáo viên', word2: 'Học sinh', hint: 'Nghề nghiệp' },
  { word1: 'Kỹ sư', word2: 'Lập trình viên', hint: 'Nghề nghiệp' },
  { word1: 'Đầu bếp', word2: 'Phục vụ', hint: 'Nghề nghiệp' },
  { word1: 'Phi công', word2: 'Lái xe', hint: 'Nghề nghiệp' },
  { word1: 'Cảnh sát', word2: 'Lính cứu hỏa', hint: 'Nghề nghiệp' },
  { word1: 'Thợ xây', word2: 'Thợ điện', hint: 'Nghề nghiệp' },
  { word1: 'Ca sĩ', word2: 'Diễn viên', hint: 'Nghề nghiệp' },
  { word1: 'Nông dân', word2: 'Ngư dân', hint: 'Nghề nghiệp' },
  { word1: 'Luật sư', word2: 'Thẩm phán', hint: 'Nghề nghiệp' },
  
  // Màu sắc (Colors)
  { word1: 'Màu đỏ', word2: 'Màu xanh', hint: 'Màu sắc' },
  { word1: 'Màu vàng', word2: 'Màu cam', hint: 'Màu sắc' },
  { word1: 'Màu trắng', word2: 'Màu đen', hint: 'Màu sắc' },
  { word1: 'Màu hồng', word2: 'Màu tím', hint: 'Màu sắc' },
  { word1: 'Màu xanh lá', word2: 'Màu xanh dương', hint: 'Màu sắc' },
  
  // Thời tiết & Thiên nhiên (Weather & Nature)
  { word1: 'Mặt trời', word2: 'Mặt trăng', hint: 'Thiên nhiên' },
  { word1: 'Mây', word2: 'Mưa', hint: 'Thiên nhiên' },
  { word1: 'Tuyết', word2: 'Gió', hint: 'Thiên nhiên' },
  { word1: 'Sấm', word2: 'Chớp', hint: 'Thiên nhiên' },
  { word1: 'Hoa', word2: 'Cây', hint: 'Thiên nhiên' },
  { word1: 'Lá', word2: 'Cành', hint: 'Thiên nhiên' },
  { word1: 'Đá', word2: 'Cát', hint: 'Thiên nhiên' },
  { word1: 'Nước', word2: 'Lửa', hint: 'Thiên nhiên' },
  { word1: 'Sao', word2: 'Trăng', hint: 'Thiên nhiên' },
  { word1: 'Sông', word2: 'Suối', hint: 'Thiên nhiên' },
  { word1: 'Núi', word2: 'Đồi', hint: 'Thiên nhiên' },
  
  // Thể thao (Sports)
  { word1: 'Bóng đá', word2: 'Bóng rổ', hint: 'Thể thao' },
  { word1: 'Bóng chuyền', word2: 'Cầu lông', hint: 'Thể thao' },
  { word1: 'Bơi lội', word2: 'Chạy bộ', hint: 'Thể thao' },
  { word1: 'Cờ vua', word2: 'Cờ tướng', hint: 'Thể thao' },
  { word1: 'Quần vợt', word2: 'Bóng bàn', hint: 'Thể thao' },
  { word1: 'Võ', word2: 'Kiếm', hint: 'Thể thao' },
  
  // Âm nhạc (Music)
  { word1: 'Đàn piano', word2: 'Đàn guitar', hint: 'Âm nhạc' },
  { word1: 'Trống', word2: 'Sáo', hint: 'Âm nhạc' },
  { word1: 'Nhạc', word2: 'Bài hát', hint: 'Âm nhạc' },
  { word1: 'Đàn tranh', word2: 'Đàn bầu', hint: 'Âm nhạc' },
  { word1: 'Ca sĩ', word2: 'Nhạc sĩ', hint: 'Âm nhạc' },

  // Gia đình (Family)
  { word1: 'Bố', word2: 'Mẹ', hint: 'Gia đình' },
  { word1: 'Ông', word2: 'Bà', hint: 'Gia đình' },
  { word1: 'Anh', word2: 'Chị', hint: 'Gia đình' },
  { word1: 'Con trai', word2: 'Con gái', hint: 'Gia đình' },

  // Hành động (Actions)
  { word1: 'Ăn', word2: 'Uống', hint: 'Hành động' },
  { word1: 'Đọc', word2: 'Viết', hint: 'Hành động' },
  { word1: 'Nghe', word2: 'Nói', hint: 'Hành động' },
  { word1: 'Đi', word2: 'Chạy', hint: 'Hành động' },
  { word1: 'Ngủ', word2: 'Thức', hint: 'Hành động' },
  { word1: 'Cười', word2: 'Khóc', hint: 'Hành động' },

  // Tính từ & Cảm xúc (Adjectives & Emotions)
  { word1: 'Vui', word2: 'Buồn', hint: 'Tính từ' },
  { word1: 'Giận', word2: 'Sợ', hint: 'Tính từ' },
  { word1: 'Nóng', word2: 'Lạnh', hint: 'Tính từ' },
  { word1: 'Cao', word2: 'Thấp', hint: 'Tính từ' },
  { word1: 'Dài', word2: 'Ngắn', hint: 'Tính từ' },
  { word1: 'To', word2: 'Nhỏ', hint: 'Tính từ' },
  { word1: 'Nhanh', word2: 'Chậm', hint: 'Tính từ' },
  { word1: 'Dễ', word2: 'Khó', hint: 'Tính từ' },
  { word1: 'Sạch', word2: 'Bẩn', hint: 'Tính từ' },
  { word1: 'Mới', word2: 'Cũ', hint: 'Tính từ' },
  
  // Khác (Others)
  { word1: 'Vàng', word2: 'Bạc', hint: 'Quý' },
  { word1: 'Ruby', word2: 'Sapphire', hint: 'Quý' },
  { word1: 'Con hến', word2: 'Con trai', hint: 'Nước' },
  { word1: 'Búp bê', word2: 'Robot', hint: 'Con người' },
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
