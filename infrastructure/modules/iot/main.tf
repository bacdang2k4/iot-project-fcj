# infrastructure/modules/iot/main.tf

variable "environment" { type = string }
variable "auth_lambda_arn" { type = string }       # ARN hàm Auth
variable "auth_lambda_name" { type = string }
variable "violation_lambda_arn" { type = string }  # ARN hàm Violation
variable "violation_lambda_name" { type = string }

# 1. Thing & Policy (Giữ nguyên hoặc cập nhật Policy full quyền như bạn của bạn)
resource "aws_iot_thing" "esp32" {
  name = "ESP32_Device_${var.environment}"
}

# ... (Phần Policy & Cert giữ nguyên logic cũ của chúng ta cho an toàn) ...

# 2. RULES (Logic mới)

# Rule A: Xử lý Đăng nhập (Auth)
resource "aws_iot_topic_rule" "rule_auth" {
  name        = "Route_Auth_${var.environment}"
  enabled     = true
  sql         = "SELECT * FROM 'auth/login'" # Topic của bạn ấy
  sql_version = "2016-03-23"

  lambda {
    function_arn = var.auth_lambda_arn
  }
}

# Rule B: Xử lý Vi phạm (Violation)
resource "aws_iot_topic_rule" "rule_violation" {
  name        = "Route_Violation_${var.environment}"
  enabled     = true
  sql         = "SELECT * FROM 'violation/submit'" # Topic của bạn ấy
  sql_version = "2016-03-23"

  lambda {
    function_arn = var.violation_lambda_arn
  }
}

# 3. Permissions
resource "aws_lambda_permission" "allow_iot_auth" {
  statement_id  = "AllowIoTAuth"
  action        = "lambda:InvokeFunction"
  function_name = var.auth_lambda_name
  principal     = "iot.amazonaws.com"
  source_arn    = aws_iot_topic_rule.rule_auth.arn
}

resource "aws_lambda_permission" "allow_iot_violation" {
  statement_id  = "AllowIoTViolation"
  action        = "lambda:InvokeFunction"
  function_name = var.violation_lambda_name
  principal     = "iot.amazonaws.com"
  source_arn    = aws_iot_topic_rule.rule_violation.arn
}