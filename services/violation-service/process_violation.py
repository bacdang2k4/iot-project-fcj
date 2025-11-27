import json
import boto3
import time
import os
import uuid # <--- Nhớ import
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
TABLE_NAME = os.environ.get('TABLE_NAME')
table = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    print("Received Event:", json.dumps(event))
    
    try:
        # 1. Lấy dữ liệu
        cccd_number = event.get('cccd', 'Unknown_CCCD') 
        device_id = event.get('id', 'Unknown_Device')
        officer_id = event.get('officer_id', 'Unknown_Officer')
        officer_name = event.get('officer_name', 'Unknown_Officer')

        alcohol_val = event.get('alc', 0)
        bpm_val = event.get('bpm', 0)
        spo2_val = event.get('spo2', 0)
        
        # 2. Tạo Metadata
        violation_uuid = str(uuid.uuid4()) # <--- TẠO UUID MỚI
        current_timestamp = int(time.time()) 
        readable_time = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(current_timestamp))
        
        # 3. Tạo Item
        item = {
            # --- KHÓA CHÍNH (Partition Key) LÀ UUID ---
            'violation_id': violation_uuid, 
            
            # --- KHÓA PHỤ (Sort Key) ---
            'timestamp': current_timestamp,
            
            # --- Các dữ liệu khác ---
            'cccd': cccd_number, # Bây giờ cccd chỉ là thuộc tính thường (có index)
            'device_id': device_id,
            'officer_id': officer_id,
            'officer_name': officer_name,
            'timestamp_human': readable_time,
            'alcohol_level': Decimal(str(alcohol_val)),
            'heart_rate': Decimal(str(bpm_val)),
            'spo2': Decimal(str(spo2_val))
        }
        
        # 4. Ghi vào DB
        table.put_item(Item=item)
        
        print(f"Saved violation {violation_uuid} for CCCD {cccd_number}")
        
        return {
            'statusCode': 200,
            'body': json.dumps(f"Saved. ID: {violation_uuid}")
        }
        
    except Exception as e:
        print("Error:", str(e))
        return {'statusCode': 500, 'body': json.dumps(str(e))}