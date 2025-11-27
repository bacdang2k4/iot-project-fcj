variable "environment" { type = string }
variable "api_gateway_arn" { type = string } # ARN của API Gateway cần bảo vệ

resource "aws_wafv2_web_acl" "main" {
  name        = "iot-waf-${var.environment}"
  description = "WAF for IoT API Gateway"
  scope       = "REGIONAL" # Quan trọng: Dùng cho API Gateway thì phải là REGIONAL

  default_action {
    allow {} # Mặc định cho phép tất cả, chỉ chặn cái xấu
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "iot-waf-${var.environment}"
    sampled_requests_enabled   = true
  }

  # --- LUẬT 1: RATE LIMIT (Chống Spam) ---
  # Nếu 1 IP gửi quá 300 request trong 5 phút -> Chặn
  rule {
    name     = "RateLimit"
    priority = 1

    action {
      block {} # Hành động: Chặn
    }

    statement {
      rate_based_statement {
        limit              = 300
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimit"
      sampled_requests_enabled   = true
    }
  }

  # --- LUẬT 2: AWS MANAGED RULES (Chống Hack cơ bản) ---
  # Sử dụng bộ luật Core Rule Set miễn phí của AWS
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 2

    override_action {
      none {} # Dùng hành động mặc định của bộ luật
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSCommonRules"
      sampled_requests_enabled   = true
    }
  }
}

# Gắn WAF vào API Gateway
resource "aws_wafv2_web_acl_association" "main" {
  resource_arn = var.api_gateway_arn
  web_acl_arn  = aws_wafv2_web_acl.main.arn
}

# Xuất ARN ra để nếu cần gắn vào cái khác
output "web_acl_arn" {
  value = aws_wafv2_web_acl.main.arn
}