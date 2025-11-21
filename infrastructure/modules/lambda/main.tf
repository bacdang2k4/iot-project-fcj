# infrastructure/modules/lambda/main.tf

variable "environment" {
  description = "Môi trường (dev/prod)"
  type        = string
}

variable "table_arn" {
  description = "ARN của bảng DynamoDB để cấp quyền ghi"
  type        = string
}

# 1. Tạo file code dummy để deploy lần đầu (tránh lỗi thiếu file code)
data "archive_file" "dummy_code" {
  type        = "zip"
  output_path = "${path.module}/dummy_payload.zip"
  
  source {
    content  = "exports.handler = async (event) => { return 'Hello from Terraform Lambda!'; }"
    filename = "index.js"
  }
}

# 2. IAM Role: Cho phép Lambda chạy và ghi log
resource "aws_iam_role" "lambda_role" {
  name = "iot_lambda_role_${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

# Cấp quyền cơ bản (ghi log ra CloudWatch)
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# 3. IAM Policy: Cấp quyền GHI vào bảng DynamoDB cụ thể
resource "aws_iam_role_policy" "dynamodb_write_policy" {
  name = "dynamodb_write_access"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:GetItem"
        ]
        Effect   = "Allow"
        Resource = var.table_arn # Chỉ cho phép ghi vào đúng bảng này
      }
    ]
  })
}

# 4. Tạo Lambda Function
resource "aws_lambda_function" "violation_processor" {
  function_name = "ProcessViolationFunction-${var.environment}"
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x" # Tạm thời dùng Nodejs để test nhẹ nhàng
  
  filename         = data.archive_file.dummy_code.output_path
  source_code_hash = data.archive_file.dummy_code.output_base64sha256

  environment {
    variables = {
      ENVIRONMENT = var.environment
    }
  }
}

output "function_arn" {
  value = aws_lambda_function.violation_processor.arn
}

output "function_name" {
  value = aws_lambda_function.violation_processor.function_name
}