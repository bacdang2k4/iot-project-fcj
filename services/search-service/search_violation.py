import json
import boto3
import os
from decimal import Decimal
from boto3.dynamodb.conditions import Key

# Kết nối DynamoDB
dynamodb = boto3.resource('dynamodb')
TABLE_NAME = os.environ.get('TABLE_NAME')
table = dynamodb.Table(TABLE_NAME)

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    print("Search Request:", event)
    
    try:
        # 1. Lấy tham số CCCD từ URL (Query String)
        # Ví dụ: /search?cccd=123456
        query_params = event.get('queryStringParameters', {})
        cccd_number = query_params.get('cccd', None)
        
        if not cccd_number:
            return {
                'statusCode': 400,
                'headers': { 'Access-Control-Allow-Origin': '*' },
                'body': json.dumps({'message': 'Missing cccd parameter'})
            }

        # 2. QUERY vào bảng DynamoDB (Dùng Index CCCDIndex)
        # IndexName='CCCDIndex' phải khớp với tên trong Terraform database
        response = table.query(
            IndexName='CCCDIndex', 
            KeyConditionExpression=Key('cccd').eq(cccd_number)
        )
        
        items = response.get('Items', [])
        
        # Sắp xếp kết quả mới nhất lên đầu
        items.sort(key=lambda x: x.get('timestamp', 0), reverse=True)
        
        print(f"Found {len(items)} violations for CCCD {cccd_number}")

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*', # Public Access
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            'body': json.dumps(items, cls=DecimalEncoder)
        }

    except Exception as e:
        print("Error:", str(e))
        return {
            'statusCode': 500,
            'headers': { 'Access-Control-Allow-Origin': '*' },
            'body': json.dumps({'error': str(e)})
        }