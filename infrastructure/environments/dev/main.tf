terraform {
  backend "s3" {
    bucket         = "my-iot-project-tfstate-store-363636"
    key            = "dev/terraform.tfstate"
    region         = "ap-southeast-1"
    dynamodb_table = "terraform-locks"
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

variable "github_token" {
  type      = string
  sensitive = true
}
# ==============================================================================
# 1. DATABASE MODULE
# ==============================================================================
module "database" {
  source      = "../../modules/database"
  environment = "dev"
}

# ==============================================================================
# 2. LAMBDA: XỬ LÝ VI PHẠM (Violation Processor)
# ==============================================================================
module "lambda_violation" {
  source        = "../../modules/lambda"
  environment   = "dev"
  
  function_name = "ProcessViolation"
  source_dir    = "${path.module}/../../../services/violation-service"
  handler       = "process_violation.lambda_handler"
  
  env_vars = {
    TABLE_NAME = module.database.violations_table_name
  }

  iam_policy_json = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action   = ["dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:GetItem"],
      Effect   = "Allow",
      Resource = module.database.violations_table_arn
    }]
  })
}

# ==============================================================================
# 3. LAMBDA: XÁC THỰC CÁN BỘ (Auth Officer)
# ==============================================================================
module "lambda_auth" {
  source        = "../../modules/lambda"
  environment   = "dev"
  
  function_name = "AuthOfficer"
  source_dir    = "${path.module}/../../../services/auth-service"
  handler       = "auth_officer.lambda_handler"
  
  env_vars = {
    TABLE_NAME = module.database.officers_table_name
  }

  iam_policy_json = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action   = ["dynamodb:GetItem", "dynamodb:Query", "dynamodb:Scan"],
        Effect   = "Allow",
        Resource = module.database.officers_table_arn
      },
      {
        Action   = ["iot:Publish"],
        Effect   = "Allow",
        Resource = "*" 
      }
    ]
  })
}

# ==============================================================================
# 4. IOT MODULE (Kết nối 2 Lambda vào 2 Rule khác nhau)
# ==============================================================================
module "iot" {
  source      = "../../modules/iot"
  environment = "dev"
  
  auth_lambda_arn  = module.lambda_auth.function_arn
  auth_lambda_name = module.lambda_auth.function_name
  
  violation_lambda_arn  = module.lambda_violation.function_arn
  violation_lambda_name = module.lambda_violation.function_name
}

# ==============================================================================
# 5. LAMBDA: DASHBOARD (Đọc dữ liệu hiển thị lên Web)
# ==============================================================================
module "lambda_dashboard" {
  source        = "../../modules/lambda"
  environment   = "dev"
  
  function_name = "GetDashboardFunction"
  source_dir    = "${path.module}/../../../services/dashboard-service"
  handler       = "get_dashboard.lambda_handler"
  
  env_vars = {
    TABLE_NAME = module.database.violations_table_name
  }

  iam_policy_json = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action   = [
        "dynamodb:Scan", 
        "dynamodb:Query", 
        "dynamodb:GetItem"
      ],
      Effect   = "Allow",
      Resource = module.database.violations_table_arn
    }]
  })
}

# ==============================================================================
# 6. API GATEWAY (Cửa ngõ ra Internet)
# ==============================================================================
module "api" {
  source      = "../../modules/api"
  environment = "dev"

  dashboard_lambda_arn  = module.lambda_dashboard.function_arn
  dashboard_lambda_name = module.lambda_dashboard.function_name
  
  search_lambda_arn     = module.lambda_search.function_arn
  search_lambda_name    = module.lambda_search.function_name
}

# ==============================================================================
# 7. LAMBDA: TÌM KIẾM (Search Function)
# ==============================================================================
module "lambda_search" {
  source        = "../../modules/lambda"
  environment   = "dev"
  
  function_name = "SearchByCCCDFunction"
  source_dir    = "${path.module}/../../../services/search-service"
  handler       = "search_violation.lambda_handler"
  
  env_vars = {
    TABLE_NAME = module.database.violations_table_name
  }

  iam_policy_json = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action   = ["dynamodb:Query", "dynamodb:GetItem"],
      Effect   = "Allow",
      Resource = [
        module.database.violations_table_arn,
        "${module.database.violations_table_arn}/index/*" # <--- QUAN TRỌNG: Cho phép đọc Index
      ]
    }]
  })
}

# ==============================================================================
# 8. FRONTEND MODULE (AWS AMPLIFY)
# ==============================================================================
module "frontend" {
  source = "../../modules/frontend"
  environment = "dev"

  github_repo = "bacdang2k4/iot-project-fcj"
  
  github_token = var.github_token
  
  api_url = module.api.api_endpoint 
}

# ==============================================================================
# OUTPUTS
# ==============================================================================
output "violation_table" {
  value = module.database.violations_table_name
}

output "officer_table" {
  value = module.database.officers_table_name
}

output "dashboard_lambda_arn" {
  value = module.lambda_dashboard.function_arn
}

output "api_url" {
  value = module.api.api_endpoint
}

output "frontend_url" {
  value = module.frontend.app_url
}