# Pacco Performance Benchmarking Guide

This guide explains how to run repeatable performance tests against the current Pacco experiment scaffold. Use the same scripts and traffic shape for local, EC2, and ECS Fargate so that the deployment environment is the main variable changing between runs.

## Prerequisites

1. Install k6: https://k6.io/docs/getting-started/installation/
2. Ensure the gateway endpoint is reachable from the machine running k6.
3. Use the same `BASE_URL`, `VUS`, `DURATION`, and payload shape for all comparison runs.

## Benchmark Scripts

### 1. Gateway Health Check

Measures raw gateway responsiveness with minimal application work.

```powershell
$env:BASE_URL="http://127.0.0.1:8000"
k6 run .\loadtests\synch-rest-test.js --summary-export .\results\health_local.json
```

### 2. Shipment Creation Workload

Measures the actual request path used in the project comparisons.

```powershell
$env:BASE_URL="http://127.0.0.1:8000"
$env:VUS="10"
$env:DURATION="1m"
k6 run .\loadtests\create_shipments.js --summary-export .\results\shipments_local.json
```

### 3. Event-Style Shipment Submission

Use this when the gateway is running in `COMMUNICATION_MODE=event`.

```powershell
$env:BASE_URL="http://127.0.0.1:8000"
$env:VUS="10"
$env:DURATION="1m"
k6 run .\loadtests\asynch-event-test.js --summary-export .\results\event_local.json
```

## What To Record

For every run, capture:

- `http_req_duration` p50 and p95
- `http_reqs` rate
- `http_req_failed`
- service `/metrics` output when available
- ECS or EC2 CPU and memory utilization from AWS

## Example Fargate Run

```powershell
$env:BASE_URL="http://<ALB-DNS-NAME>"
$env:VUS="10"
$env:DURATION="1m"
k6 run .\loadtests\create_shipments.js --summary-export .\results\fargate_rest.json
```

Repeat each run at least three times and average the results before comparing local, EC2, and Fargate.
