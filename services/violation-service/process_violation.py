import json
import boto3
import time
import os
from decimal import Decimal

# Kết nối DynamoDB
dynamodb = boto3.resource('dynamodb')
TABLE_NAME = os.environ.get('TABLE_NAME')
table = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    print("Received Event:", json.dumps(event))
    
    try:
        # 1. Lấy dữ liệu input
        # Lưu ý: Đảm bảo ESP32 gửi đúng key 'cccd'
        cccd_number = event.get('cccd', 'Unknown_CCCD') 
        device_id = event.get('id', 'Unknown_Device')
        officer_id = event.get('officer_id', 'Unknown_Officer')
        
        alcohol_val = event.get('alc', 0)
        bpm_val = event.get('bpm', 0)
        spo2_val = event.get('spo2', 0)
        
        # 2. Tạo timestamp (Dùng làm Sort Key)
        # Lưu ý: Terraform định nghĩa 'timestamp' là Number (N)
        current_timestamp = int(time.time()) 
        readable_time = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(current_timestamp))
        
        # 3. Tạo Item (CẤU TRÚC KHỚP VỚI TERRAFORM MỚI)
        item = {
            # --- KHÓA CHÍNH (Partition Key) ---
            'cccd': cccd_number, 
            
            # --- KHÓA PHỤ (Sort Key) ---
            'timestamp': current_timestamp,
            
            # --- Các thuộc tính khác ---
            'device_id': device_id,
            'officer_id': officer_id,
            'timestamp_human': readable_time,
            'alcohol_level': Decimal(str(alcohol_val)),
            'heart_rate': Decimal(str(bpm_val)),
            'spo2': Decimal(str(spo2_val))
        }
        
        # 4. Ghi vào DB
        table.put_item(Item=item)
        
        print(f"Saved violation for CCCD {cccd_number} at {readable_time}")
        
        return {
            'statusCode': 200,
            'body': json.dumps(f"Saved successfully. CCCD: {cccd_number}")
        }
        
    except Exception as e:
        print("Error:", str(e))
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error: {str(e)}")
        }