#include "secrets.h" 
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <WiFi.h> 
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Keypad.h>
#include <Adafruit_Fingerprint.h> // Thêm thư viện vân tay
#include <ArduinoJson.h>          // Thêm thư viện JSON
#include <HardwareSerial.h>

// ==========================================
// --- CẤU HÌNH HỆ THỐNG ---
// ==========================================

// Topic AWS
#define TOPIC_LOGIN    "auth/login"
#define TOPIC_RESPONSE "auth/response"
#define TOPIC_SUBMIT   "violation/submit"

// Cấu hình chân
#define MQ3_PIN 34
#define ALCOHOL_THRESHOLD 800 

// --- KHỞI TẠO ĐỐI TƯỢNG ---
LiquidCrystal_I2C lcd(0x27, 16, 2);
WiFiClientSecure net = WiFiClientSecure();
PubSubClient client(net);

// AS608 (Vân tay) - RX=16, TX=17
HardwareSerial mySerial(2);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

// Keypad
const byte ROWS = 4;
const byte COLS = 4;
char keys[ROWS][COLS] = {
  {'1','2','3','A'}, {'4','5','6','B'}, {'7','8','9','C'}, {'*','0','#','D'}
};
byte rowPins[ROWS] = {13, 12, 14, 27};
byte colPins[COLS] = {26, 25, 33, 32};
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

// --- BIẾN TRẠNG THÁI ---
enum SystemState {
  ST_LOGIN,       // Chờ quét vân tay đăng nhập
  ST_WAIT_AUTH,   // Chờ AWS trả lời
  ST_IDLE,        // Đăng nhập xong, chờ bấm B để đo
  ST_MEASURE_ALC, // Đo cồn
  ST_CHECK_HEALTH,// Kiểm tra kết quả
  ST_INPUT_CCCD,  // Nhập CCCD
  ST_SEND_DATA    // Gửi báo cáo
};
SystemState currentState = ST_LOGIN;

// Biến dữ liệu
int valAlcohol = 0;
String userCCCD = "";
String deviceID = "ESP32_Device_dev";

// Thông tin cán bộ (Sẽ được điền khi login thành công)
String currentOfficerName = "";
String currentOfficerRealID = ""; 

// --- HÀM RESET VỀ TRẠNG THÁI CHỜ ĐO ---
void resetToIdle() {
  currentState = ST_IDLE;
  valAlcohol = 0; 
  userCCCD = "";
  
  lcd.clear();
  lcd.setCursor(0,0); lcd.print("He Thong San Sang");
  lcd.setCursor(0,1); lcd.print("Nhan B de Do");
}

// --- HÀM XỬ LÝ TIN NHẮN TỪ AWS (CALLBACK) ---
// Đây là nơi nhận kết quả xác thực từ Lambda
void messageHandler(char* topic, byte* payload, unsigned int length) {
  Serial.print("AWS Msg: ");
  
  // Chỉ xử lý tin nhắn trả lời đăng nhập
  if (String(topic) == TOPIC_RESPONSE) {
    StaticJsonDocument<512> doc;
    deserializeJson(doc, payload, length);
    
    const char* status = doc["status"];
    
    if (strcmp(status, "SUCCESS") == 0) {
      // Đăng nhập thành công -> Lưu thông tin
      const char* name = doc["name"];
      const char* real_id = doc["officer_id"];
      
      currentOfficerName = String(name);
      currentOfficerRealID = String(real_id);
      
      Serial.println("Login OK: " + currentOfficerName);
      
      lcd.clear();
      lcd.print("Xin chao:");
      lcd.setCursor(0,1); lcd.print(currentOfficerName);
      delay(2000);
      
      // Mở khóa vào màn hình đo
      resetToIdle();
    } else {
      // Đăng nhập thất bại
      Serial.println("Login Failed");
      lcd.clear(); lcd.print("Loi: ID Khong");
      lcd.setCursor(0,1); lcd.print("ton tai tren DB");
      delay(2000);
      
      // Quay lại màn hình quét
      currentState = ST_LOGIN;
      lcd.clear(); lcd.print("MOI QUET VAN TAY");
    }
  }
}

// --- HÀM KẾT NỐI AWS ---
void connectAWS() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  lcd.setCursor(0,0); lcd.print("WiFi Connecting.");
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
    delay(500); Serial.print(".");
  }

  if(WiFi.status() != WL_CONNECTED){
     lcd.clear(); lcd.print("Loi WiFi !"); delay(2000); return; 
  }

  net.setCACert(AWS_CERT_CA);
  net.setCertificate(AWS_CERT_CRT);
  net.setPrivateKey(AWS_CERT_PRIVATE);
  client.setServer(AWS_IOT_ENDPOINT, 8883);
  
  // Đăng ký hàm nhận tin nhắn
  client.setCallback(messageHandler);

  lcd.clear(); lcd.print("AWS Connecting..");
  if (client.connect(deviceID.c_str())) {
    Serial.println("AWS Connected!");
    // Đăng ký lắng nghe topic phản hồi từ Lambda
    client.subscribe(TOPIC_RESPONSE); 
    lcd.clear(); lcd.print("AWS OK!");
  } else {
    Serial.println("AWS Failed!");
    lcd.clear(); lcd.print("AWS Failed!");
    Serial.println(client.state());
    // -2: Lỗi mạng/Socket
    // -4: Timeout
    // -5: Sai chứng chỉ (Unauthorized) hoặc Sai giờ hệ thống
    lcd.clear(); lcd.print("Err Code: "); lcd.print(client.state());
  }
  delay(1000);
}

// --- HÀM LẤY ID VÂN TAY ---
int getFingerprintID() {
  uint8_t p = finger.getImage();
  if (p != FINGERPRINT_OK)  return -1;

  p = finger.image2Tz();
  if (p != FINGERPRINT_OK)  return -1;

  p = finger.fingerFastSearch();
  if (p == FINGERPRINT_OK) {
    return finger.fingerID;
  } 
  return -1;
}

void setup() {
  Serial.begin(115200);
  Wire.begin();
  lcd.init(); lcd.backlight();
  lcd.setCursor(0,0); lcd.print("Khoi dong...");

  // Init AS608
  mySerial.begin(57600, SERIAL_8N1, 16, 17);
  if (finger.verifyPassword()) {
    Serial.println("AS608 Found!");
  } else {
    lcd.clear(); lcd.print("Loi AS608!");
    while(1);
  }

  connectAWS();
  pinMode(MQ3_PIN, INPUT);
  
  // Vào trạng thái đăng nhập đầu tiên
  currentState = ST_LOGIN;
  lcd.clear(); 
  lcd.print("MOI QUET VAN TAY");
  lcd.setCursor(0,1); lcd.print("DE DANG NHAP");
}

void loop() {
  // Duy trì kết nối MQTT và nhận tin nhắn
  if (WiFi.status() == WL_CONNECTED) {
      if (!client.connected()) {
         // Reconnect logic giản lược
      }
      client.loop(); 
  }

  char key = keypad.getKey();

  switch (currentState) {
    
    // --- 1. ĐĂNG NHẬP ---
    case ST_LOGIN:
      {
        int id = getFingerprintID();
        if (id > 0) {
          lcd.clear(); 
          lcd.print("Da thay ID: "); lcd.print(id);
          lcd.setCursor(0,1); lcd.print("Dang xac thuc...");
          
          // Gửi JSON login lên AWS
          StaticJsonDocument<200> doc;
          doc["device_id"] = deviceID;
          doc["finger_id"] = id;
          char jsonBuffer[200];
          serializeJson(doc, jsonBuffer);
          
          client.publish(TOPIC_LOGIN, jsonBuffer);
          
          // Chuyển sang chờ phản hồi
          currentState = ST_WAIT_AUTH;
        }
      }
      break;

    // --- 1.5 CHỜ AWS PHẢN HỒI ---
    case ST_WAIT_AUTH:
      // Không làm gì cả, chỉ chờ messageHandler được kích hoạt
      // Nếu muốn timeout thì thêm logic đếm giờ ở đây
      break;

    // --- 2. CHỜ LỆNH ĐO (SAU KHI ĐĂNG NHẬP) ---
    case ST_IDLE:
      if (key == 'B') {
        currentState = ST_MEASURE_ALC;
        lcd.clear(); lcd.print("Chuan bi thoi...");
        delay(1000);
      }
      // Nút đăng xuất (VD: nút D)
      if (key == 'D') {
        currentState = ST_LOGIN;
        currentOfficerName = "";
        currentOfficerRealID = "";
        lcd.clear(); lcd.print("Da Dang Xuat!");
        delay(1000);
        lcd.clear(); lcd.print("MOI QUET VAN TAY");
      }
      break;

    // --- 3. ĐO CỒN ---
    case ST_MEASURE_ALC:
      {
        long startTime = millis();
        int maxAlc = 0;
        lcd.clear();
        
        while (millis() - startTime < 3000) {
          int curr = analogRead(MQ3_PIN);
          if (curr > maxAlc) maxAlc = curr;
          lcd.setCursor(0,0); lcd.print("Thoi Manh! "); lcd.print(3 - (millis()-startTime)/1000);
          lcd.setCursor(0,1); lcd.print("Val: "); lcd.print(curr); lcd.print("   ");
          delay(50);
        }

        if (maxAlc < 100) {
           lcd.clear(); lcd.print("Loi: Thoi lai!");
           delay(2000);
           resetToIdle();
        } else {
           valAlcohol = maxAlc;
           lcd.clear(); 
           lcd.print("Con: "); lcd.print(valAlcohol);
           if(valAlcohol > ALCOHOL_THRESHOLD) lcd.print(" CAO");
           else lcd.print(" OK");
           
           // Bỏ qua tim, nhảy sang check luôn
           delay(2000);
           currentState = ST_CHECK_HEALTH;
        }
      }
      break;

    // --- 4. CHECK KẾT QUẢ ---
    case ST_CHECK_HEALTH:
      {
        lcd.clear();
        bool violation = false;
        if (valAlcohol > ALCOHOL_THRESHOLD) violation = true;

        if (violation) {
          lcd.print("CANH BAO !!");
          lcd.setCursor(0,1); lcd.print("Con vuot muc!");
          delay(2000);
          currentState = ST_INPUT_CCCD;
          userCCCD = "";
          lcd.clear(); lcd.print("Nhap CCCD:");
        } else {
          lcd.print("Kiem tra XONG");
          lcd.setCursor(0,1); lcd.print("Khong vi pham");
          delay(3000);
          resetToIdle();
        }
      }
      break;

    // --- 5. NHẬP CCCD ---
    case ST_INPUT_CCCD:
      {
         lcd.setCursor(0, 1); lcd.print(userCCCD); 
         if (key) {
            if (key >= '0' && key <= '9') {
              if (userCCCD.length() < 12) userCCCD += key;
            } else if (key == '*') {
              userCCCD = "";
              lcd.setCursor(0,1); lcd.print("                ");
            } else if (key == 'C') {
              if (userCCCD.length() > 0) currentState = ST_SEND_DATA;
            }
         }
      }
      break;

    // --- 6. GỬI BÁO CÁO VI PHẠM ---
    case ST_SEND_DATA:
      lcd.clear(); lcd.print("Dang Gui AWS...");
      
      StaticJsonDocument<300> doc;
      doc["id"] = deviceID;
      // Dùng ID thật lấy được từ lúc đăng nhập
      doc["officer_id"] = currentOfficerRealID; 
      // Gửi thêm tên cho dễ quản lý (tuỳ chọn)
      doc["officer_name"] = currentOfficerName; 
      
      doc["cccd"] = userCCCD;
      doc["alc"] = valAlcohol;
      doc["bpm"] = 0; // Sensor hỏng
      doc["spo2"] = 0;
      
      char jsonBuffer[300];
      serializeJson(doc, jsonBuffer);
      
      Serial.println("\n[Submit]: " + String(jsonBuffer));
      
      if (client.publish(TOPIC_SUBMIT, jsonBuffer)) {
        lcd.clear(); lcd.print("Gui Thanh Cong!");
      } else {
        lcd.clear(); lcd.print("Loi mang AWS!");
      }
      
      delay(3000);
      resetToIdle();
      break;
  }
}