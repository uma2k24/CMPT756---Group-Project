from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    service_name: str
    communication_mode: str
    processor_base_url: str
    artificial_delay_ms: int
    event_processing_delay_ms: int


def load_settings(service_name: str) -> Settings:
    return Settings(
        service_name=service_name,
        communication_mode=os.getenv("COMMUNICATION_MODE", "rest").lower(),
        processor_base_url=os.getenv("PROCESSOR_BASE_URL", "http://127.0.0.1:8001"),
        artificial_delay_ms=int(os.getenv("ARTIFICIAL_DELAY_MS", "75")),
        event_processing_delay_ms=int(os.getenv("EVENT_PROCESSING_DELAY_MS", "50")),
    )
