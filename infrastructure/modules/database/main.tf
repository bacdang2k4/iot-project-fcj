# infrastructure/modules/database/main.tf

variable "environment" { type = string }

# 1. Bảng Vi phạm (Cũ)
resource "aws_dynamodb_table" "violations" {
  name           = "iot-violations-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "violation_id"
  range_key      = "created_at"

  attribute {
    name = "violation_id"
    type = "S"
  }
  attribute {
    name = "created_at"
    type = "N"
  }
  
  # Thêm GSI để tìm theo CCCD như ý bạn của bạn
  global_secondary_index {
    name               = "CCCDIndex"
    hash_key           = "cccd_number"
    projection_type    = "ALL"
  }
  attribute {
    name = "cccd_number"
    type = "S"
  }
}

# 2. Bảng Cán bộ (MỚI - Lấy từ code bạn của bạn)
resource "aws_dynamodb_table" "officers" {
  name           = "iot-officers-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "device_id"
  range_key      = "finger_id"

  attribute {
    name = "device_id"
    type = "S"
  }
  attribute {
    name = "finger_id"
    type = "N" # ID vân tay là số
  }
}

# OUTPUTS
output "violations_table_name" { value = aws_dynamodb_table.violations.name }
output "violations_table_arn"  { value = aws_dynamodb_table.violations.arn }
output "officers_table_name"   { value = aws_dynamodb_table.officers.name }
output "officers_table_arn"    { value = aws_dynamodb_table.officers.arn }