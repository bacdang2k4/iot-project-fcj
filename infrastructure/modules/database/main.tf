# infrastructure/modules/database/main.tf

variable "environment" {
  description = "Môi trường triển khai (dev/prod)"
  type        = string
}

resource "aws_dynamodb_table" "violations" {
  name           = "iot-violations-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST" # Dùng bao nhiêu trả bấy nhiêu (Serverless)
  hash_key       = "violation_id"
  range_key      = "created_at"

  attribute {
    name = "violation_id"
    type = "S" # String
  }

  attribute {
    name = "created_at"
    type = "N" # Number (Timestamp)
  }
  
  # Global Secondary Index để tìm kiếm theo CCCD
  global_secondary_index {
    name               = "CCCDIndex"
    hash_key           = "cccd_number"
    projection_type    = "ALL"
  }

  attribute {
    name = "cccd_number"
    type = "S"
  }

  tags = {
    Name        = "iot-violations-${var.environment}"
    Environment = var.environment
  }
}

output "table_name" {
  value = aws_dynamodb_table.violations.name
}

output "table_arn" {
  value = aws_dynamodb_table.violations.arn
}