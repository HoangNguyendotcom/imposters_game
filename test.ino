// HỆ THỐNG TƯỚI NƯỚC TỰ ĐỘNG - TEST BƠM 12V
// TẠM THỜI VÔ HIỆU HÓA BƠM 5V

// ===== KHAI BÁO CHÂN PIN =====
#define RELAY_PUMP_12V 7      // Relay K1 - Bơm 12V (tưới định kỳ)
#define RELAY_PUMP_5V 8       // Relay K2 - Bơm 5V (tưới theo độ ẩm)
#define SOIL_SENSOR A0        // Cảm biến độ ẩm đất

#define LED_ONBOARD 13        // LED onboard Arduino

// ===== CÀI ĐẶT HỆ THỐNG =====
#define PUMP_12V_DURATION 30000    // Bơm 12V chạy 30 giây (30000ms)
#define PUMP_12V_INTERVAL 60000    // Chu kỳ 1 phút (60000ms) - TEST

// VÔ HIỆU HÓA BƠM 5V - KHÔNG SỬ DỤNG
#define ENABLE_PUMP_5V false       // Đổi thành true để bật lại bơm 5V

#define SOIL_DRY_THRESHOLD 600     // Ngưỡng đất khô (>600 = cần tưới)
#define SOIL_WET_THRESHOLD 400     // Ngưỡng đất ẩm (<400 = đủ ẩm)
#define PUMP_5V_DURATION 30000     // Bơm 5V mỗi lần tưới 30 giây
#define SOIL_CHECK_INTERVAL 5000   // Kiểm tra độ ẩm mỗi 5 giây

// ===== BIẾN TOÀN CỤC =====
unsigned long lastPump12VTime = 0;     // Thời điểm bơm 12V lần cuối
unsigned long pump12VStartTime = 0;    // Thời điểm bắt đầu bơm 12V
bool isPump12VRunning = false;         // Trạng thái bơm 12V

unsigned long lastSoilCheckTime = 0;   // Thời điểm kiểm tra độ ẩm lần cuối
unsigned long pump5VStartTime = 0;     // Thời điểm bắt đầu bơm 5V
bool isPump5VRunning = false;          // Trạng thái bơm 5V
bool needWatering = false;             // Cờ báo cần tưới

int currentMode = 0;                   // 0=Normal, 1=Schedule(12V), 2=Auto(5V)

// Biến cho LED nhấp nháy
unsigned long lastLEDToggle = 0;
bool ledState = false;
int blinkPattern = 0; // 0=sáng liên tục, 1=nháy chậm, 2=nháy nhanh

void setup() {
  Serial.begin(9600);
  
  // Cấu hình chân relay (LOW = ON relay, HIGH = OFF relay)
  pinMode(RELAY_PUMP_12V, OUTPUT);
  pinMode(RELAY_PUMP_5V, OUTPUT);
  digitalWrite(RELAY_PUMP_12V, HIGH);  // Tắt bơm ban đầu
  digitalWrite(RELAY_PUMP_5V, HIGH);   // Tắt bơm ban đầu (giữ tắt)
  
  // Cấu hình LED onboard
  pinMode(LED_ONBOARD, OUTPUT);
  digitalWrite(LED_ONBOARD, HIGH); // Mode bình thường - sáng liên tục
  
  Serial.println("======================================");
  Serial.println("=== HE THONG TUOI NUOC TU DONG ===");
  Serial.println("======================================");
  Serial.println("MODE TEST: CHI BOM 12V");
  Serial.println("");
  Serial.println("Cau hinh:");
  Serial.println("- Bom 12V: Tuoi moi 1 PHUT, chay 30 GIAY");
  Serial.println("- Bom 5V: VO HIEU HOA");
  Serial.println("- LED: Sang lien tuc = cho, Nhay cham = dang bom");
  Serial.println("======================================");
  Serial.println("He thong da san sang! Doi 1 phut...\n");
  
  lastPump12VTime = millis(); // Bắt đầu đếm chu kỳ
}

void loop() {
  unsigned long currentTime = millis();
  
  // Hiển thị thời gian đếm ngược (mỗi 10 giây)
  static unsigned long lastCountdown = 0;
  if (currentTime - lastCountdown >= 10000 && !isPump12VRunning) {
    unsigned long timeRemaining = PUMP_12V_INTERVAL - (currentTime - lastPump12VTime);
    Serial.print("Thoi gian con lai: ");
    Serial.print(timeRemaining / 1000);
    Serial.println(" giay");
    lastCountdown = currentTime;
  }
  
  // ===== XỬ LÝ BƠM 12V (TƯỚI ĐỊNH KỲ) =====
  if (!isPump12VRunning) {
    // Kiểm tra đã đủ 1 phút chưa
    if (currentTime - lastPump12VTime >= PUMP_12V_INTERVAL) {
      startPump12V();
    }
  } else {
    // Kiểm tra đã chạy đủ 30 giây chưa
    if (currentTime - pump12VStartTime >= PUMP_12V_DURATION) {
      stopPump12V();
    }
  }
  
  // ===== BƠM 5V BỊ VÔ HIỆU HÓA =====
  // Nếu muốn bật lại, đổi ENABLE_PUMP_5V = true ở trên
  if (ENABLE_PUMP_5V && !isPump12VRunning) {
    // Kiểm tra độ ẩm định kỳ
    if (currentTime - lastSoilCheckTime >= SOIL_CHECK_INTERVAL) {
      checkSoilMoisture();
      lastSoilCheckTime = currentTime;
    }
    
    // Xử lý bơm 5V
    if (!isPump5VRunning && needWatering) {
      startPump5V();
    } else if (isPump5VRunning) {
      if ((currentTime - pump5VStartTime >= PUMP_5V_DURATION) || !needWatering) {
        stopPump5V();
      }
    }
  }
  
  // Cập nhật LED theo mode hiện tại
  updateLED();
}

// ===== HÀM KIỂM TRA ĐỘ ẨM ĐẤT =====
void checkSoilMoisture() {
  int soilValue = analogRead(SOIL_SENSOR);
  
  Serial.print("Do am dat: ");
  Serial.print(soilValue);
  
  if (soilValue > SOIL_DRY_THRESHOLD) {
    if (!needWatering) {
      needWatering = true;
      Serial.println(" -> DAT KHO - Cần tuoi!");
    } else {
      Serial.println(" -> Dang kho");
    }
  } else if (soilValue < SOIL_WET_THRESHOLD) {
    if (needWatering) {
      needWatering = false;
      Serial.println(" -> DAT DU AM - Dung tuoi!");
    } else {
      Serial.println(" -> Du am");
    }
  } else {
    Serial.println(" -> Trung binh");
  }
}

// ===== HÀM ĐIỀU KHIỂN BƠM 12V =====
void startPump12V() {
  digitalWrite(RELAY_PUMP_12V, LOW);  // Bật relay (LOW = ON)
  isPump12VRunning = true;
  pump12VStartTime = millis();
  lastPump12VTime = millis(); // Reset chu kỳ KHI BẬT bơm
  currentMode = 1;
  blinkPattern = 1; // Nháy chậm
  lastLEDToggle = millis(); // QUAN TRỌNG: Reset thời gian LED
  ledState = true; // Bắt đầu từ trạng thái sáng
  digitalWrite(LED_ONBOARD, HIGH); // Set LED sáng ngay
  
  Serial.println("");
  Serial.println("======================================");
  Serial.println(">>> BAT BOM 12V");
  Serial.println("    Relay K1: ON (Chan D7 = LOW)");
  Serial.println("    Thoi gian chay: 30 giay");
  Serial.println("    LED: NHAY CHAM - Bat dau");
  Serial.print("    Chu ky tiep theo: ");
  Serial.print(PUMP_12V_INTERVAL / 1000);
  Serial.println(" giay ke tu bay gio");
  Serial.print("    blinkPattern = ");
  Serial.println(blinkPattern);
  Serial.println("======================================");
}

void stopPump12V() {
  digitalWrite(RELAY_PUMP_12V, HIGH); // Tắt relay
  isPump12VRunning = false;
  // KHÔNG RESET lastPump12VTime ở đây!
  // Chu kỳ tính từ lúc BẬT bơm, không phải TẮT bơm
  
  currentMode = 0;
  blinkPattern = 0; // Sáng liên tục
  digitalWrite(LED_ONBOARD, HIGH);
  
  // Tính thời gian còn lại đến chu kỳ tiếp theo
  unsigned long timeUntilNext = PUMP_12V_INTERVAL - (millis() - lastPump12VTime);
  
  Serial.println("");
  Serial.println("======================================");
  Serial.println("<<< TAT BOM 12V");
  Serial.println("    Relay K1: OFF (Chan D7 = HIGH)");
  Serial.println("    LED: SANG LIEN TUC");
  Serial.print("    Chu ky tiep theo sau: ");
  Serial.print(timeUntilNext / 1000);
  Serial.println(" giay");
  Serial.println("======================================");
  Serial.println("");
}

// ===== HÀM ĐIỀU KHIỂN BƠM 5V =====
void startPump5V() {
  digitalWrite(RELAY_PUMP_5V, LOW);
  isPump5VRunning = true;
  pump5VStartTime = millis();
  currentMode = 2;
  blinkPattern = 2;
  lastLEDToggle = millis(); // QUAN TRỌNG: Reset thời gian LED
  ledState = false; // Bắt đầu từ trạng thái tắt
  
  Serial.println("\n>>> BAT BOM 5V - Tuoi tu dong");
  Serial.println("    LED: NHAY NHANH");
}

void stopPump5V() {
  digitalWrite(RELAY_PUMP_5V, HIGH);
  isPump5VRunning = false;
  currentMode = 0;
  blinkPattern = 0;
  digitalWrite(LED_ONBOARD, HIGH);
  
  Serial.println("<<< TAT BOM 5V");
  Serial.println("    LED: SANG LIEN TUC\n");
}

// ===== HÀM CẬP NHẬT LED THEO PATTERN =====
void updateLED() {
  unsigned long currentTime = millis();
  unsigned long blinkInterval;
  
  switch(blinkPattern) {
    case 0: // Mode bình thường - sáng liên tục
      if (ledState != true) { // Chỉ set khi cần
        ledState = true;
        digitalWrite(LED_ONBOARD, HIGH);
      }
      break;
      
    case 1: // Mode tưới định kỳ - nháy chậm (1 giây)
      blinkInterval = 1000;
      if (currentTime - lastLEDToggle >= blinkInterval) {
        ledState = !ledState;
        digitalWrite(LED_ONBOARD, ledState ? HIGH : LOW);
        lastLEDToggle = currentTime;
        
      }
      break;
      
    case 2: // Mode tưới tự động - nháy nhanh (0.3 giây)
      blinkInterval = 300;
      if (currentTime - lastLEDToggle >= blinkInterval) {
        ledState = !ledState;
        digitalWrite(LED_ONBOARD, ledState ? HIGH : LOW);
        lastLEDToggle = currentTime;

      }
      break;
  }
}