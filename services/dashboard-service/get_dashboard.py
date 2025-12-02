import json
import boto3
import os
from decimal import Decimal
from boto3.dynamodb.conditions import Key, Attr

# Kết nối DynamoDB
dynamodb = boto3.resource('dynamodb')
TABLE_NAME = os.environ.get('TABLE_NAME')
table = dynamodb.Table(TABLE_NAME)

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            if obj % 1 == 0:
                return int(obj)
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    print("Dashboard Request:", event)
    
    try:
        # 1. Quét toàn bộ bảng (SCAN)
        response = table.scan()
        items = response.get('Items', [])
        
        # 2. Sắp xếp dữ liệu (Mới nhất lên đầu)
        items.sort(key=lambda x: x.get('timestamp', 0), reverse=True)
        
        # 3. (Tùy chọn) Chỉ lấy 50 bản ghi mới nhất để nhẹ payload
        recent_items = items
        
        print(f"Found {len(recent_items)} records.")

        # 4. Trả về kết quả chuẩn format API Gateway
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*', # Quan trọng: Cho phép mọi web gọi
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            'body': json.dumps(recent_items, cls=DecimalEncoder)
        }

    except Exception as e:
        print("Error:", str(e))
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({'error': str(e)})
        }