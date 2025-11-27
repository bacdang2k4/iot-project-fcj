variable "environment" { type = string }
variable "api_url" { type = string }
variable "github_repo" { type = string }
variable "github_token" { type = string }

resource "aws_amplify_app" "frontend" {
  name       = "iot-frontend-${var.environment}"
  repository = "https://github.com/${var.github_repo}"
  
  access_token = var.github_token

  # Cấu hình Build cho Vite
  build_spec = <<-EOT
    version: 1
    applications:
      - frontend:
          phases:
            preBuild:
              commands:
                - npm ci
            build:
              commands:
                - npm run build
          artifacts:
            baseDirectory: dist  # Vite build ra thư mục 'dist'
            files:
              - '**/*'
          cache:
            paths:
              - node_modules/**/*
        appRoot: frontend
  EOT

  # --- SỬA Ở ĐÂY: Đổi REACT_APP_ thành VITE_ ---
  environment_variables = {
    VITE_API_URL        = var.api_url
    AMPLIFY_DIFF_DEPLOY = "false"
  }
  # ---------------------------------------------

  custom_rule {
    source = "</^[^.]+$/>"
    target = "/index.html"
    status = "200"
  }
}

resource "aws_amplify_branch" "master" {
  app_id      = aws_amplify_app.frontend.id
  branch_name = "master" # Kiểm tra kỹ xem nhánh của bạn là 'master' hay 'main'
  
  framework = "React"
  stage     = "PRODUCTION"
  enable_auto_build = true
}

output "app_url" {
  value = "https://master.${aws_amplify_app.frontend.default_domain}"
}