provider aws {
	alias = "aws-1"
	access_key = "secret"
	secret_key = "secret"
	region = "eu-west-1"
}

resource aws_ecr_repository _43074 {
provider = aws.aws-1


