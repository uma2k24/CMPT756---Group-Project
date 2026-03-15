# CMPT756 Group Project

## Title
Cloud Deployment Choices Impacting Performance of a Web Application Using Microservices Architecture

## Project Summary
This repository provides a starter scaffold for evaluating how deployment and communication choices affect the performance of a Pacco-inspired microservice application.

Pacco is an open-source package delivery system built around microservices and event-based messaging. For this project, the main comparison points are:

- event-style communication versus direct REST communication
- local deployment versus remote cloud deployment on AWS
- the resulting effects on latency, throughput, and scalability

This starter is intentionally small. It gives you a controlled experiment harness that you can run locally first, then extend to AWS EC2, ECS, EKS, or managed messaging services such as SQS or EventBridge.

## What Is Included

- `gateway-service`: accepts shipment creation requests
- `processor-service`: simulates downstream shipment processing
- switchable communication mode:
  - `rest`: gateway calls processor over HTTP
  - `event`: gateway enqueues work on an in-memory async queue
- simple metrics endpoints for basic throughput and latency snapshots
- a Grafana k6 script for repeatable load generation

## Repository Layout

```text
.
|-- app/
|   |-- config.py
|   |-- gateway.py
|   |-- metrics.py
|   |-- models.py
|   `-- processor.py
|-- loadtests/
|   `-- create_shipments.js
|-- .env.example
|-- main.py
`-- requirements.txt
```

## Quick Start

### 1. Create a virtual environment and install dependencies

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 2. Run the processor service

```powershell
$env:ARTIFICIAL_DELAY_MS="75"
python main.py --service processor --port 8001
```

### 3. Run the gateway in REST mode

Open a second terminal:

```powershell
.\.venv\Scripts\Activate.ps1
$env:COMMUNICATION_MODE="rest"
$env:PROCESSOR_BASE_URL="http://127.0.0.1:8001"
python main.py --service gateway --port 8000
```

### 4. Try a request

```powershell
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/shipments -ContentType "application/json" -Body '{
  "customer_id": "demo-1",
  "origin": "Burnaby",
  "destination": "Surrey",
  "weight_kg": 4.2,
  "priority": "express"
}'
```

### 5. Inspect metrics

```powershell
Invoke-RestMethod http://127.0.0.1:8000/metrics
Invoke-RestMethod http://127.0.0.1:8001/metrics
```

## Switching Communication Modes

To simulate an event-based style without needing external infrastructure yet:

```powershell
$env:COMMUNICATION_MODE="event"
python main.py --service gateway --port 8000
```

In this mode, the gateway places shipment requests on an in-memory queue and responds immediately. This is a placeholder for a future AWS-backed messaging implementation.

## Load Testing with k6

Install Grafana k6, then run:

```powershell
k6 run .\loadtests\create_shipments.js
```

You can override the default load shape:

```powershell
$env:BASE_URL="http://127.0.0.1:8000"
$env:VUS="25"
$env:DURATION="1m"
k6 run .\loadtests\create_shipments.js
```

## Suggested Experiment Roadmap

### Phase 1: Local baseline

- REST mode with both services on the same machine
- event mode with the in-memory queue
- vary processor delay and k6 traffic intensity

### Phase 2: Distributed deployment

- run `gateway-service` and `processor-service` on separate AWS VMs or containers
- compare local network latency against remote cloud network latency
- collect p50, p95, throughput, and failure rate

### Phase 3: Real event infrastructure

- replace the in-memory queue with AWS SQS, SNS, or EventBridge
- compare managed messaging overhead against direct REST calls
- study scaling behavior under increased concurrency


