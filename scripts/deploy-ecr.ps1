param(
    [string]$ProjectName = "pacco-experiment",
    [string]$Region = "us-west-2",
    [string]$StackName = "pacco-ecr"
)

$ErrorActionPreference = "Stop"

aws cloudformation deploy `
    --region $Region `
    --stack-name $StackName `
    --template-file .\cloudformation\ecr-repositories.yaml `
    --parameter-overrides ProjectName=$ProjectName

Write-Host "ECR repositories deployed."
aws cloudformation describe-stacks `
    --region $Region `
    --stack-name $StackName `
    --query "Stacks[0].Outputs[*].[OutputKey,OutputValue]" `
    --output table
