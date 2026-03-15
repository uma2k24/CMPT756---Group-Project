from __future__ import annotations

from collections import deque
from statistics import mean
from threading import Lock
from time import perf_counter
from typing import Any


class MetricsRegistry:
    def __init__(self, max_samples: int = 5000) -> None:
        self._max_samples = max_samples
        self._lock = Lock()
        self._request_latencies = deque(maxlen=max_samples)
        self._downstream_latencies = deque(maxlen=max_samples)
        self._started_at = perf_counter()
        self._requests = 0

    def record_request(self, service_time_ms: float, downstream_time_ms: float | None = None) -> None:
        with self._lock:
            self._requests += 1
            self._request_latencies.append(service_time_ms)
            if downstream_time_ms is not None:
                self._downstream_latencies.append(downstream_time_ms)

    def snapshot(self) -> dict[str, Any]:
        with self._lock:
            uptime_seconds = max(perf_counter() - self._started_at, 0.001)
            return {
                "requests": self._requests,
                "throughput_rps": round(self._requests / uptime_seconds, 2),
                "avg_service_time_ms": round(mean(self._request_latencies), 2)
                if self._request_latencies
                else 0.0,
                "avg_downstream_time_ms": round(mean(self._downstream_latencies), 2)
                if self._downstream_latencies
                else 0.0,
                "samples_kept": len(self._request_latencies),
            }
