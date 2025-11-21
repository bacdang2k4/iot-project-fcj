terraform {
  # Cấu hình backend để lưu state lên S3
  backend "s3" {
    bucket         = "my-iot-project-tfstate-store-363636" # Điền tên bucket ở Bước 1
    key            = "dev/terraform.tfstate"        # Đường dẫn file state
    region         = "ap-southeast-1"
    dynamodb_table = "terraform-locks"              # Điền tên table ở Bước 1
    encrypt        = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-southeast-1"
  
  default_tags {
    tags = {
      Environment = "Dev"
      Project     = "IoT-System"
      ManagedBy   = "Terraform"
    }
  }
}

# Test thử tạo resource rỗng để check pipeline
resource "aws_resourcegroups_group" "test_group" {
  name = "test-resource-group"
  resource_query {
    query = <<JSON
    {
      "ResourceTypeFilters": ["AWS::AllSupported"],
      "TagFilters": [
        {
          "Key": "Project",
          "Values": ["IoT-System"]
        }
      ]
    }
    JSON
  }
}

module "database" {
  source      = "../../modules/database" # Trỏ tới module bạn vừa viết
  environment = "dev"                    # Truyền biến environment vào
}

output "dynamodb_table_name" {
  value = module.database.table_name
}

module "backend_lambda" {
  source      = "../../modules/lambda"
  environment = "dev"
  table_arn   = module.database.table_arn # <-- Kết nối thần thánh ở đây
}

# THÊM MODULE IOT VÀO ĐÂY:
module "iot" {
  source               = "../../modules/iot"
  environment          = "dev"
  
  # Lấy thông tin từ module lambda truyền sang module iot
  lambda_function_arn  = module.backend_lambda.function_arn
  lambda_function_name = module.backend_lambda.function_name
}