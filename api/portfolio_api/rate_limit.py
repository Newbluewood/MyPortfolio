from __future__ import annotations

import time
from collections import defaultdict
from dataclasses import dataclass


@dataclass
class _Bucket:
    window_start: float
    count: int


class SimpleRateLimiter:
    """Fixed window rate limiter by client key (e.g. IP). Not for multi-instance prod."""

    def __init__(self, max_requests: int, window_seconds: int) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._buckets: dict[str, _Bucket] = defaultdict(
            lambda: _Bucket(window_start=time.monotonic(), count=0)
        )

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        b = self._buckets[key]
        if now - b.window_start >= self.window_seconds:
            b.window_start = now
            b.count = 0
        if b.count >= self.max_requests:
            return False
        b.count += 1
        return True
