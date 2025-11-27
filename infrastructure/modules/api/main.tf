# Lấy thông tin về Account ID hiện tại đang chạy
data "aws_caller_identity" "current" {}

# Lấy thông tin về Region hiện tại (ap-southeast-1)
data "aws_region" "current" {}

variable "environment" { type = string }
variable "dashboard_lambda_arn" { type = string }
variable "dashboard_lambda_name" { type = string }

# --- THÊM BIẾN MỚI ---
variable "search_lambda_arn" { type = string }
variable "search_lambda_name" { type = string }

# 1. API Gateway
resource "aws_apigatewayv2_api" "main" {
  name          = "iot-api-${var.environment}"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "OPTIONS"]
    allow_headers = ["Content-Type"]
  }
}

resource "aws_apigatewayv2_stage" "stage" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true
}

# 2. Route Dashboard (Cũ)
resource "aws_apigatewayv2_integration" "dashboard" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.dashboard_lambda_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "get_dashboard" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /dashboard"
  target    = "integrations/${aws_apigatewayv2_integration.dashboard.id}"
}

resource "aws_lambda_permission" "api_dashboard" {
  statement_id  = "AllowAPIDashboard"
  action        = "lambda:InvokeFunction"
  function_name = var.dashboard_lambda_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*/dashboard"
}

# 3. Route Search (MỚI)
resource "aws_apigatewayv2_integration" "search" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.search_lambda_arn # Dùng biến mới
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "get_search" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /search"
  target    = "integrations/${aws_apigatewayv2_integration.search.id}"
}

resource "aws_lambda_permission" "api_search" {
  statement_id  = "AllowAPISearch"
  action        = "lambda:InvokeFunction"
  function_name = var.search_lambda_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*/search"
}

output "api_endpoint" { value = aws_apigatewayv2_api.main.api_endpoint }
output "stage_arn" {
  value = "arn:aws:apigateway:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:/apis/${aws_apigatewayv2_api.main.id}/stages/${aws_apigatewayv2_stage.stage.name}"
}