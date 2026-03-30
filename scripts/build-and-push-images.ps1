param(
    [string]$ProjectName = "pacco-experiment",
    [string]$Region = "us-west-2",
    [string]$ImageTag = "latest"
)

$ErrorActionPreference = "Stop"

$AccountId = aws sts get-caller-identity --query Account --output text
if (-not $AccountId) {
    throw "Could not resolve AWS account ID."
}

$Registry = "$AccountId.dkr.ecr.$Region.amazonaws.com"
$GatewayImage = "$Registry/$ProjectName-gateway:$ImageTag"
$ProcessorImage = "$Registry/$ProjectName-processor:$ImageTag"

aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $Registry

docker build -f .\Dockerfile.gateway -t $GatewayImage .
docker build -f .\Dockerfile.processor -t $ProcessorImage .

docker push $GatewayImage
docker push $ProcessorImage

Write-Host "GatewayImageUri=$GatewayImage"
Write-Host "ProcessorImageUri=$ProcessorImage"
