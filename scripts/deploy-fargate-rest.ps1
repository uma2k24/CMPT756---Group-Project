param(
    [string]$ProjectName = "pacco-experiment",
    [string]$Region = "us-west-2",
    [string]$StackName = "pacco-fargate-rest",
    [string]$ImageTag = "latest",
    [int]$DesiredCount = 1,
    [int]$ProcessorDelayMs = 75,
    [switch]$DisableRollback
)

$ErrorActionPreference = "Stop"

$AccountId = aws sts get-caller-identity --query Account --output text
if (-not $AccountId) {
    throw "Could not resolve AWS account ID."
}

$Registry = "$AccountId.dkr.ecr.$Region.amazonaws.com"
$GatewayImage = "$Registry/$ProjectName-gateway:$ImageTag"
$ProcessorImage = "$Registry/$ProjectName-processor:$ImageTag"

$deployArgs = @(
    "cloudformation", "deploy",
    "--region", $Region,
    "--stack-name", $StackName,
    "--template-file", ".\cloudformation\fargate-rest-baseline.yaml",
    "--capabilities", "CAPABILITY_NAMED_IAM",
    "--parameter-overrides",
    "ProjectName=$ProjectName",
    "GatewayImageUri=$GatewayImage",
    "ProcessorImageUri=$ProcessorImage",
    "DesiredCount=$DesiredCount",
    "ProcessorDelayMs=$ProcessorDelayMs"
)

if ($DisableRollback) {
    $deployArgs += "--disable-rollback"
}

& aws @deployArgs

if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed. Recent stack failures:" -ForegroundColor Red
    aws cloudformation describe-stack-events `
        --region $Region `
        --stack-name $StackName `
        --query "StackEvents[?contains(ResourceStatus,'FAILED') || contains(ResourceStatus,'ROLLBACK')].[Timestamp,LogicalResourceId,ResourceType,ResourceStatus,ResourceStatusReason]" `
        --output table
    exit $LASTEXITCODE
}

Write-Host "Fargate REST baseline deployed."
aws cloudformation describe-stacks `
    --region $Region `
    --stack-name $StackName `
    --query "Stacks[0].Outputs[*].[OutputKey,OutputValue]" `
    --output table
