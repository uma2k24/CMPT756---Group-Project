from __future__ import annotations

from datetime import datetime, timezone
from typing import Literal
from uuid import uuid4

from pydantic import BaseModel, Field


class ShipmentRequest(BaseModel):
    customer_id: str = Field(..., min_length=1, max_length=64)
    origin: str = Field(..., min_length=2, max_length=128)
    destination: str = Field(..., min_length=2, max_length=128)
    weight_kg: float = Field(..., gt=0, le=100)
    priority: Literal["standard", "express"] = "standard"


class ShipmentRecord(ShipmentRequest):
    shipment_id: str = Field(default_factory=lambda: str(uuid4()))
    status: Literal["queued", "processing", "confirmed"] = "queued"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    communication_mode: Literal["rest", "event"]


class ShipmentResponse(BaseModel):
    shipment_id: str
    status: str
    communication_mode: Literal["rest", "event"]
    service_time_ms: float
    downstream_time_ms: float | None = None


class ProcessShipmentRequest(BaseModel):
    shipment_id: str
    origin: str
    destination: str
    weight_kg: float
    priority: Literal["standard", "express"]


class ProcessShipmentResponse(BaseModel):
    shipment_id: str
    status: Literal["confirmed"]
    processing_time_ms: float
