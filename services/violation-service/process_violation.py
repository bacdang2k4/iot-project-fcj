import json
import boto3
import time
import os
import uuid  # <--- Cần thư viện này để tạo ID duy nhất
from decimal import Decimal

# 1. Kết nối DynamoDB bằng biến môi trường (KHÔNG HARDCODE)
dynamodb = boto3.resource('dynamodb')
TABLE_NAME = os.environ.get('TABLE_NAME') # Lấy tên bảng từ Terraform
table = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    print("Received Event:", json.dumps(event)) # Dumps json để log đẹp hơn
    
    try:
        # 2. Lấy dữ liệu từ bản tin IoT
        # Lưu ý: Tên trường phải khớp với JSON mà ESP32 gửi lên
        device_id = event.get('id', 'Unknown_Device')
        officer_id = event.get('officer_id', 'Unknown_Officer') 
        cccd_number = event.get('cccd', 'Unknown_CCCD')
        
        # Xử lý số liệu an toàn
        alcohol_val = event.get('alc', 0)
        bpm_val = event.get('bpm', 0)
        spo2_val = event.get('spo2', 0)
        
        # 3. Tạo các trường dữ liệu hệ thống
        # Tạo ID duy nhất cho mỗi lần vi phạm (Khớp với Terraform Hash Key)
        violation_uuid = str(uuid.uuid4())
        
        # Tạo timestamp (Khớp với Terraform Range Key)
        current_timestamp_ms = int(time.time() * 1000) # Dùng mili giây chuẩn hơn
        readable_time = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(current_timestamp_ms/1000))
        
        # 4. Chuẩn bị Item (Cấu trúc này KHỚP với Terraform database module)
        item = {
            'violation_id': violation_uuid,         # Partition Key (Bắt buộc)
            'created_at': current_timestamp_ms,     # Sort Key (Bắt buộc)
            
            'cccd_number': cccd_number,             # GSI Key (Để tìm kiếm sau này)
            'officer_id': officer_id,
            'device_id': device_id,
            'timestamp_human': readable_time,
            
            # Convert sang Decimal để DynamoDB hiểu số thực
            'alcohol_level': Decimal(str(alcohol_val)),
            'heart_rate': Decimal(str(bpm_val)),
            'spo2': Decimal(str(spo2_val))
        }
        
        # 5. Ghi vào DB
        table.put_item(Item=item)
        
        print(f"Saved violation {violation_uuid} for CCCD {cccd_number}")
        
        return {
            'statusCode': 200,
            'body': json.dumps(f"Data stored successfully with ID: {violation_uuid}")
        }
        
    except Exception as e:
        print("Error:", str(e))
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error: {str(e)}")
        }