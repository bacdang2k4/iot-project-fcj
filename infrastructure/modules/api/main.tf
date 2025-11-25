variable "environment" { type = string }
variable "dashboard_lambda_arn" { type = string }  # ARN của Lambda lấy dữ liệu
variable "dashboard_lambda_name" { type = string } # Tên của Lambda

# 1. Tạo API Gateway (HTTP Protocol)
resource "aws_apigatewayv2_api" "main" {
  name          = "iot-api-${var.environment}"
  protocol_type = "HTTP"

  # Cấu hình CORS (Cho phép Web gọi vào mà không bị chặn)
  cors_configuration {
    allow_origins = ["*"] # Cho phép tất cả (Dev), Prod thì nên sửa lại domain cụ thể
    allow_methods = ["GET", "POST", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization"]
    max_age       = 300
  }
}

# 2. Tạo Stage (Môi trường deploy, ví dụ: dev)
resource "aws_apigatewayv2_stage" "stage" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default" # $default nghĩa là không cần prefix /dev, gọi trực tiếp luôn
  auto_deploy = true       # Tự động deploy khi có sửa đổi
}

# ==============================================================================
# ROUTE: GET /dashboard
# ==============================================================================

# 3. Tạo Integration (Kết nối API Gateway -> Lambda)
resource "aws_apigatewayv2_integration" "dashboard_integration" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.dashboard_lambda_arn
  payload_format_version = "2.0" # Format mới, gọn nhẹ hơn
}

# 4. Tạo Route (Đường dẫn URL)
resource "aws_apigatewayv2_route" "get_dashboard" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /dashboard" # Khi user gọi link này...
  target    = "integrations/${aws_apigatewayv2_integration.dashboard_integration.id}" # ...thì chuyển sang Lambda
}

# 5. Cấp quyền cho API Gateway gọi Lambda (Rất quan trọng, hay quên)
resource "aws_lambda_permission" "api_gw_dashboard" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = var.dashboard_lambda_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*/dashboard"
}

# Output cái Link API ra để dùng
output "api_endpoint" {
  value = aws_apigatewayv2_api.main.api_endpoint
}