# infrastructure/modules/lambda/main.tf

variable "environment" { type = string }
variable "function_name" { type = string } 
variable "source_dir" { type = string }    
variable "handler" { type = string }      
variable "env_vars" {                      
  type    = map(string)
  default = {}
}
variable "iam_policy_json" {               
  type = string
}

# 1. Zip code
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = var.source_dir
  output_path = "${path.module}/${var.function_name}.zip"
}

# 2. Role (Tạo riêng cho từng function để bảo mật)
resource "aws_iam_role" "lambda_role" {
  name = "${var.function_name}_role_${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole", Effect = "Allow", Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "basic" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "custom_policy" {
  name   = "${var.function_name}_policy"
  role   = aws_iam_role.lambda_role.id
  policy = var.iam_policy_json
}

# 3. Function
resource "aws_lambda_function" "func" {
  function_name    = "${var.function_name}-${var.environment}"
  role             = aws_iam_role.lambda_role.arn
  runtime          = "python3.9"
  handler          = var.handler
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  timeout          = 10

  environment {
    variables = merge({ ENVIRONMENT = var.environment }, var.env_vars)
  }
}

output "function_arn"  { value = aws_lambda_function.func.arn }
output "function_name" { value = aws_lambda_function.func.function_name }