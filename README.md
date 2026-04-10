## Cloud Deployment Choices Impacting Performance of a Web Application Using Microservices Architecture

This repository evalutes how deployment and communication choices affect the performance of a [Pacco](https://www.github.com/devmentors/Pacco), an application that uses microservices architecture. Pacco is an open-source system that simulates a package delivery service. For this project, the main comparison points are:

- Synchronous versus asynchronous communication through REST API calls and event-driven messaging respectively
- Local deployment versus AWS cloud deployments on EC2 (serverful) and ECS Fargate (serverless)

The resulting metrics we have chosen are latency, throughput, and availability, tested on Grafana k6 scripts in [loadtests](./loadtests) with resulting JSON metrics in [results](./results).
