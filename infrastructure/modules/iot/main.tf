# infrastructure/modules/iot/main.tf

variable "environment" {
  type = string
}

variable "lambda_function_arn" {
  description = "ARN của Lambda function để trigger"
  type        = string
}

variable "lambda_function_name" {
  description = "Tên của Lambda function để cấp quyền"
  type        = string
}

# 1. Tạo IoT Thing (Thiết bị logic)
resource "aws_iot_thing" "esp32_device" {
  name = "esp32-sensor-${var.environment}"
  
  attributes = {
    Project = "IoT-System"
  }
}

# 2. Tạo IoT Policy (Quyền hạn của thiết bị)
# Cho phép thiết bị làm TẤT CẢ (Connect, Publish, Subscribe) để dễ dev
resource "aws_iot_policy" "device_policy" {
  name = "esp32-full-access-${var.environment}"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "iot:Connect",
          "iot:Publish",
          "iot:Subscribe",
          "iot:Receive"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

# 3. Tạo IoT Rule (Cầu nối sang Lambda)
resource "aws_iot_topic_rule" "rule" {
  name        = "RouteViolationToLambda_${var.environment}"
  description = "Route data from topic 'device/+/violation' to Lambda"
  enabled     = true
  sql         = "SELECT * FROM 'device/+/violation'" # Dấu + là wildcard (device/1/violation, device/2/violation...)
  sql_version = "2016-03-23"

  lambda {
    function_arn = var.lambda_function_arn
  }
}

# 4. Cấp "Visa" cho IoT Core được phép gọi Lambda
resource "aws_lambda_permission" "allow_iot" {
  statement_id  = "AllowExecutionFromIoT"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name
  principal     = "iot.amazonaws.com"
  source_arn    = aws_iot_topic_rule.rule.arn
}