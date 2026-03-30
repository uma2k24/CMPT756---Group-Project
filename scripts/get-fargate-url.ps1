param(
    [string]$Region = "us-west-2",
    [string]$StackName = "pacco-fargate-rest"
)

$ErrorActionPreference = "Stop"

aws cloudformation describe-stacks `
    --region $Region `
    --stack-name $StackName `
    --query "Stacks[0].Outputs[?OutputKey=='GatewayUrl'].OutputValue" `
    --output text
