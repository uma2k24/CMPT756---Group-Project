# Pacco Performance Benchmarking Guide

This guide explains how to run repeatable performance tests against the Pacco microservices. We use **Grafana k6** to measure **Latency**, **Throughput**, and **Scalability** across our different deployment environments (Local, EC2, and ECS).

## Prerequisites
1. **Install k6:** Download and install from https://k6.io/docs/getting-started/installation/
2. **Network Access:** Ensure the target environment has port 5000 open in its Security Group (or is accessible on localhost).

## Running the Tests
All scripts use the BASE_URL environment variable. This allows us to run the same test logic against any endpoint without modifying the code.

### 1. REST Baseline Test (Ping/Gateway)
Measures raw network overhead and gateway responsiveness.

Command:
k6 run -e BASE_URL=http://<TARGET_IP>:5000 pacco_test.js

### 2. Event-Driven Workload (Create Parcel)
Measures the system's asynchronous performance using RabbitMQ.

Command:
k6 run -e BASE_URL=http://<TARGET_IP>:5000 pacco_workload.js

## Saving Results for Evaluation
To collect comparable data for our final report, use the --summary-export flag. This creates a JSON file with all p95 latency and throughput metrics.

Example for EC2 Evaluation:
k6 run -e BASE_URL=http://<EC2_IP>:5000 --summary-export=ec2_results.json pacco_workload.js
