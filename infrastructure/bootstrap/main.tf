# infrastructure/bootstrap/main.tf
provider "aws" {
  region = "ap-southeast-1" # Singapore (hoặc region bạn chọn)
}

# 1. S3 Bucket để lưu Terraform State
resource "aws_s3_bucket" "terraform_state" {
  bucket = "my-iot-project-tfstate-store-363636" # Tên này phải DUY NHẤT toàn cầu, hãy đổi thêm số ngẫu nhiên
  
  lifecycle {
    prevent_destroy = true # Chống xóa nhầm
  }
}

resource "aws_s3_bucket_versioning" "enabled" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

# 2. DynamoDB Table để khóa state (State Locking)
resource "aws_dynamodb_table" "terraform_locks" {
  name         = "terraform-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}

output "s3_bucket_name" {
  value = aws_s3_bucket.terraform_state.id
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.terraform_locks.name
}

# Tạo OIDC Provider cho GitHub
resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"] # Thumbprint của GitHub
}

# Tạo IAM Role cho GitHub Actions sử dụng
resource "aws_iam_role" "github_actions" {
  name = "github-actions-deploy-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRoleWithWebIdentity"
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github.arn
        }
        Condition = {
          StringLike = {
            # THAY_THE_USERNAME: Username GitHub của bạn
            # THAY_THE_REPO: Tên repo của bạn
            "token.actions.githubusercontent.com:sub" : "repo:THAY_THE_USERNAME/THAY_THE_REPO:*"
          }
        }
      }
    ]
  })
}

# Cấp quyền Admin cho Role này (để nó tạo được mọi thứ)
resource "aws_iam_role_policy_attachment" "admin_access" {
  role       = aws_iam_role.github_actions.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

output "github_role_arn" {
  value = aws_iam_role.github_actions.arn
}