from __future__ import annotations

import asyncio
from time import perf_counter

from fastapi import FastAPI

from app.config import load_settings
from app.metrics import MetricsRegistry
from app.models import ProcessShipmentRequest, ProcessShipmentResponse


def create_processor_app() -> FastAPI:
    settings = load_settings("processor-service")
    app = FastAPI(
        title="Pacco Experiment Processor",
        version="0.1.0",
        description="Starter downstream service for shipment processing.",
    )
    metrics = MetricsRegistry()

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok", "service": settings.service_name}

    @app.get("/metrics")
    async def get_metrics() -> dict[str, object]:
        return metrics.snapshot()

    @app.post("/process", response_model=ProcessShipmentResponse)
    async def process_shipment(payload: ProcessShipmentRequest) -> ProcessShipmentResponse:
        start = perf_counter()
        await asyncio.sleep(settings.artificial_delay_ms / 1000)
        processing_time_ms = (perf_counter() - start) * 1000
        metrics.record_request(service_time_ms=processing_time_ms)
        return ProcessShipmentResponse(
            shipment_id=payload.shipment_id,
            status="confirmed",
            processing_time_ms=round(processing_time_ms, 2),
        )

    return app
