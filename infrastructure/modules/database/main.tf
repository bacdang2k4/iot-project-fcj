variable "environment" {
  type = string
}

# ==============================================================================
# 1. Bảng Vi phạm (ViolationDB)
# ==============================================================================
resource "aws_dynamodb_table" "violations" {
  name           = "iot-violations-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  
  hash_key       = "violation_id" # <--- ĐỔI VỀ UUID
  range_key      = "timestamp"

  attribute {
    name = "violation_id"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "N"
  }

  attribute {
    name = "cccd" # <--- Thuộc tính này dùng cho Index
    type = "S"
  }

  # TẠO LẠI INDEX ĐỂ TÌM KIẾM THEO CCCD
  global_secondary_index {
    name               = "CCCDIndex"
    hash_key           = "cccd"
    range_key          = "timestamp" # Để sắp xếp lịch sử vi phạm của người đó
    projection_type    = "ALL"
  }

  tags = {
    Name        = "iot-violations-${var.environment}"
    Environment = var.environment
  }
}

# ==============================================================================
# 2. Bảng Cán bộ (OfficerDB)
# ==============================================================================
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
    type = "N"
  }

  tags = {
    Name        = "iot-officers-${var.environment}"
    Environment = var.environment
  }
}

# ==============================================================================
# OUTPUTS
# ==============================================================================
output "violations_table_name" {
  value = aws_dynamodb_table.violations.name
}

output "violations_table_arn" {
  value = aws_dynamodb_table.violations.arn
}

output "officers_table_name" {
  value = aws_dynamodb_table.officers.name
}

output "officers_table_arn" {
  value = aws_dynamodb_table.officers.arn
}