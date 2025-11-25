import json
import boto3
import os # <--- Bắt buộc phải có để đọc biến môi trường
from decimal import Decimal

# 1. Kết nối DynamoDB và IoT Core
dynamodb = boto3.resource('dynamodb')
iot = boto3.client('iot-data') # Client này để gửi tin nhắn về ESP32

# Lấy tên bảng từ Terraform truyền vào (KHÔNG HARDCODE)
TABLE_NAME = os.environ.get('TABLE_NAME')
table = dynamodb.Table(TABLE_NAME)

# Helper để convert Decimal sang float/int khi dumps JSON (tránh lỗi TypeError)
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    print("Login Request:", event)
    
    # Lấy thông tin từ ESP32 gửi lên
    device_id = event.get('device_id')
    # finger_id gửi lên có thể là int hoặc string, DB lưu là Number
    finger_id = event.get('finger_id')
    
    # Nếu finger_id là int, giữ nguyên. Nếu là string, convert sang int (vì DB lưu Number)
    if isinstance(finger_id, str) and finger_id.isdigit():
        finger_id = int(finger_id)

    # Topic để trả lời về ESP32
    response_topic = 'auth/response'
    
    try:
        # 2. Truy vấn DynamoDB
        response = table.get_item(
            Key={
                'device_id': device_id,
                'finger_id': finger_id
            }
        )
        
        # 3. Xử lý kết quả
        if 'Item' in response:
            item = response['Item']
            payload = {
                "status": "SUCCESS",
                "name": item.get('officer_name', 'Unknown'),
                "officer_id": item.get('officer_id', 'Unknown')
            }
            print(f"Found Officer: {payload['name']}")
            
        else:
            print(f"Officer not found for device {device_id} finger {finger_id}")
            payload = {
                "status": "FAIL",
                "message": "User not found"
            }
            
        # 4. Gửi kết quả về lại ESP32 (Publish MQTT)
        # Lưu ý: Cần quyền iot:Publish trong Terraform
        iot.publish(
            topic=response_topic,
            qos=1,
            payload=json.dumps(payload, cls=DecimalEncoder)
        )
        
    except Exception as e:
        print("Error:", str(e))
        payload = {"status": "ERROR", "message": str(e)}
        # Cố gắng gửi lỗi về cho thiết bị biết
        try:
            iot.publish(topic=response_topic, qos=1, payload=json.dumps(payload))
        except:
            pass

    return payload