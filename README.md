# 🍺 IoT-Based Alcohol Violation Detection System

> Hệ thống IoT giám sát, phát hiện và xử lý vi phạm nồng độ cồn sử dụng kiến trúc Serverless trên AWS.

![Project Status](https://img.shields.io/badge/Status-Development-green)
![Terraform](https://img.shields.io/badge/IaC-Terraform-purple)
![AWS](https://img.shields.io/badge/Cloud-AWS_Serverless-orange)
![React](https://img.shields.io/badge/Frontend-ReactJS_Vite-blue)

## 📖 Giới thiệu
Dự án này là giải pháp toàn diện kết hợp giữa phần cứng (IoT) và điện toán đám mây (Cloud Computing) nhằm giải quyết vấn đề giám sát nồng độ cồn. Hệ thống cho phép:
1. Thu thập dữ liệu nồng độ cồn và nhịp tim từ thiết bị đo tại hiện trường.
2. Xử lý, lưu trữ và phân loại vi phạm tự động trên AWS.
3. Cung cấp Dashboard theo dõi thời gian thực và tra cứu lịch sử vi phạm.

## 🏗 Kiến trúc hệ thống
Hệ thống hoạt động theo mô hình **Event-Driven Architecture**:

1. **IoT Device (ESP32):** Gửi dữ liệu cảm biến qua giao thức MQTTs đến **AWS IoT Core**.
2. **Backend (Serverless):**
   - **AWS IoT Core Rules:** Kích hoạt Lambda Function khi có dữ liệu mới.
   - **AWS Lambda:** Xử lý logic nghiệp vụ (Process Violation, Auth Officer).
   - **Amazon DynamoDB:** Lưu trữ dữ liệu vi phạm và thông tin cán bộ.
3. **Frontend:**
   - Website ReactJS hiển thị Dashboard và công cụ tìm kiếm.
   - Được host trên **AWS Amplify**.
   - Giao tiếp với Backend qua **Amazon API Gateway**.
4. **DevOps:**
   - Toàn bộ hạ tầng được quản lý bằng **Terraform** (IaC).
   - Quy trình CI/CD tự động bằng **GitHub Actions**.
   
![Sơ đồ kiến trúc hệ thống](./assets/architecture-diagram.png)

## 📂 Cấu trúc dự án (Monorepo)

```bash
iot-project-fcj/
├── firmwares/          # Mã nguồn nhúng cho ESP32 (C++/Arduino)
├── frontend/           # Mã nguồn Web App (ReactJS + Vite + Tailwind)
├── infrastructure/     # Mã nguồn hạ tầng Terraform
│   ├── modules/        # Các module tái sử dụng (API, DB, Lambda...)
│   └── environments/   # Cấu hình cho từng môi trường (Dev, Prod)
├── services/           # Mã nguồn Backend (Python Lambda Functions)
│   ├── auth-service/       # Xác thực cán bộ
│   ├── dashboard-service/  # Lấy dữ liệu hiển thị biểu đồ
│   ├── search-service/     # Tra cứu vi phạm theo CCCD
│   └── violation-service/  # Xử lý logic vi phạm nồng độ cồn
└── .github/workflows/  # Cấu hình CI/CD Pipeline
```

## 🚀 Cài đặt & Triển khai

### 1. Yêu cầu (Prerequisites)
- **AWS Account** (Access Key & Secret Key).
- **Terraform** (v1.0+).
- **Node.js** (v18+).
- **PlatformIO** hoặc **Arduino IDE** (cho phần cứng).

### 2. Triển khai Hạ tầng (Infrastructure)
Dự án sử dụng Terraform để dựng toàn bộ hạ tầng AWS.

```bash
# Di chuyển vào thư mục môi trường Dev
cd infrastructure/environments/dev

# Khởi tạo Terraform (tải provider và modules)
terraform init

# Xem trước kế hoạch triển khai
terraform plan

# Thực thi triển khai lên AWS
terraform apply
```
*Lưu ý: Bạn cần cấu hình AWS Credentials trên máy hoặc thông qua biến môi trường trước khi chạy lệnh.*

### 3. Nạp Code cho thiết bị (Hardware)
1. Mở thư mục `firmwares/` bằng **VS Code** (Khuyên dùng extension **PlatformIO**).
2. Tạo file cấu hình bí mật (ví dụ `secrets.h`) để điền thông tin WiFi và AWS Endpoint.
3. Kết nối ESP32 với máy tính.
4. Bấm **Upload** để nạp code xuống thiết bị.
#### 📝 Cấu hình File `secrets.h`
Để thiết bị kết nối được WiFi và AWS, bạn cần tạo một file tên là `secrets.h` nằm cùng thư mục với file code chính (`main.cpp` hoặc `.ino`). Copy nội dung mẫu dưới đây và điền thông tin của bạn vào:

```cpp
#ifndef SECRETS_H
#define SECRETS_H

#include <pgmspace.h>

#define SECRET

// 1. Cấu hình WiFi
const char WIFI_SSID[] = "TEN_WIFI_CUA_BAN";     // Ví dụ: "MyHomeWiFi"
const char WIFI_PASSWORD[] = "MAT_KHAU_WIFI";    // Ví dụ: "12345678"

// 2. Cấu hình AWS IoT Endpoint
// Lấy tại AWS Console -> IoT Core -> Settings -> Endpoint
const char AWS_IOT_ENDPOINT[] = "xxxxxxxxxxxxxx-ats.iot.ap-southeast-1.amazonaws.com";

// 3. Amazon Root CA 1
// Copy toàn bộ nội dung từ file AmazonRootCA1.pem
static const char AWS_CERT_CA[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
PASTE YOUR AMAZON ROOT CA 1 CONTENT HERE
...
-----END CERTIFICATE-----
)EOF";

// 4. Device Certificate
// Copy toàn bộ nội dung từ file xxxxx-certificate.pem.crt
static const char AWS_CERT_CRT[] PROGMEM = R"KEY(
-----BEGIN CERTIFICATE-----
PASTE YOUR DEVICE CERTIFICATE CONTENT HERE
...
-----END CERTIFICATE-----
)KEY";

// 5. Device Private Key
// Copy toàn bộ nội dung từ file xxxxx-private.pem.key
// ⚠️ QUAN TRỌNG: Không được lộ key này ra ngoài
static const char AWS_CERT_PRIVATE[] PROGMEM = R"KEY(
-----BEGIN RSA PRIVATE KEY-----
PASTE YOUR PRIVATE KEY CONTENT HERE
...
-----END RSA PRIVATE KEY-----
)KEY";

#endif
```

### 4. Chạy Frontend (Local)
Sau khi deploy hạ tầng xong, bạn sẽ nhận được `api_endpoint` từ Terraform output. Hãy dùng nó để cấu hình cho Frontend.

```bash
# Di chuyển vào thư mục Frontend
cd frontend

# Cài đặt các thư viện cần thiết
npm install

# Tạo file .env (nếu cần) và điền API URL
# VITE_API_URL=https://xyz.execute-api.ap-southeast-1.amazonaws.com

# Chạy dự án dưới local
npm run dev
```

## 🛠 Công nghệ sử dụng
- **Phần cứng:** ESP32, Cảm biến MQ-3, Màn hình LCD/OLED.
- **Cloud (AWS):** IoT Core, Lambda (Python), DynamoDB, API Gateway, Amplify.
- **Frontend:** ReactJS, Vite, Tailwind CSS, Recharts.
- **DevOps:** Terraform, GitHub Actions.

## 🛡 Bảo mật
- **API Gateway:** Được bảo vệ bởi Throttling và Rate Limiting.
- **Database:** Sử dụng IAM Role với nguyên tắc Least Privilege (Quyền tối thiểu).
- **Frontend:** HTTPS (SSL/TLS) tự động qua Amplify.

## 👨‍💻 Tác giả
- **Đặng Đình Bắc** ([@bacdang2k4](https://github.com/bacdang2k4))
- **Dương Hải Nam** ([@Namisme2k4](https://github.com/Namisme2k4))
- **Trần Quốc Dinh** ([@DinhTQSE](https://github.com/DinhTQSE))
- **Phạm Viết Lợi** ([@Loiprofpt](https://github.com/Loiprofpt))
- Đồ án chương trình First Cloud Journey - AWS Hồ Chí Minh
