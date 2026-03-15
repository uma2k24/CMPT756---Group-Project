from __future__ import annotations

import asyncio
from time import perf_counter

import httpx
from fastapi import FastAPI, HTTPException

from app.config import load_settings
from app.metrics import MetricsRegistry
from app.models import (
    ProcessShipmentRequest,
    ShipmentRecord,
    ShipmentRequest,
    ShipmentResponse,
)


def create_gateway_app() -> FastAPI:
    settings = load_settings("gateway-service")
    app = FastAPI(
        title="Pacco Experiment Gateway",
        version="0.1.0",
        description=(
            "Starter gateway for comparing REST calls against a simple event-style queue "
            "in a Pacco-inspired shipment workflow."
        ),
    )
    metrics = MetricsRegistry()
    queue: asyncio.Queue[ShipmentRecord] = asyncio.Queue()
    processed_shipments: dict[str, ShipmentRecord] = {}

    async def event_worker() -> None:
        while True:
            shipment = await queue.get()
            shipment.status = "processing"
            await asyncio.sleep(settings.event_processing_delay_ms / 1000)
            shipment.status = "confirmed"
            processed_shipments[shipment.shipment_id] = shipment
            queue.task_done()

    @app.on_event("startup")
    async def startup() -> None:
        app.state.worker_task = asyncio.create_task(event_worker())

    @app.on_event("shutdown")
    async def shutdown() -> None:
        worker_task = getattr(app.state, "worker_task", None)
        if worker_task is not None:
            worker_task.cancel()
            try:
                await worker_task
            except asyncio.CancelledError:
                pass

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok", "service": settings.service_name, "mode": settings.communication_mode}

    @app.get("/metrics")
    async def get_metrics() -> dict[str, object]:
        snapshot = metrics.snapshot()
        snapshot["queued_shipments"] = queue.qsize()
        snapshot["processed_shipments"] = len(processed_shipments)
        return snapshot

    @app.get("/shipments/{shipment_id}")
    async def get_shipment(shipment_id: str) -> ShipmentRecord:
        shipment = processed_shipments.get(shipment_id)
        if shipment is None:
            raise HTTPException(status_code=404, detail="Shipment not found or not finished yet")
        return shipment

    @app.post("/shipments", response_model=ShipmentResponse, status_code=202)
    async def create_shipment(payload: ShipmentRequest) -> ShipmentResponse:
        start = perf_counter()
        shipment = ShipmentRecord(**payload.model_dump(), communication_mode=settings.communication_mode)
        downstream_time_ms: float | None = None

        if settings.communication_mode == "rest":
            downstream_time_ms = await _process_over_rest(settings.processor_base_url, shipment)
            shipment.status = "confirmed"
            processed_shipments[shipment.shipment_id] = shipment
        elif settings.communication_mode == "event":
            await queue.put(shipment)
        else:
            raise HTTPException(status_code=500, detail="Unsupported communication mode")

        service_time_ms = (perf_counter() - start) * 1000
        metrics.record_request(service_time_ms=service_time_ms, downstream_time_ms=downstream_time_ms)

        return ShipmentResponse(
            shipment_id=shipment.shipment_id,
            status=shipment.status,
            communication_mode=settings.communication_mode,
            service_time_ms=round(service_time_ms, 2),
            downstream_time_ms=round(downstream_time_ms, 2) if downstream_time_ms is not None else None,
        )

    return app


async def _process_over_rest(processor_base_url: str, shipment: ShipmentRecord) -> float:
    request = ProcessShipmentRequest(
        shipment_id=shipment.shipment_id,
        origin=shipment.origin,
        destination=shipment.destination,
        weight_kg=shipment.weight_kg,
        priority=shipment.priority,
    )
    start = perf_counter()
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(f"{processor_base_url}/process", json=request.model_dump())
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Processor service failed")
    return (perf_counter() - start) * 1000
