# Fargate REST Baseline

This runbook deploys the current `gateway-service` and `processor-service` to AWS ECS Fargate so you can compare the same request path across local, EC2, and Fargate.

## What This Deployment Includes

- public `gateway-service` behind an Application Load Balancer
- private `processor-service` reachable through Cloud Map service discovery
- CloudWatch log groups for both services
- ECS cluster with Container Insights enabled
- one CloudFormation template for ECR repositories
- one CloudFormation template for the Fargate REST baseline

This is the smallest useful "serverless" slice for the project. It keeps the application path close to your local and EC2 REST baseline.

## Prerequisites

- Docker Desktop
- AWS CLI configured with an account and region
- permissions for ECR, ECS, IAM, CloudFormation, EC2, CloudWatch Logs, and Service Discovery
- Grafana k6 installed locally

## Deployment Order

Run the following commands from the project root.

### 1. Create ECR repositories

```powershell
.\scripts\deploy-ecr.ps1 -ProjectName pacco-experiment -Region us-west-2 -StackName pacco-ecr
```

### 2. Build and push container images

```powershell
.\scripts\build-and-push-images.ps1 -ProjectName pacco-experiment -Region us-west-2 -ImageTag v1
```

Save the image tag you used. The Fargate stack needs the same tag.

### 3. Deploy the ECS Fargate REST baseline

```powershell
.\scripts\deploy-fargate-rest.ps1 -ProjectName pacco-experiment -Region us-west-2 -StackName pacco-fargate-rest -ImageTag v1 -DesiredCount 1 -ProcessorDelayMs 75
```

### 4. Get the public gateway URL

```powershell
.\scripts\get-fargate-url.ps1 -Region us-west-2 -StackName pacco-fargate-rest
```

### 5. Smoke test the gateway

```powershell
$env:BASE_URL="http://<ALB-DNS-NAME>"
k6 run .\loadtests\synch-rest-test.js
```

### 6. Run the actual shipment workload

```powershell
$env:BASE_URL="http://<ALB-DNS-NAME>"
$env:VUS="10"
$env:DURATION="1m"
k6 run .\loadtests\create_shipments.js --summary-export .\results\fargate_rest_v1.json
```

## How To Evaluate Results

Use the same workload shape and request path for all three environments:

- local REST
- EC2 REST
- Fargate REST

Keep these values fixed across runs:

- same k6 script
- same VU count
- same test duration
- same request payload
- same artificial processor delay
- same region for all AWS tests if possible

For each environment, collect:

- `http_req_duration` p50, p95, and max from k6
- `http_reqs` rate from k6
- `http_req_failed` from k6
- gateway `/metrics` when the service is directly reachable
- processor `/metrics` for local and EC2 runs
- CloudWatch ECS CPU and memory utilization
- CloudWatch Logs for both Fargate services

On Fargate, the processor service is intentionally not public. Treat k6 plus CloudWatch as the primary measurement sources for that deployment.

## Suggested Experiment Table

Record one row per run with columns like:

| Environment | Mode | VUs | Duration | Processor Delay (ms) | p50 Latency (ms) | p95 Latency (ms) | Max Latency (ms) | Throughput (req/s) | Failure Rate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Local | REST | 10 | 1m | 75 |  |  |  |  |  |
| EC2 | REST | 10 | 1m | 75 |  |  |  |  |  |
| Fargate | REST | 10 | 1m | 75 |  |  |  |  |  |

Repeat each test at least three times and average the reported values. Use the same machine to run k6 when possible so the client side stays consistent.

## CloudWatch Checks

During or after a run, inspect:

- `ECS/ContainerInsights` CPU and memory for gateway and processor tasks
- service task count to confirm whether scaling or restarts occurred
- CloudWatch Logs for request errors or dependency failures
- ALB target health to confirm the benchmark is hitting healthy tasks

## Result Interpretation

For the report, the key comparison questions are:

- How much latency overhead does Fargate introduce relative to local and EC2?
- Does throughput drop materially when the same service path runs behind ALB plus Fargate networking?
- Are tail latencies more volatile on Fargate than on local or EC2?
- Does failure rate remain near zero under the same workload?

If you later implement event-driven Fargate, reuse the same approach with `COMMUNICATION_MODE=event` replaced by a real managed broker instead of the local in-memory queue.
