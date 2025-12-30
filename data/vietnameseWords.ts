// Vietnamese words for civilians (all civilians get the same word)
// Only things/objects (nouns) - using proper Vietnamese classifiers
export interface WordPair {
  word1: string;
  word2: string;
  hint: string;
}

export const vietnameseWordPairs: WordPair[] = [
  // =Mục 1: Nhóm Đồ vật chung (không thuộc phòng cụ thể)=================
  { word1: 'Cái bàn', word2: 'Cái ghế', hint: 'Nội thất' },
  { word1: 'Cái đèn', word2: 'Cái quạt', hint: 'Thiết bị gia dụng' },
  { word1: 'Cái điều hòa', word2: 'Cái quạt', hint: 'Thiết bị gia dụng' },
  { word1: 'Bức tranh', word2: 'Tấm ảnh', hint: 'Đồ trang trí' },
  { word1: 'Cái rèm', word2: 'Cái thảm', hint: 'Đồ trang trí' },
  { word1: 'Chìa khóa', word2: 'Ổ khóa', hint: 'Đồ vật' },
  { word1: 'Cửa sổ', word2: 'Cửa ra vào', hint: 'Bộ phận trong nhà' },
  { word1: 'Bật lửa', word2: 'Hộp diêm', hint: 'Đồ vật' },
  { word1: 'Nến thơm', word2: 'Tinh dầu thơm', hint: 'Đồ trang trí' },
  { word1: 'Nước hoa', word2: 'Tinh dầu thơm', hint: 'Đồ vật' },
  { word1: 'Bình cứu hỏa', word2: 'Chuông báo cháy', hint: 'Đồ vật' },
  { word1: 'Thang cuốn', word2: 'Thang máy', hint: 'Thiết bị' },
  { word1: 'Cầu thang', word2: 'Thang máy', hint: 'Kiến trúc' },

  // =Mục 2: Nhà bếp=================================================
  { word1: 'Cái tủ lạnh', word2: 'Cái lò vi sóng', hint: 'Thiết bị nhà bếp' },
  { word1: 'Cái bát', word2: 'Cái đũa', hint: 'Đồ dùng nhà bếp' },
  { word1: 'Cái cốc', word2: 'Cái chén', hint: 'Đồ dùng nhà bếp' },
  { word1: 'Con dao', word2: 'Cái thớt', hint: 'Đồ dùng nhà bếp' },
  { word1: 'Cái đĩa', word2: 'Cái tô', hint: 'Đồ dùng nhà bếp' },
  { word1: 'Cái nồi', word2: 'Cái chảo', hint: 'Đồ dùng nhà bếp' },
  { word1: 'Cái nĩa', word2: 'Cái muỗng', hint: 'Đồ dùng nhà bếp' },
  { word1: 'Nồi cơm điện', word2: 'Nồi chiên không dầu', hint: 'Thiết bị nhà bếp' },
  { word1: 'Bếp gas', word2: 'Bếp từ', hint: 'Thiết bị nhà bếp' },
  { word1: 'Ấm siêu tốc', word2: 'Phích nước', hint: 'Thiết bị nhà bếp' },
  { word1: 'Cái kéo', word2: 'Dao rọc giấy', hint: 'Đồ dùng nhà bếp' },
  { word1: 'Hũ muối', word2: 'Hũ đường', hint: 'Đồ dùng nhà bếp' },
  { word1: 'Màng bọc thực phẩm', word2: 'Giấy bạc', hint: 'Đồ dùng nhà bếp' },
  { word1: 'Phin cà phê', word2: 'Ấm pha trà', hint: 'Đồ dùng nhà bếp' },
  { word1: 'Nồi áp suất', word2: 'Nồi hầm', hint: 'Đồ dùng nhà bếp' },
  { word1: 'Máy xay sinh tố', word2: 'Máy ép trái cây', hint: 'Thiết bị nhà bếp' },

  // =Mục 3: Phòng khách===============================================
  { word1: 'Ghế sofa', word2: 'Bàn trà', hint: 'Đồ dùng phòng khách' },
  { word1: 'Kệ tivi', word2: 'Tivi', hint: 'Đồ dùng phòng khách' },
  { word1: 'Gối tựa', word2: 'Ghế sofa', hint: 'Đồ dùng phòng khách' },
  { word1: 'Ấm trà', word2: 'Chén trà', hint: 'Đồ dùng phòng khách' },
  { word1: 'Bộ ấm chén', word2: 'Khay trà', hint: 'Đồ dùng phòng khách' },
  { word1: 'Đồng hồ treo tường', word2: 'Tấm lịch', hint: 'Đồ dùng phòng khách' },
  { word1: 'Loa', word2: 'Âm ly', hint: 'Đồ dùng phòng khách' },
  { word1: 'Đèn chùm', word2: 'Đèn cây', hint: 'Đồ dùng phòng khách' },

  // =Mục 4: Phòng ngủ=================================================
  { word1: 'Cái giường', word2: 'Cái nệm', hint: 'Đồ dùng phòng ngủ' },
  { word1: 'Cái chăn', word2: 'Cái gối', hint: 'Đồ dùng phòng ngủ' },
  { word1: 'Tủ quần áo', word2: 'Móc treo áo quần', hint: 'Đồ dùng phòng ngủ' },
  { word1: 'Bàn trang điểm', word2: 'Gương toàn thân', hint: 'Đồ dùng phòng ngủ' },
  { word1: 'Đèn ngủ', word2: ' Đồng hồ báo thức', hint: 'Đồ dùng phòng ngủ' },
  { word1: 'Ga trải giường', word2: 'Vỏ gối', hint: 'Đồ dùng phòng ngủ' },
  { word1: 'Móc treo áo quần', word2: 'Cây phơi đồ', hint: 'Đồ dùng phòng ngủ' },
  { word1: 'Gối ôm', word2: 'Gối kê đầu', hint: 'Đồ dùng phòng ngủ' },

  // =Mục 5: Phòng tắm=================================================
  { word1: 'Xà phòng', word2: 'Khăn mặt', hint: 'Đồ dùng phòng tắm' },
  { word1: 'Bồn tắm', word2: 'Vòi hoa sen', hint: 'Đồ dùng phòng tắm' },
  { word1: 'Bồn rửa mặt', word2: 'Vòi nước', hint: 'Đồ dùng phòng tắm' },
  { word1: 'Bồn cầu', word2: 'Bồn rửa mặt', hint: 'Đồ dùng phòng tắm' },
  { word1: 'Bàn chải đánh răng', word2: 'Kem đánh răng', hint: 'Đồ dùng phòng tắm' },
  { word1: 'Dầu gội', word2: 'Sữa tắm', hint: 'Đồ dùng phòng tắm' },
  { word1: 'Khăn tắm', word2: 'Áo choàng tắm', hint: 'Đồ dùng phòng tắm' },
  { word1: 'Thảm chùi chân', word2: 'Dép đi trong nhà', hint: 'Đồ dùng phòng tắm' },
  { word1: 'Máy sấy tóc', word2: 'Cái lược', hint: 'Đồ dùng phòng tắm' },
  { word1: 'Cây cọ bồn cầu', word2: 'Nước tẩy rửa', hint: 'Đồ dùng phòng tắm' },
  { word1: 'Dao cạo râu', word2: 'Bọt cạo râu', hint: 'Đồ dùng phòng tắm' },
  { word1: 'Nước súc miệng', word2: 'Kem đánh răng', hint: 'Đồ dùng phòng tắm' },
  { word1: 'Chỉ nha khoa', word2: 'Bàn chải đánh răng', hint: 'Đồ dùng phòng tắm' },
  
  // =Mục 6: Dọn dẹp & Giặt phơi======================================
  { word1: 'Cái chổi', word2: 'Cái hốt rác', hint: 'Dụng cụ dọn dẹp' },
  { word1: 'Nước rửa chén', word2: 'Máy rửa chén', hint: 'Dụng cụ dọn dẹp' },
  { word1: 'Thùng rác', word2: 'Túi rác', hint: 'Dụng cụ dọn dẹp' },
  { word1: 'Máy giặt', word2: 'Máy sấy quần áo', hint: 'Dụng cụ dọn dẹp' },
  { word1: 'Bột giặt', word2: 'Nước xả vải', hint: 'Dụng cụ dọn dẹp' },
  { word1: 'Cây lau nhà', word2: 'Xô nước', hint: 'Dụng cụ dọn dẹp' },
  { word1: 'Bình xịt lau kính', word2: 'Giẻ lau kính', hint: 'Dụng cụ dọn dẹp' },
  { word1: 'Máy hút bụi', word2: 'Chổi điện', hint: 'Thiết bị gia dụng' },

  // =Mục 7: Dụng cụ & Văn phòng======================================
  { word1: 'Dập ghim', word2: 'Kẹp giấy', hint: 'Văn phòng phẩm' },
  { word1: 'Băng dính', word2: 'Keo dán', hint: 'Văn phòng phẩm' },
  { word1: 'Hộp bút', word2: 'Thước kẻ', hint: 'Văn phòng phẩm' },
  { word1: 'Sổ tay', word2: 'Bút bi', hint: 'Văn phòng phẩm' },
  { word1: 'Cái búa', word2: 'Cái đinh', hint: 'Dụng cụ' },
  { word1: 'Cái kìm', word2: 'Cái búa', hint: 'Dụng cụ' },
  { word1: 'Cái tua vít', word2: 'Ốc vít', hint: 'Dụng cụ' },
  { word1: 'Cuộn dây điện', word2: 'Ổ cắm điện', hint: 'Dụng cụ' },
  { word1: 'Phích cắm', word2: 'Ổ cắm', hint: 'Dụng cụ' },
  { word1: 'Dây thép', word2: 'Dây dù', hint: 'Dụng cụ' },
  { word1: 'Thang nhôm', word2: 'Thang gấp', hint: 'Dụng cụ' },
  
  // =Mục 8: Đồ ăn uống (Phân loại chi tiết)===========================
  // --- Món ăn ---
  { word1: 'Cơm', word2: 'Phở', hint: 'Món ăn' },
  { word1: 'Bún', word2: 'Hủ tiếu', hint: 'Món ăn' },
  { word1: 'Bánh mì', word2: 'Bánh bao', hint: 'Món ăn' },
  { word1: 'Xôi', word2: 'Cháo', hint: 'Món ăn' },
  { word1: 'Nem', word2: 'Chả giò', hint: 'Món ăn' },
  { word1: 'Bánh chưng', word2: 'Bánh tét', hint: 'Món ăn' },
  { word1: 'Mì tôm', word2: 'Miến', hint: 'Món ăn' },
  { word1: 'Lẩu', word2: 'Đồ nướng', hint: 'Món ăn' },
  { word1: 'Thịt kho', word2: 'Cá kho', hint: 'Món ăn' },
  { word1: 'Rau xào', word2: 'Rau luộc', hint: 'Món ăn' },
  { word1: 'Canh chua', word2: 'Canh bí', hint: 'Món ăn' },
  { word1: 'Gà rán', word2: 'Khoai tây chiên', hint: 'Món ăn' },
  { word1: 'Pizza', word2: 'Hamburger', hint: 'Món ăn' },
  { word1: 'Bánh ép', word2: 'Bánh xèo', hint: 'Món ăn' },
  { word1: 'Bánh giò', word2: 'Bánh chưng', hint: 'Món ăn' },
  { word1: 'Bánh pía', word2: 'Bánh trung thu', hint: 'Món ăn' },
  { word1: 'Xúc xích', word2: 'Lạp xưởng', hint: 'Món ăn' },
  { word1: 'Nem chua', word2: 'Tré', hint: 'Món ăn' },
  { word1: 'Bún bò', word2: 'Bún riêu', hint: 'Món ăn' },
  { word1: 'Phở bò', word2: 'Phở gà', hint: 'Món ăn' },
  { word1: 'Cơm tấm', word2: 'Cơm sườn', hint: 'Món ăn' },
  { word1: 'Bánh cuốn', word2: 'Bánh ướt', hint: 'Món ăn' },
  { word1: 'Gỏi cuốn', word2: 'Bì cuốn', hint: 'Món ăn' },
  { word1: 'Chả lụa', word2: 'Chả chiên', hint: 'Món ăn' },
  { word1: 'Cháo gà', word2: 'Cháo vịt', hint: 'Món ăn' },
  { word1: 'Xôi gấc', word2: 'Xôi đậu', hint: 'Món ăn' },
  { word1: 'Bánh canh', word2: 'Hủ tiếu', hint: 'Món ăn' },
  { word1: 'Chè đậu', word2: 'Chè trôi nước', hint: 'Món ăn' },
  { word1: 'Bánh flan', word2: 'Panna Cotta', hint: 'Món ăn' },
  { word1: 'Bỏng ngô', word2: 'Bắp nướng', hint: 'Món ăn' },
  { word1: 'Sushi', word2: 'Sashimi', hint: 'Món ăn' },
  { word1: 'Bánh tráng trộn', word2: 'Bánh tráng nướng', hint: 'Món ăn' },
  { word1: 'Sandwich', word2: 'Bánh mì', hint: 'Món ăn' },
  
  // --- Đồ uống ---
  { word1: 'Cà phê', word2: 'Trà', hint: 'Đồ uống' },
  { word1: 'Bia', word2: 'Rượu', hint: 'Đồ uống' },
  { word1: 'Sữa', word2: 'Nước cam', hint: 'Đồ uống' },
  { word1: 'Nước ngọt', word2: 'Nước suối', hint: 'Đồ uống' },
  { word1: 'Trà sữa', word2: 'Trà chanh', hint: 'Đồ uống' },
  { word1: 'Sinh tố', word2: 'Nước ép', hint: 'Đồ uống' },
  { word1: 'Nước dừa', word2: 'Nước mía', hint: 'Đồ uống' },
  { word1: 'Sữa đậu nành', word2: 'Sữa ngô', hint: 'Đồ uống' },
  { word1: 'Sữa đặc', word2: 'Sữa tươi', hint: 'Đồ uống' },
  { word1: 'Nước tăng lực', word2: 'Nước khoáng', hint: 'Đồ uống' },
  { word1: 'Trà đá', word2: 'Trà nóng', hint: 'Đồ uống' },
  { word1: 'Nước chanh', word2: 'Nước cam', hint: 'Đồ uống' },
  { word1: 'Coca Cola', word2: 'Pepsi', hint: 'Đồ uống' },
  { word1: 'Rượu vang', word2: 'Rượu soju', hint: 'Đồ uống' },
  { word1: 'Cocktail', word2: 'Champage', hint: 'Đồ uống' },
  { word1: 'CF đen đá', word2: 'Bạc xỉu', hint: 'Đồ uống' },
  { word1: 'CF đen đá', word2: 'Trà sữa', hint: 'Đồ uống' },

  
  // --- Đồ ăn vặt ---
  { word1: 'Kem', word2: 'Sữa chua', hint: 'Đồ ăn vặt' },
  { word1: 'Kẹo', word2: 'Bánh quy', hint: 'Đồ ăn vặt' },
  { word1: 'Hạt dưa', word2: 'Hạt bí', hint: 'Đồ ăn vặt' },
  { word1: 'Cơm cháy', word2: 'Bỏng ngô', hint: 'Đồ ăn vặt' },
  { word1: 'Kem que', word2: 'Kem ốc quế', hint: 'Đồ ăn vặt' },
  { word1: 'Bánh snack', word2: 'Khoai tây chiên', hint: 'Đồ ăn vặt' },
  { word1: 'Hạt điều', word2: 'Hạt hạnh nhân', hint: 'Đồ ăn vặt' },
  { word1: 'Kẹo mút', word2: 'Kẹo cao su', hint: 'Đồ ăn vặt' },
  
  // --- Gia vị / Nguyên liệu ---
  { word1: 'Bơ', word2: 'Phô mai', hint: 'Gia vị / Nguyên liệu' },
  { word1: 'Tương ớt', word2: 'Tương cà', hint: 'Gia vị / Nguyên liệu' },
  { word1: 'Nước mắm', word2: 'Xì dầu', hint: 'Gia vị / Nguyên liệu' },
  { word1: 'Dầu ăn', word2: 'Dầu hào', hint: 'Gia vị / Nguyên liệu' },
  { word1: 'Giấm', word2: 'Nước cốt chanh', hint: 'Gia vị / Nguyên liệu' },
  { word1: 'Muối', word2: 'Tiêu', hint: 'Gia vị / Nguyên liệu' },
  { word1: 'Sa tế', word2: 'Ớt bột', hint: 'Gia vị' },
  { word1: 'Hành phi', word2: 'Tỏi phi', hint: 'Gia vị' },
  { word1: 'Mắm ruốc', word2: 'Mắm tôm', hint: 'Gia vị' },
  { word1: 'Bột mì', word2: 'Bột gạo', hint: 'Nguyên liệu' },
  { word1: 'Đường trắng', word2: 'Mật ong', hint: 'Gia vị/Nguyên liệu' },

  // =Mục 9: Trái cây=================================================
  { word1: 'Quả táo', word2: 'Quả lê', hint: 'Trái cây' },
  { word1: 'Quả chuối', word2: 'Quả cam', hint: 'Trái cây' },
  { word1: 'Quả dưa hấu', word2: 'Quả dưa lưới', hint: 'Trái cây' },
  { word1: 'Quả xoài', word2: 'Quả dứa', hint: 'Trái cây' },
  { word1: 'Quả nho', word2: 'Quả dâu', hint: 'Trái cây' },
  { word1: 'Quả đào', word2: 'Quả mận', hint: 'Trái cây' },
  { word1: 'Quả nhãn', word2: 'Quả vải', hint: 'Trái cây' },
  { word1: 'Quả mít', word2: 'Quả sầu riêng', hint: 'Trái cây' },
  { word1: 'Quả vải', word2: 'Quả chôm chôm', hint: 'Trái cây' },
  { word1: 'Quả bưởi', word2: 'Quả cam', hint: 'Trái cây' },
  { word1: 'Quả chanh', word2: 'Quả tắc', hint: 'Trái cây' },
  { word1: 'Quả ổi', word2: 'Quả đu đủ', hint: 'Trái cây' },
  { word1: 'Quả bơ', word2: 'Quả dừa', hint: 'Trái cây' },
  { word1: 'Quả khế', word2: 'Quả me', hint: 'Trái cây' },
  { word1: 'Quả quýt', word2: 'Quả cam', hint: 'Trái cây' },
  { word1: 'Quả lựu', word2: 'Thanh long', hint: 'Trái cây' },
  { word1: 'Quả kiwi', word2: 'Quả nho', hint: 'Trái cây' },
  { word1: 'Quả măng cụt', word2: 'Quả nhãn lồng', hint: 'Trái cây' },
  { word1: 'Quả thanh long', word2: 'Quả mãng cầu', hint: 'Trái cây' },
  { word1: 'Quả cherry', word2: 'Quả dâu tây', hint: 'Trái cây' },
  { word1: 'Quả bắp', word2: 'Quả lựu', hint: 'Trái cây' },
  
  // =Mục 10: Rau củ==================================================
  { word1: 'Cà chua', word2: 'Cà rốt', hint: 'Rau củ' },
  { word1: 'Khoai tây', word2: 'Khoai lang', hint: 'Rau củ' },
  { word1: 'Củ hành', word2: 'Củ tỏi', hint: 'Rau củ' },
  { word1: 'Cải thảo', word2: 'Xà lách', hint: 'Rau củ' },
  { word1: 'Rau muống', word2: 'Rau dền', hint: 'Rau củ' },
  { word1: 'Su hào', word2: 'Súp lơ', hint: 'Rau củ' },
  { word1: 'Ớt', word2: 'Gừng', hint: 'Rau củ' },
  { word1: 'Bắp cải', word2: 'Cải thảo', hint: 'Rau củ' },
  { word1: 'Súp lơ xanh', word2: 'Súp lơ trắng', hint: 'Rau củ' },
  { word1: 'Măng tây', word2: 'Cần tây', hint: 'Rau củ' },
  { word1: 'Hành tây', word2: 'Hành lá', hint: 'Rau củ' },
  { word1: 'Ngò gai', word2: 'Rau răm', hint: 'Rau củ' },
  { word1: 'Nghệ', word2: 'Riềng', hint: 'Rau củ' },
  { word1: 'Củ cải', word2: 'Củ dền', hint: 'Rau củ' },
  { word1: 'Mồng tơi', word2: 'Rau ngót', hint: 'Rau củ' },
  { word1: 'Cà tím', word2: 'Cà pháo', hint: 'Rau củ' },
  { word1: 'Ớt chuông', word2: 'Ớt hiểm', hint: 'Rau củ' },
  { word1: 'Lá lốt', word2: 'Lá chanh', hint: 'Rau củ' },
  { word1: 'Rau diếp', word2: 'Xà lách', hint: 'Rau củ' },
  { word1: 'Bầu', word2: 'Bí', hint: 'Rau củ' },
  { word1: 'Đậu bắp', word2: 'Đậu que', hint: 'Rau củ' },
  { word1: 'Đậu phộng', word2: 'Đậu nành', hint: 'Rau củ' },
  { word1: 'Bí đao', word2: 'Bí đỏ', hint: 'Rau củ' },
  { word1: 'Khoai môn', word2: 'Bí đỏ', hint: 'Rau củ' },
  
  // --- Nấm ---
  { word1: 'Nấm rơm', word2: 'Nấm hương', hint: 'Nấm' },
  { word1: 'Nấm kim châm', word2: 'Nấm đùi gà', hint: 'Nấm' },
  
  // =Mục 11: Động vật (Phân loại chi tiết)============================
  // --- Động vật (Chung / Trên cạn / Chim) ---
  { word1: 'Con chó', word2: 'Con mèo', hint: 'Động vật' },
  { word1: 'Con gà', word2: 'Con vịt', hint: 'Động vật' },
  { word1: 'Con lợn', word2: 'Con bò', hint: 'Động vật' },
  { word1: 'Con trâu', word2: 'Con bò', hint: 'Động vật' },
  { word1: 'Con ngựa', word2: 'Con lạc đà', hint: 'Động vật' },
  { word1: 'Con thỏ', word2: 'Con chuột', hint: 'Động vật' },
  { word1: 'Con hổ', word2: 'Con sư tử', hint: 'Động vật' },
  { word1: 'Con voi', word2: 'Con tê giác', hint: 'Động vật' },
  { word1: 'Con khỉ', word2: 'Con vượn', hint: 'Động vật' },
  { word1: 'Con sói', word2: 'Con cáo', hint: 'Động vật' },
  { word1: 'Con dê', word2: 'Con cừu', hint: 'Động vật' },
  { word1: 'Con cá sấu', word2: 'Con thằn lằn', hint: 'Bò sát' },
  { word1: 'Con ếch', word2: 'Con nhái', hint: 'Động vật' },
  { word1: 'Con rắn', word2: 'Con trăn', hint: 'Bò sát' },
  { word1: 'Con ngỗng', word2: 'Con thiên nga', hint: 'Chim' },
  { word1: 'Con vẹt', word2: 'Con sáo', hint: 'Chim' },
  { word1: 'Con công', word2: 'Con vẹt', hint: 'Chim' },
  { word1: 'Con đại bàng', word2: 'Con diều hâu', hint: 'Chim' },
  { word1: 'Con cú', word2: 'Con quạ', hint: 'Chim' },
  { word1: 'Con chim sẻ', word2: 'Con chim én', hint: 'Chim' },
  { word1: 'Con sóc', word2: 'Con chuột', hint: 'Động vật' },
  { word1: 'Con nhím', word2: 'Con chồn', hint: 'Động vật' },
  { word1: 'Con gấu trúc', word2: 'Con gấu bắc cực', hint: 'Động vật' },
  { word1: 'Con hươu cao cổ', word2: 'Con ngựa vằn', hint: 'Động vật' },
  { word1: 'Con hà mã', word2: 'Con voi', hint: 'Động vật' },
  { word1: 'Con chuột túi', word2: 'Con koala', hint: 'Động vật' },
  { word1: 'Con đà điểu', word2: 'Con chim cánh cụt', hint: 'Chim' },
  { word1: 'Con rùa', word2: 'Con ba ba', hint: 'Bò sát' },
  { word1: 'Con gà trống', word2: 'Con gà mái', hint: 'Động vật' },
  { word1: 'Con vịt', word2: 'Con ngỗng', hint: 'Chim' },
  { word1: 'Con cò', word2: 'Con hạc', hint: 'Chim' },
  { word1: 'Con bồ câu', word2: 'Con chim sẻ', hint: 'Chim' },
  { word1: 'Con cọp', word2: 'Con beo', hint: 'Động vật' },
  { word1: 'Con vượn', word2: 'Con đười ươi', hint: 'Động vật' },
  { word1: 'Con gấu trúc', word2: 'Con gấu koala', hint: 'Động vật' },
  { word1: 'Con hươu', word2: 'Con nai', hint: 'Động vật' },
  
  // --- Động vật biển / Dưới nước ---
  { word1: 'Con cá heo', word2: 'Con cá mập', hint: 'Động vật biển' },
  { word1: 'Con bạch tuộc', word2: 'Con mực', hint: 'Động vật biển' },
  { word1: 'Con cua', word2: 'Con tôm', hint: 'Động vật biển' },
  { word1: 'Con ốc', word2: 'Con sò', hint: 'Động vật biển' },
  { word1: 'Con cá ngừ', word2: 'Con cá hồi', hint: 'Động vật biển' },
  { word1: 'San hô', word2: 'Con sao biển', hint: 'Động vật biển' },
  { word1: 'Con cá voi', word2: 'Con cá heo', hint: 'Động vật biển' },
  { word1: 'Con cá chép', word2: 'Con cá vàng', hint: 'Cá nước ngọt' },
  { word1: 'Con cá mập', word2: 'Con cá voi sát thủ', hint: 'Động vật biển' },
  { word1: 'Con ghẹ', word2: 'Con cua', hint: 'Động vật biển' },
  { word1: 'Con tôm hùm', word2: 'Cua hoàng đế', hint: 'Động vật biển' },
  { word1: 'Con ốc hương', word2: 'Con ốc bươu', hint: 'Động vật biển' },
  { word1: 'Con thú mỏ vịt', word2: 'Con hải ly', hint: 'Động vật biển' },
  
  // --- Côn trùng ---
  { word1: 'Con bướm', word2: 'Con chuồn chuồn', hint: 'Côn trùng' },
  { word1: 'Con ong', word2: 'Con kiến', hint: 'Côn trùng' },
  { word1: 'Con muỗi', word2: 'Con ruồi', hint: 'Côn trùng' },
  { word1: 'Con nhện', word2: 'Con bọ cạp', hint: 'Côn trùng' },
  { word1: 'Con dế', word2: 'Con châu chấu', hint: 'Côn trùng' },
  { word1: 'Con gián', word2: 'Con rệp', hint: 'Côn trùng' },
  { word1: 'Con rết', word2: 'Con cuốn chiếu', hint: 'Côn trùng' },
  { word1: 'Con ong mật', word2: 'Con ong bắp cày', hint: 'Côn trùng' },
  { word1: 'Con kiến ba khoang', word2: 'Con kiến lửa', hint: 'Côn trùng' },
  { word1: 'Con giun đất', word2: 'Con đỉa', hint: 'Động vật nhỏ' },
  
  // =Mục 12: Phương tiện=============================================
  { word1: 'Xe máy', word2: 'Xe đạp', hint: 'Phương tiện' },
  { word1: 'Xe hơi', word2: 'Xe buýt', hint: 'Phương tiện' },
  { word1: 'Máy bay', word2: 'Trực thăng', hint: 'Phương tiện hàng không' },
  { word1: 'Tàu hỏa', word2: 'Tàu thủy', hint: 'Phương tiện' },
  { word1: 'Thuyền', word2: 'Canô', hint: 'Phương tiện' },
  { word1: 'Xe tải', word2: 'Xe container', hint: 'Phương tiện' },
  { word1: 'Xe cứu thương', word2: 'Xe cứu hỏa', hint: 'Phương tiện' },
  { word1: 'Xe xích lô', word2: 'Xe ba gác', hint: 'Phương tiện' },
  { word1: 'Xe taxi', word2: 'Xe khách', hint: 'Phương tiện' },
  { word1: 'Xe limousine', word2: 'Xe buýt', hint: 'Phương tiện' },
  { word1: 'Khinh khí cầu', word2: 'Dù lượn', hint: 'Phương tiện hàng không' },
  { word1: 'Xe cảnh sát', word2: 'Xe cứu thương', hint: 'Phương tiện' },
  { word1: 'Ván trượt', word2: 'Giày trượt', hint: 'Phương tiện' },
  { word1: 'Xe đẩy hàng', word2: 'Xe đẩy em bé', hint: 'Phương tiện' },
  { word1: 'Xe số', word2: 'Xe tay ga', hint: 'Phương tiện' },
  { word1: 'Xe đạp điện', word2: 'Xe máy điện', hint: 'Phương tiện' },
  { word1: 'Xuồng', word2: 'Thuyền thúng', hint: 'Phương tiện' },
  { word1: 'Máy bay phản lực', word2: 'Tên lửa', hint: 'Hàng không'},
  { word1: 'Tàu điện ngầm', word2: 'Xe buýt', hint: 'Phương tiện' },
  { word1: 'Xe jeep', word2: 'Xe tăng', hint: 'Phương tiện' },
  { word1: 'Tên lửa', word2: 'Vệ tinh', hint: 'Không gian' },
  
  // =Mục 13: Quần áo & Phụ kiện======================================
  { word1: 'Áo gió', word2: 'Áo len', hint: 'Trang phục' },
  { word1: 'Giày', word2: 'Dép', hint: 'Phụ kiện' },
  { word1: 'Túi xách', word2: 'Ba lô', hint: 'Phụ kiện' },
  { word1: 'Khuyên tai', word2: 'Vòng cổ', hint: 'Trang sức' },
  { word1: 'Đồng hồ đeo tay', word2: 'Kính mắt', hint: 'Phụ kiện' },
  { word1: 'Găng tay', word2: 'Khăn quàng', hint: 'Phụ kiện' },
  { word1: 'Cà vạt', word2: 'Nơ đeo cổ', hint: 'Phụ kiện' },
  { word1: 'Áo sơ mi', word2: 'Áo phông', hint: 'Trang phục' },
  { word1: 'Áo thun', word2: 'Áo polo', hint: 'Trang phục' },
  { word1: 'Váy ngắn', word2: 'Quần shorts', hint: 'Trang phục' },
  { word1: 'Đồ ngủ', word2: 'Đồ bơi', hint: 'Trang phục' },
  { word1: 'Áo dài', word2: 'Áo bà ba', hint: 'Trang phục' },
  { word1: 'Áo mưa', word2: 'Ủng đi mưa', hint: 'Trang phục' },
  { word1: 'Boots', word2: 'Giày cao gót', hint: 'Phụ kiện' },
  { word1: 'Giày thể thao', word2: 'Sandals', hint: 'Phụ kiện' },
  { word1: 'Kính râm', word2: 'Kính bơi', hint: 'Phụ kiện' },
  { word1: 'Nhẫn', word2: 'Lắc tay', hint: 'Trang sức' },
  { word1: 'Vòng tay', word2: 'Dây chuyền', hint: 'Trang sức' },
  { word1: 'Kẹp tóc', word2: 'Trâm cài tóc', hint: 'Phụ kiện' },
  { word1: 'Mũ len', word2: 'Mũ lưỡi trai', hint: 'Phụ kiện' },
  { word1: 'Mũ bảo hiểm', word2: 'Mũ lưỡi trai', hint: 'Phụ kiện' },
  { word1: 'Tạp dề', word2: 'Yếm', hint: 'Trang phục' },
  { word1: 'Khăn rằn', word2: 'Khăn piêu', hint: 'Phụ kiện' },
  { word1: 'Váy cưới', word2: 'Áo vest cưới', hint: 'Trang phục' },
  { word1: 'Cái ô', word2: 'Áo mưa', hint: 'Phụ kiện' },
  { word1: 'Áo ba lỗ', word2: 'Áo hai dây', hint: 'Trang phục' },
  { word1: 'Quần legging', word2: 'Quần jogger', hint: 'Trang phục' },
  { word1: 'Dây buộc tóc', word2: 'Băng đô', hint: 'Phụ kiện' },
  { word1: 'Balo', word2: 'Túi đeo chéo', hint: 'Phụ kiện' },
  { word1: 'Áo khoác hoodie', word2: 'Áo bomber', hint: 'Trang phục' },
  
  // =Mục 14: Thiết bị điện tử (Cá nhân)==============================
  { word1: 'Điện thoại', word2: 'Máy tính bảng', hint: 'Thiết bị điện tử' },
  { word1: 'Desktop', word2: 'Laptop', hint: 'Thiết bị điện tử' },
  { word1: 'Tivi', word2: 'Radio', hint: 'Thiết bị điện tử' },
  { word1: 'Loa', word2: 'Tai nghe', hint: 'Thiết bị điện tử' },
  { word1: 'Bàn phím', word2: 'Chuột máy tính', hint: 'Thiết bị điện tử' },
  { word1: 'USB', word2: 'Ổ cứng', hint: 'Thiết bị điện tử' },
  { word1: 'Máy in', word2: 'Máy scan', hint: 'Thiết bị điện tử' },
  { word1: 'Wifi', word2: 'Bluetooth', hint: 'Thiết bị điện tử' },
  { word1: 'Micro', word2: 'Loa', hint: 'Thiết bị điện tử' },
  { word1: 'Máy chơi game', word2: 'Tay cầm chơi game', hint: 'Thiết bị điện tử' },
  { word1: 'Đầu đĩa', word2: 'Dàn âm thanh', hint: 'Thiết bị điện tử' },
  { word1: 'Máy phát điện', word2: 'Pin dự phòng', hint: 'Thiết bị điện tử' },
  { word1: 'Máy nghe nhạc', word2: 'Máy ghi âm', hint: 'Thiết bị điện tử' },
  { word1: 'Thẻ nhớ', word2: 'Đầu đọc thẻ', hint: 'Thiết bị điện tử' },
  { word1: 'Máy chiếu', word2: 'Màn chiếu', hint: 'Thiết bị điện tử' },
  { word1: 'iPhone', word2: 'Samsung', hint: 'Thiết bị điện tử' },
  { word1: 'Macbook', word2: 'Laptop Dell', hint: 'Thiết bị điện tử' },
  { word1: 'Điều khiển tivi', word2: 'Điều khiển điều hòa', hint: 'Thiết bị điện tử' },
  { word1: 'Laptop', word2: 'Tablet', hint: 'Thiết bị điện tử' },
  { word1: 'Loa', word2: 'Tai nghe', hint: 'Thiết bị điện tử' },
  { word1: 'Kindle', word2: 'Máy tính bảng', hint: 'Thiết bị điện tử' },
  { word1: 'Loa thông minh', word2: 'Trợ lý ảo', hint: 'Thiết bị điện tử' },
  
  // =Mục 15: Đồ dùng học tập=========================================
  { word1: 'Sách', word2: 'Vở', hint: 'Học tập' },
  { word1: 'Bút chì', word2: 'Bút bi', hint: 'Học tập' },
  { word1: 'Dao rọc giấy', word2: 'Kéo', hint: 'Học tập' },
  { word1: 'Tẩy', word2: 'Gọt bút chì', hint: 'Học tập' },
  { word1: 'Bảng', word2: 'Phấn', hint: 'Học tập' },
  { word1: 'Cặp sách', word2: 'Hộp bút', hint: 'Học tập' },
  { word1: 'Compa', word2: 'Êke', hint: 'Học tập' },
  { word1: 'Giấy', word2: 'Bút', hint: 'Học tập' },
  { word1: 'Bút mực', word2: 'Bút bi', hint: 'Học tập' },
  { word1: 'Màu nước', word2: 'Màu sáp', hint: 'Học tập' },
  { word1: 'Sách giáo khoa', word2: 'Sách bài tập', hint: 'Học tập' },
  { word1: 'Thước kẻ', word2: 'Thước đo độ', hint: 'Học tập' },
  { word1: 'Phấn trắng', word2: 'Phấn màu', hint: 'Học tập' },
  { word1: 'Bút xóa', word2: 'Tẩy', hint: 'Học tập' },
  { word1: 'Máy tính cầm tay', word2: 'Máy tính khoa học', hint: 'Học tập' },
  { word1: 'Giấy A4', word2: 'Giấy note', hint: 'Học tập' },
  { word1: 'Bìa hồ sơ', word2: 'Bìa kiếp', hint: 'Học tập' },
  
  // =Mục 16: Địa điểm================================================
  { word1: 'Nhà', word2: 'Khách sạn', hint: 'Địa điểm' },
  { word1: 'Trường học', word2: 'Thư viện', hint: 'Địa điểm' },
  { word1: 'Bệnh viện', word2: 'Nhà thuốc', hint: 'Địa điểm' },
  { word1: 'Nhà hàng', word2: 'Quán cà phê', hint: 'Địa điểm' },
  { word1: 'Công viên', word2: 'Sân vận động', hint: 'Địa điểm' },
  { word1: 'Rạp chiếu phim', word2: 'Bảo tàng', hint: 'Địa điểm' },
  { word1: 'Chợ', word2: 'Siêu thị', hint: 'Địa điểm' },
  { word1: 'Ngân hàng', word2: 'Bưu điện', hint: 'Địa điểm' },
  { word1: 'Sân bay', word2: 'Ga tàu', hint: 'Địa điểm' },
  { word1: 'Bãi biển', word2: 'Bờ sông', hint: 'Địa điểm' },
  { word1: 'Sông', word2: 'Hồ', hint: 'Địa điểm' },
  { word1: 'Nhà thờ', word2: 'Ngôi chùa', hint: 'Địa điểm' },
  { word1: 'Đồng ruộng', word2: 'Ao cá', hint: 'Địa điểm' },
  { word1: 'Tiệm tạp hóa', word2: 'Cửa hàng tiện lợi', hint: 'Địa điểm' },
  { word1: 'Tiệm cắt tóc', word2: 'Tiệm làm móng', hint: 'Địa điểm' },
  { word1: 'Trạm xăng', word2: 'Garage xe', hint: 'Địa điểm' },
  { word1: 'Ruộng lúa', word2: 'Vườn rau', hint: 'Địa điểm' },
  { word1: 'Phòng khách', word2: 'Phòng ngủ', hint: 'Địa điểm' },
  { word1: 'Ban công', word2: 'Sân thượng', hint: 'Địa điểm' },
  { word1: 'Văn phòng', word2: 'Nhà máy', hint: 'Địa điểm' },
  { word1: 'Hội chợ', word2: 'Siêu thị', hint: 'Địa điểm' },
  { word1: 'Phòng gym', word2: 'Sân chơi thể thao', hint: 'Địa điểm' },
  { word1: 'Cầu', word2: 'Đường hầm', hint: 'Địa điểm' },
  
  // --- Thành phố / Quốc gia ---
  { word1: 'Hà Nội', word2: 'Sài Gòn', hint: 'Thành phố' },
  { word1: 'Paris', word2: 'London', hint: 'Thành phố' },
  { word1: 'Tokyo', word2: 'Seoul', hint: 'Thành phố' },
  { word1: 'Việt Nam', word2: 'Thái Lan', hint: 'Quốc gia' },
  { word1: 'Pháp', word2: 'Ý', hint: 'Quốc gia' },
  { word1: 'Nhật Bản', word2: 'Hàn Quốc', hint: 'Quốc gia' },
  { word1: 'Mỹ', word2: 'Trung Quốc', hint: 'Quốc gia' },

  // =Mục 17: Nghề nghiệp==============================================
  { word1: 'Bác sĩ', word2: 'Y tá', hint: 'Nghề nghiệp' },
  { word1: 'Giáo viên', word2: 'Học sinh', hint: 'Nghề nghiệp' },
  { word1: 'Kỹ sư', word2: 'Công nhân', hint: 'Nghề nghiệp' },
  { word1: 'Đầu bếp', word2: 'Bồi bàn', hint: 'Nghề nghiệp' },
  { word1: 'Phi công', word2: 'Tài xế', hint: 'Nghề nghiệp' },
  { word1: 'Cảnh sát', word2: 'Bộ đội', hint: 'Nghề nghiệp' },
  { word1: 'Thợ xây', word2: 'Thợ điện', hint: 'Nghề nghiệp' },
  { word1: 'Ca sĩ', word2: 'Diễn viên', hint: 'Nghề nghiệp' },
  { word1: 'Nông dân', word2: 'Ngư dân', hint: 'Nghề nghiệp' },
  { word1: 'Luật sư', word2: 'Thẩm phán', hint: 'Nghề nghiệp' },
  { word1: 'Thợ mộc', word2: 'Thợ hàn', hint: 'Nghề nghiệp' },
  { word1: 'Thợ sơn', word2: 'Thợ nề', hint: 'Nghề nghiệp' },
  { word1: 'Thợ cắt tóc', word2: 'Thợ làm móng', hint: 'Nghề nghiệp' },
  { word1: 'Họa sĩ', word2: 'Nhạc sĩ', hint: 'Nghề nghiệp' },
  { word1: 'Thợ may', word2: 'Thợ thêu', hint: 'Nghề nghiệp' },
  { word1: 'Bảo vệ', word2: 'Công an', hint: 'Nghề nghiệp' },
  { word1: 'Kế toán', word2: 'Thủ quỹ', hint: 'Nghề nghiệp' },
  { word1: 'Bán hàng', word2: 'Thu ngân', hint: 'Nghề nghiệp' },
  { word1: 'Shipper', word2: 'Tài xế', hint: 'Nghề nghiệp' },
  { word1: 'Lập trình viên', word2: 'Nhà thiết kế', hint: 'Nghề nghiệp' },
  { word1: 'Bác sĩ phẫu thuật', word2: 'Bác sĩ nha khoa', hint: 'Nghề nghiệp' },
  { word1: 'Kiến trúc sư', word2: 'Kỹ sư xây dựng', hint: 'Nghề nghiệp' },
  { word1: 'Nhà báo', word2: 'Nhà văn', hint: 'Nghề nghiệp' },
  { word1: 'Nhiếp ảnh', word2: 'Quay phim', hint: 'Nghề nghiệp' },
  { word1: 'Lễ tân', word2: 'Thư ký', hint: 'Nghề nghiệp' },
  
  // =Mục 18: Thời tiết & Thiên nhiên=================================
  { word1: 'Mặt trời', word2: 'Mặt trăng', hint: 'Thiên nhiên' },
  { word1: 'Sấm', word2: 'Chớp', hint: 'Thời tiết' },
  { word1: 'Đá', word2: 'Cát', hint: 'Thiên nhiên' },
  { word1: 'Ngôi sao', word2: 'Hành tinh', hint: 'Vũ trụ' },
  { word1: 'Sông', word2: 'Suối', hint: 'Thiên nhiên' },
  { word1: 'Mây', word2: 'Sương', hint: 'Thời tiết' },
  { word1: 'Mưa', word2: 'Tuyết', hint: 'Thời tiết' },
  { word1: 'Gió', word2: 'Bão', hint: 'Thời tiết' },
  { word1: 'Thác nước', word2: 'Suối', hint: 'Thiên nhiên' },
  { word1: 'Rừng', word2: 'Vườn', hint: 'Thiên nhiên' },
  { word1: 'Biển', word2: 'Đại dương', hint: 'Thiên nhiên' },
  { word1: 'Núi lửa', word2: 'Động đất', hint: 'Thiên nhiên' },
  { word1: 'Cầu vồng', word2: 'Sao băng', hint: 'Thiên nhiên' },
  { word1: 'Sóng thần', word2: 'Lốc xoáy', hint: 'Thời tiết' },
  { word1: 'Hạn hán', word2: 'Lụt lội', hint: 'Thời tiết' },
  { word1: 'Hoàng hôn', word2: 'Bình minh', hint: 'Thiên nhiên' },
  
  // =Mục 19: Thể thao================================================
  { word1: 'Bóng đá', word2: 'Bóng chày', hint: 'Thể thao' },
  { word1: 'Bóng chuyền', word2: 'Bóng rổ', hint: 'Thể thao' },
  { word1: 'Bơi lội', word2: 'Chạy bộ', hint: 'Thể thao' },
  { word1: 'Cờ vua', word2: 'Cờ tướng', hint: 'Thể thao' },
  { word1: 'Quần vợt', word2: 'Bóng bàn', hint: 'Thể thao' },
  { word1: 'Taekwondo', word2: 'Karate', hint: 'Võ thuật' },
  { word1: 'Điền kinh', word2: 'Bơi lội', hint: 'Thể thao' },
  { word1: 'Nhảy xa', word2: 'Nhảy cao', hint: 'Thể thao' },
  { word1: 'Đấu kiếm', word2: 'Bắn súng', hint: 'Thể thao' },
  { word1: 'Bắn cung', word2: 'Bắn súng', hint: 'Thể thao' },
  { word1: 'Boxing', word2: 'Karate', hint: 'Võ thuật' },
  { word1: 'Đua xe đạp', word2: 'Đua mô tô', hint: 'Thể thao' },
  { word1: 'Lướt ván', word2: 'Trượt tuyết', hint: 'Thể thao' },
  { word1: 'Trượt băng', word2: 'Trượt tuyết', hint: 'Thể thao' },
  { word1: 'Bóng chày', word2: 'Bóng đá', hint: 'Thể thao' },
  { word1: 'Yoga', word2: 'Gym', hint: 'Thể thao' },
  { word1: 'Bi-a', word2: 'Bowling', hint: 'Thể thao' },
  { word1: 'Nhảy cầu', word2: 'Bơi', hint: 'Thể thao' },
  { word1: 'Quả bóng đá', word2: 'Quả bóng rổ', hint: 'Dụng cụ thể thao' },
  { word1: 'Vợt tennis', word2: 'Vợt cầu lông', hint: 'Dụng cụ thể thao' },
  { word1: 'Gậy golf', word2: 'Gậy bóng chày', hint: 'Dụng cụ thể thao' },
  { word1: 'Khung thành', word2: 'Rổ bóng', hint: 'Dụng cụ thể thao' },
  { word1: 'Mũ bơi', word2: 'Kính bơi', hint: 'Dụng cụ thể thao' },
  { word1: 'Giày đá bóng', word2: 'Giày chạy bộ', hint: 'Dụng cụ thể thao' },
  { word1: 'Áo đấu', word2: 'Quần đấu', hint: 'Trang phục thể thao' },
  { word1: 'Muay Thái', word2: 'Judo', hint: 'Võ thuật' },
  { word1: 'Đấu vật', word2: 'MMA', hint: 'Võ thuật' },
  { word1: 'Leo núi', word2: 'Trekking', hint: 'Thể thao' },
  
  // =Mục 20: Âm nhạc=================================================
  { word1: 'Đàn violin', word2: 'Đàn guitar', hint: 'Nhạc cụ' },
  { word1: 'Đàn tranh', word2: 'Đàn bầu', hint: 'Nhạc cụ' },
  { word1: 'Ca sĩ', word2: 'Nhạc sĩ', hint: 'Âm nhạc' },
  { word1: 'Nhạc pop', word2: 'Nhạc rock', hint: 'Thể loại nhạc' },
  { word1: 'Đàn ukulele', word2: 'Đàn guitar', hint: 'Nhạc cụ' },
  { word1: 'Nhạc trưởng', word2: 'Dàn nhạc', hint: 'Âm nhạc' },
  { word1: 'Giai điệu', word2: 'Lời bài hát', hint: 'Âm nhạc' },
  { word1: 'Phòng thu', word2: 'Sân khấu', hint: 'Âm nhạc' },
  { word1: 'Đàn piano', word2: 'Đàn organ', hint: 'Nhạc cụ' },
  { word1: 'Trống hội', word2: 'Trống cajon ', hint: 'Nhạc cụ' },
  { word1: 'Nhạc bolero', word2: 'Nhạc cách mạng', hint: 'Thể loại nhạc' },


  // =Mục 21: Vật liệu & Vật chất=====================================
  { word1: 'Vàng', word2: 'Bạc', hint: 'Kim loại quý' },
  { word1: 'Gỗ', word2: 'Tre', hint: 'Vật liệu' },
  { word1: 'Sắt', word2: 'Thép', hint: 'Kim loại' },
  { word1: 'Nhựa', word2: 'Cao su', hint: 'Vật liệu' },
  { word1: 'Vải', word2: 'Da', hint: 'Vật liệu' },
  { word1: 'Giấy in', word2: 'Bìa cứng', hint: 'Vật liệu' },
  { word1: 'Gạch', word2: 'Ngói', hint: 'Vật liệu xây dựng' },
  { word1: 'Xi măng', word2: 'Vôi', hint: 'Vật liệu xây dựng' },
  { word1: 'Đồng', word2: 'Nhôm', hint: 'Kim loại' },
  { word1: 'Kim cương', word2: 'Pha lê', hint: 'Đá quý' },
  { word1: 'Vải cotton', word2: 'Vải lụa', hint: 'Vật liệu' },


  // =Mục 22: Nội thất================================================
  { word1: 'Ghế gỗ', word2: 'Ghế nhựa', hint: 'Nội thất' },
  { word1: 'Bàn gỗ', word2: 'Bàn kính', hint: 'Nội thất' },
  { word1: 'Tủ gỗ', word2: 'Tủ nhựa', hint: 'Nội thất' },
  { word1: 'Kệ sách', word2: 'Kệ giày', hint: 'Nội thất' },
  { word1: 'Ghế xoay', word2: 'Ghế tựa', hint: 'Nội thất' },
  { word1: 'Bàn làm việc', word2: 'Bàn học', hint: 'Nội thất' },
  { word1: 'Ghế sofa da', word2: 'Ghế sofa vải', hint: 'Nội thất' },
  { word1: 'Giường gỗ', word2: 'Giường sắt', hint: 'Nội thất' },
  { word1: 'Tủ lạnh 2 cánh', word2: 'Tủ lạnh 1 cánh', hint: 'Nội thất' },

  // =Mục 23: Cây cối=================================================
  { word1: 'Cây bàng', word2: 'Cây phượng', hint: 'Cây cảnh' },
  { word1: 'Cây mai', word2: 'Cây đào', hint: 'Cây cảnh' },
  { word1: 'Cây xương rồng', word2: 'Cây sen đá', hint: 'Cây cảnh' },
  { word1: 'Cây lúa', word2: 'Cây ngô', hint: 'Cây lương thực' },

  // =Mục 24: Hoa=====================================================
  { word1: 'Hoa hồng', word2: 'Hoa cúc', hint: 'Hoa' },
  { word1: 'Hoa sen', word2: 'Hoa súng', hint: 'Hoa' },

  // =Mục 25: Khái niệm & Trừu tượng==================================
  { word1: 'Con người', word2: 'Robot', hint: 'Sinh vật' },
  { word1: 'Kết hôn', word2: 'Hẹn hò', hint: 'Mối quan hệ' },
  { word1: 'Phim', word2: 'Kịch', hint: 'Nghệ thuật' },
  { word1: 'Truyện tranh', word2: 'Tiểu thuyết', hint: 'Sách' },
  { word1: 'Tranh vẽ', word2: 'Nhiếp ảnh', hint: 'Nghệ thuật' },
  { word1: 'Truyện ngắn', word2: 'Tiểu thuyết', hint: 'Văn học' },
  { word1: 'Thơ', word2: 'Văn xuôi', hint: 'Văn học' },
  { word1: 'Phật giáo', word2: 'Thiên Chúa giáo', hint: 'Tôn giáo' },
  { word1: 'Triết học', word2: 'Khoa học', hint: 'Học thuật' },
  { word1: 'Toán học', word2: 'Vật lý', hint: 'Khoa học' },
  { word1: 'Hóa học', word2: 'Sinh học', hint: 'Khoa học' },
  { word1: 'Lịch sử', word2: 'Địa lý', hint: 'Khoa học xã hội' },
  { word1: 'Kinh tế', word2: 'Chính trị', hint: 'Khoa học xã hội' },
  { word1: 'Hội họa', word2: 'Điêu khắc', hint: 'Nghệ thuật' },
  { word1: 'Kiến trúc', word2: 'Thiết kế nội thất', hint: 'Nghệ thuật' },
  { word1: 'Opera', word2: 'Nhạc kịch', hint: 'Nghệ thuật biểu diễn' },
  { word1: 'Xiếc', word2: 'Ảo thuật', hint: 'Nghệ thuật biểu diễn' },
  { word1: 'Truyền hình', word2: 'Phát thanh', hint: 'Truyền thông' },
  { word1: 'Tờ báo', word2: 'Tạp chí', hint: 'Truyền thông' },
  { word1: 'Mạng xã hội', word2: 'Diễn đàn', hint: 'Truyền thông' },
  { word1: 'Email', word2: 'Thư tay', hint: 'Giao tiếp' },
  { word1: 'Video call', word2: 'Gọi điện thoại', hint: 'Giao tiếp' },
  { word1: 'Đăng status', word2: 'Gửi confession', hint: 'Giao tiếp' },
  { word1: 'Làm việc từ xa', word2: 'Làm việc tại văn phòng', hint: 'Công việc' },
  { word1: 'Mua online', word2: 'Đi chợ', hint: 'Mua sắm' },
  { word1: 'Tiền mặt', word2: 'Chuyển khoản', hint: 'Thanh toán' },
  { word1: 'Thẻ tín dụng', word2: 'Thẻ ghi nợ', hint: 'Ngân hàng' },
  { word1: 'Tiết kiệm', word2: 'Đầu tư', hint: 'Tài chính' },
  { word1: 'Bảo hiểm nhân thọ', word2: 'Bảo hiểm y tế', hint: 'Bảo hiểm' },
  { word1: 'Căn hộ', word2: 'Nhà riêng', hint: 'Bất động sản' },
  { word1: 'Chung cư', word2: 'Biệt thự', hint: 'Bất động sản' },

  { word1: 'Băng gạc', word2: 'Bông gòn', hint: 'Dụng cụ y tế' },
  { word1: 'Nhiệt kế', word2: 'Máy đo huyết áp', hint: 'Dụng cụ y tế' },
  { word1: 'Cái nạng', word2: 'Xe lăn', hint: 'Dụng cụ y tế' },
  { word1: 'Khẩu trang', word2: 'Găng tay y tế', hint: 'Bảo hộ y tế' },
  { word1: 'Bình oxy', word2: 'Máy thở', hint: 'Thiết bị y tế' },
  { word1: 'Máy X-quang', word2: 'Máy siêu âm', hint: 'Thiết bị y tế' },

  { word1: 'Máy bào', word2: 'Máy mài', hint: 'Dụng cụ' },
  { word1: 'Máy cưa', word2: 'Máy khoan', hint: 'Dụng cụ' },
  { word1: 'Rìu', word2: 'Máy cưa', hint: 'Dụng cụ' },
  { word1: 'Xẻng', word2: 'Cuốc', hint: 'Dụng cụ' },

  { word1: 'Tripod', word2: 'Gimbal', hint: 'Thiết bị nhiếp ảnh' },
  { word1: 'Đèn flash', word2: 'Đèn livestream', hint: 'Thiết bị nhiếp ảnh' },

  { word1: 'Lều trại', word2: 'Túi ngủ cắm trại', hint: 'Đồ cắm trại' },
  { word1: 'La bàn', word2: 'Bản đồ', hint: 'Đồ cắm trại' },


  ];
  
  let currentDeck: WordPair[] = [];
  let deckIndex: number = 0;

  /**
   * Random số sử dụng crypto (tốt hơn Math.random)
   */
  function cryptoRandom(): number {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      return array[0] / (0xffffffff + 1);
    }
    // Fallback về Math.random nếu không có crypto
    return Math.random();
  }

  /**
   * Shuffle mảng sử dụng Fisher-Yates với crypto random
   */
  function shuffleDeck(array: WordPair[]): WordPair[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(cryptoRandom() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Lấy cặp từ ngẫu nhiên
   * - Không lặp cho đến khi hết bộ 600+ từ
   * - Tự động shuffle khi hết bộ
   */
  export function getRandomWordPair(): WordPair {
    // Khởi tạo hoặc shuffle lại khi hết
    if (deckIndex >= currentDeck.length) {
      currentDeck = shuffleDeck(vietnameseWordPairs);
      deckIndex = 0;
    }
    
    const pair = currentDeck[deckIndex];
    deckIndex++;
    return pair;
  }

  /**
   * Reset và shuffle lại từ đầu
   */
  export function resetWordDeck(): void {
    currentDeck = shuffleDeck(vietnameseWordPairs);
    deckIndex = 0;
  }

  /**
   * Xem còn bao nhiêu từ chưa dùng
   */
  export function getRemainingWords(): number {
    return currentDeck.length - deckIndex;
  }

  // Imposter word
  export const IMPOSTER_WORD = 'Kẻ giả mạo';

  /**
   * Lấy từ ngẫu nhiên cho civilian
   */
  export function getRandomCivilianWord(): string {
    const wordPair = getRandomWordPair();
    return cryptoRandom() < 0.5 ? wordPair.word1 : wordPair.word2;
}
