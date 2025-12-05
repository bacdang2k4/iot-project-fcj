#include "secrets.h" 
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <WiFi.h> 
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Keypad.h>
#include <Adafruit_Fingerprint.h> 
#include <ArduinoJson.h>          
#include <HardwareSerial.h>

// --- THƯ VIỆN MAX30102 ---
#include "MAX30105.h"
#include <spo2_algorithm.h> 

// ==========================================
// --- 1. CẤU HÌNH HỆ THỐNG ---
// ==========================================

#define TOPIC_LOGIN    "auth/login"
#define TOPIC_RESPONSE "auth/response"
#define TOPIC_SUBMIT   "violation/submit"

#define BASE_READING      571  
#define ALCOHOL_THRESHOLD 0.05 

#define MQ3_PIN    34
#define BUZZER_PIN 5
#define LED_PIN    18

// ==========================================
// --- 2. KHỞI TẠO ĐỐI TƯỢNG ---
// ==========================================

LiquidCrystal_I2C lcd(0x27, 16, 2);
WiFiClientSecure net = WiFiClientSecure();
PubSubClient client(net);

HardwareSerial mySerial(2);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

MAX30105 particleSensor;
uint32_t irBuffer[100]; 
uint32_t redBuffer[100]; 
int32_t bufferLength = 100;
int32_t spo2; 
int8_t validSPO2; 
int32_t heartRate; 
int8_t validHeartRate; 

const byte ROWS = 4;
const byte COLS = 4;
char keys[ROWS][COLS] = {
  {'1','2','3','A'}, {'4','5','6','B'}, {'7','8','9','C'}, {'*','0','#','D'}
};
byte rowPins[ROWS] = {13, 12, 14, 27};
byte colPins[COLS] = {26, 25, 33, 32};
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

// ==========================================
// --- 3. BIẾN TOÀN CỤC & TRẠNG THÁI ---
// ==========================================

// CẬP NHẬT CÁC TRẠNG THÁI MỚI
enum SystemState {
  ST_LOGIN,       
  ST_WAIT_AUTH,   
  ST_IDLE,        
  ST_MEASURE_ALCOHOL,    // 1. Đo Cồn
  ST_WAIT_HEART_TRIGGER, // 2. Chờ bấm B
  ST_MEASURE_HEART,      // 3. Đo Tim
  ST_CHECK_HEALTH,
  ST_INPUT_CCCD,  
  ST_SEND_DATA    
};
SystemState currentState = ST_LOGIN;

float valAlcohol = 0.0;
String userCCCD = "";
String deviceID = "ESP32_Device_dev";

int finalBPM = 0;
int finalSpO2 = 0;

String currentOfficerName = "";
String currentOfficerRealID = ""; 

// ==========================================
// --- 4. CÁC HÀM HỖ TRỢ ---
// ==========================================

void resetToIdle() {
  currentState = ST_IDLE;
  valAlcohol = 0; 
  finalBPM = 0;
  finalSpO2 = 0;
  userCCCD = "";
  
  lcd.clear();
  lcd.setCursor(0,0); lcd.print("He Thong San Sang");
  lcd.setCursor(0,1); lcd.print("Nhan B de Do");
}

int getFingerprintID() {
  uint8_t p = finger.getImage();
  if (p != FINGERPRINT_OK)  return -1;
  p = finger.image2Tz();
  if (p != FINGERPRINT_OK)  return -1;
  p = finger.fingerFastSearch();
  if (p == FINGERPRINT_OK) return finger.fingerID;
  return -1;
}

void messageHandler(char* topic, byte* payload, unsigned int length) {
  if (String(topic) == TOPIC_RESPONSE) {
    StaticJsonDocument<512> doc;
    deserializeJson(doc, payload, length);
    const char* status = doc["status"];
    
    if (strcmp(status, "SUCCESS") == 0) {
      currentOfficerName = String((const char*)doc["name"]);
      currentOfficerRealID = String((const char*)doc["officer_id"]);
      lcd.clear(); lcd.print("Xin chao:"); lcd.setCursor(0,1); lcd.print(currentOfficerName);
      delay(2000);
      resetToIdle();
    } else {
      lcd.clear(); lcd.print("Loi: ID Khong"); lcd.setCursor(0,1); lcd.print("ton tai tren DB");
      delay(2000);
      currentState = ST_LOGIN;
      lcd.clear(); lcd.print("MOI QUET VAN TAY");
    }
  }
}

void connectAWS() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  lcd.setCursor(0,0); lcd.print("WiFi Connecting.");
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }

  net.setCACert(AWS_CERT_CA);
  net.setCertificate(AWS_CERT_CRT);
  net.setPrivateKey(AWS_CERT_PRIVATE);
  client.setServer(AWS_IOT_ENDPOINT, 8883);
  client.setCallback(messageHandler);

  if (client.connect(deviceID.c_str())) {
    client.subscribe(TOPIC_RESPONSE); 
    lcd.clear(); lcd.print("AWS OK!");
  } else {
    lcd.clear(); lcd.print("AWS Failed!");
  }
  delay(1000);
}

// ==========================================
// --- 5. SETUP & LOOP ---
// ==========================================

void setup() {
  Serial.begin(115200);
  Wire.begin();
  lcd.init(); lcd.backlight();
  lcd.print("Khoi dong...");

  mySerial.begin(57600, SERIAL_8N1, 16, 17);
  if (finger.verifyPassword()) Serial.println("AS608 Found!");

  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("MAX30102 not found");
  } else {
    byte ledBrightness = 60; 
    byte sampleAverage = 4; 
    byte ledMode = 2; 
    int sampleRate = 100; 
    int pulseWidth = 411; 
    int adcRange = 4096; 
    particleSensor.setup(ledBrightness, sampleAverage, ledMode, sampleRate, pulseWidth, adcRange);
  }

  connectAWS();
  client.setBufferSize(512);
  pinMode(MQ3_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(LED_PIN, LOW);

  currentState = ST_LOGIN;
  lcd.clear(); lcd.print("MOI QUET VAN TAY");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
      client.loop(); 
  }

  char key = keypad.getKey();

  switch (currentState) {
    case ST_LOGIN:
      {
        int id = getFingerprintID();
        if (id > 0) {
          lcd.clear(); lcd.print("ID: "); lcd.print(id);
          StaticJsonDocument<200> doc;
          doc["device_id"] = deviceID;
          doc["finger_id"] = id;
          char jsonBuffer[200];
          serializeJson(doc, jsonBuffer);
          client.publish(TOPIC_LOGIN, jsonBuffer);
          currentState = ST_WAIT_AUTH;
        }
      }
      break;

    case ST_WAIT_AUTH:
      break;

    case ST_IDLE:
      if (key == 'B') {
        currentState = ST_MEASURE_ALCOHOL; // BƯỚC 1: ĐO CỒN
        lcd.clear(); lcd.print("1. Do Nong Do Con");
        delay(1000);
      }
      if (key == 'D') {
        currentState = ST_LOGIN;
        currentOfficerName = "";
        currentOfficerRealID = "";
        lcd.clear(); lcd.print("Da Dang Xuat!");
        delay(1000);
        lcd.clear(); lcd.print("MOI QUET VAN TAY");
      }
      break;

    // --- BƯỚC 1: ĐO NỒNG ĐỘ CỒN ---
    case ST_MEASURE_ALCOHOL:
      {
        int maxRaw = 0; 
        long startTime = millis();
        lcd.clear();

        // Đo trong 4 giây
        while (millis() - startTime < 4000) {
           int curr = analogRead(MQ3_PIN);
           if (curr > maxRaw) maxRaw = curr;
           
           lcd.setCursor(0,0); lcd.print("Thoi Manh..."); 
           lcd.setCursor(0,1); lcd.print("Time: "); lcd.print(4 - (millis()-startTime)/1000);
           delay(50);
        }

        // Tính kết quả cồn
        int diff = maxRaw - BASE_READING;
        if (diff < 0) diff = 0; 
        valAlcohol = (float)diff / 2000.0; 

        // Kiểm tra xem có hơi thở thật không
        if (maxRaw < (BASE_READING + 50)) {
           lcd.clear(); lcd.print("Loi: Thoi lai!");
           delay(2000);
           resetToIdle(); // Về màn hình chính đo lại
        } else {
           // Có thổi -> Hiển thị kết quả và chuyển sang chờ đo tim
           lcd.clear(); lcd.print("Con: "); lcd.print(valAlcohol); 
           lcd.setCursor(0,1); lcd.print("Nhan B Do Tim"); // Hướng dẫn bấm B
           
           // Chuyển sang trạng thái chờ
           currentState = ST_WAIT_HEART_TRIGGER;
        }
      }
      break;

    // --- BƯỚC 2: CHỜ BẤM B ĐỂ ĐO TIM (STATE MỚI) ---
    case ST_WAIT_HEART_TRIGGER:
      {
        // Ở đây hệ thống đứng yên, không làm gì cho đến khi bấm B
        if (key == 'B') {
           currentState = ST_MEASURE_HEART; // Chuyển sang đo tim
           lcd.clear(); lcd.print("2. Do Nhip Tim");
           lcd.setCursor(0,1); lcd.print("Dat tay & Giu...");
           delay(1000);
        }
      }
      break;

    // --- BƯỚC 3: ĐO TIM & OXI (ĐÃ NÂNG CẤP) ---
    case ST_MEASURE_HEART:
      {
        lcd.clear(); lcd.print("2. Do Nhip Tim");
        lcd.setCursor(0,1); lcd.print("Dat tay vao...");

        // 1. CHỜ NGƯỜI DÙNG ĐẶT TAY VÀO (IR > 50000)
        long waitFingerStart = millis();
        while (particleSensor.getIR() < 50000) {
           // Nếu chờ quá 10 giây không thấy tay thì quay về
           if (millis() - waitFingerStart > 10000) {
              lcd.clear(); lcd.print("Loi: Ko thay tay");
              delay(2000);
              resetToIdle();
              return; 
           }
           particleSensor.check(); // Cập nhật liên tục
           delay(10);
        }

        // 2. KHI THẤY TAY -> CHỜ 1.5 GIÂY CHO TÍN HIỆU ỔN ĐỊNH
        lcd.clear(); lcd.print("Giu nguyen tay...");
        lcd.setCursor(0,1); lcd.print("Dang on dinh...");
        
        long warmUpStart = millis();
        while (millis() - warmUpStart < 1500) {
           particleSensor.check(); // Vẫn đọc để xóa mẫu rác cũ
           particleSensor.nextSample();
        }

        // 3. BẮT ĐẦU THU THẬP DỮ LIỆU SẠCH (100 MẪU)
        lcd.clear(); lcd.print("Dang do...");
        
        for (byte i = 0 ; i < bufferLength ; i++) {
          while (particleSensor.available() == false) 
            particleSensor.check(); 
          
          redBuffer[i] = particleSensor.getRed();
          irBuffer[i]  = particleSensor.getIR();
          particleSensor.nextSample(); 

          // Check nếu rút tay ra giữa chừng -> Hủy
          if (irBuffer[i] < 50000) {
             lcd.clear(); lcd.print("Loi: Rut tay!");
             delay(2000);
             resetToIdle();
             return;
          }

          // Hiển thị thanh loading
          if (i % 20 == 0) {
             lcd.setCursor(0,1); 
             for(int k=0; k < (i/10); k++) lcd.print(".");
          }
        }

        // 4. TÍNH TOÁN
        maxim_heart_rate_and_oxygen_saturation(irBuffer, bufferLength, redBuffer, &spo2, &validSPO2, &heartRate, &validHeartRate);
        
        // Debug ra Serial để kiểm tra lỗi
        Serial.print("BPM: "); Serial.print(heartRate);
        Serial.print(" ValidBPM: "); Serial.print(validHeartRate);
        Serial.print(" SpO2: "); Serial.print(spo2);
        Serial.print(" ValidSpO2: "); Serial.println(validSPO2);

        if (validSPO2 == 1 && validHeartRate == 1 && spo2 <= 100 && heartRate < 200) {
           finalBPM = heartRate;
           finalSpO2 = spo2;
        } else {
           // Nếu đo lỗi, thử lấy giá trị trung bình hoặc gán lỗi
           finalBPM = 0; 
           finalSpO2 = 0;
           lcd.clear(); lcd.print("Do Loi !");
           lcd.setCursor(0,1); lcd.print("Thu lai...");
           delay(2000);
           // Cho phép đo lại bước này thay vì reset hết
           currentState = ST_WAIT_HEART_TRIGGER; 
           lcd.clear(); lcd.print("Nhan B Do lai");
           return;
        }

        // Hiển thị kết quả
        lcd.clear(); 
        lcd.print("Alc:"); lcd.print(valAlcohol, 2); 
        lcd.print(" SpO2:"); lcd.print(finalSpO2);
        lcd.setCursor(0,1); 
        lcd.print("BPM:"); lcd.print(finalBPM);
        
        delay(4000); 

        // Check Vi Phạm Cồn
        if(valAlcohol > 0.05) {
           lcd.clear(); lcd.print("VI PHAM CON!");
           delay(2000);
        }
        
        currentState = ST_CHECK_HEALTH;
      }
      break;

    case ST_CHECK_HEALTH:
      {
        bool violation = (valAlcohol > ALCOHOL_THRESHOLD);
        if (violation) {
          lcd.clear(); lcd.print("CANH BAO !!");
          lcd.setCursor(0,1); lcd.print("Con vuot muc!");
          
          digitalWrite(LED_PIN, HIGH);
          tone(BUZZER_PIN, 2000);   
          delay(2000);
          noTone(BUZZER_PIN);
          digitalWrite(LED_PIN, LOW);
          
          currentState = ST_INPUT_CCCD;
          userCCCD = "";
          lcd.clear(); lcd.print("Nhap CCCD:");
        } else {
          lcd.clear(); lcd.print("Kiem tra XONG");
          delay(2000);
          resetToIdle();
        }
      }
      break;

    case ST_INPUT_CCCD:
      {
         lcd.setCursor(0, 1); lcd.print(userCCCD); 
         if (key) {
            if (key >= '0' && key <= '9') {
              if (userCCCD.length() < 12) userCCCD += key;
            } 
            else if (key == '*') {
              userCCCD = "";
              lcd.setCursor(0,1); lcd.print("                ");
            } 
            else if (key == 'C') {
              if (userCCCD.length() == 12) {
                currentState = ST_SEND_DATA;
              } else {
                lcd.clear(); lcd.print("SAI DINH DANG!");
                delay(2000); userCCCD = ""; lcd.clear(); lcd.print("Nhap CCCD:");
              }
            }
         }
      }
      break;

    case ST_SEND_DATA:
      {
        lcd.clear(); lcd.print("Dang Gui AWS...");
        // --- KHẮC PHỤC: KIỂM TRA LẠI KẾT NỐI TRƯỚC KHI GỬI ---
        if (!client.connected()) {
           Serial.println("Mat ket noi! Dang ket noi lai...");
           connectAWS(); // Gọi hàm kết nối lại
           // Cần set lại buffer size sau khi connect lại (đề phòng)
           client.setBufferSize(512); 
        }
        client.loop(); // Duy trì kết nối
        StaticJsonDocument<512> doc;
        doc["id"] = deviceID;
        doc["officer_id"] = currentOfficerRealID; 
        doc["officer_name"] = currentOfficerName; 
        
        doc["cccd"] = userCCCD;
        doc["alc"] = valAlcohol;
        doc["bpm"] = finalBPM; 
        doc["spo2"] = finalSpO2;
        
        char jsonBuffer[512];
        serializeJson(doc, jsonBuffer);
        
        Serial.println("\n[Submit]: " + String(jsonBuffer));
        
        if (client.publish(TOPIC_SUBMIT, jsonBuffer)) {
          lcd.clear(); lcd.print("Gui Thanh Cong!");
        } else {
          lcd.clear(); lcd.print("Loi mang AWS!");
        }
        
        delay(3000);
        resetToIdle();
      }
      break;
  }
}