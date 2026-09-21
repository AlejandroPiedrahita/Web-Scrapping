"""Endpoints de Logs de Auditoría y Telemetría en Tiempo Real
"""

from typing import List, Optional
from fastapi import APIRouter, Query
from app.core.entities import ScrapeAuditLog

router = APIRouter()

MOCK_LOG_STREAM = [
    {
        "id": 1,
        "worker_pod": "worker-pod-12",
        "log_level": "INFO",
        "component": "PLAYWRIGHT",
        "message": "Fetched 25 DOM elements from cars.com/search?zip=90210 (Viewport 1920x1080, Stealth Profile v4.2)",
        "target_portal": "Cars.com",
    },
    {
        "id": 2,
        "worker_pod": "worker-pod-01",
        "log_level": "INFO",
        "component": "EXTRACTOR",
        "message": "VIN extracted: 1FA6P8CF4H5xxxxx (2017 Ford Mustang GT). Checksum ISO 3779 validado correctamente.",
        "target_portal": "Cars.com",
        "vin_context": "1FA6P8CF4H5xxxxx",
    },
    {
        "id": 3,
        "worker_pod": "worker-pod-07",
        "log_level": "WARN",
        "component": "PROXY_ROT",
        "message": "429 Too Many Requests en proxy 198.51.100.44 -> Rotación ejecutada hacia 203.0.113.89 con ja3 fingerprint #14",
        "target_portal": "AutoTrader",
    },
    {
        "id": 4,
        "worker_pod": "worker-pod-01",
        "log_level": "PL/SQL",
        "component": "DB_SINK",
        "message": "EXEC PKG_VEHICLE_INGEST.MERGE_BATCH(p_batch_size=>128, p_checksum_mode=>'SHA256'); COMMIT. Filas afectadas: 128 (0 deadlocks, 1.4ms flush).",
        "target_portal": "AutoTrader",
    },
    {
        "id": 5,
        "worker_pod": "worker-pod-02",
        "log_level": "WARN",
        "component": "SELECTOR_DRIFT",
        "message": "Heurística de rescate aplicada para 'div.price-summary-tag': XPath principal mutó en parche de Cars.com. Conmutado a 'span[data-qa=\"dealer-price\"]'.",
        "target_portal": "Cars.com",
    },
    {
        "id": 6,
        "worker_pod": "worker-pod-04",
        "log_level": "CRITICAL",
        "component": "ORA_ERR",
        "message": "ORA-00001: Violación de restricción de unicidad (DATASTORE.UK_VEHICLE_VIN_PORTAL) para VIN 1C4RJFAG4PC501923. Encolado a Dead-Letter-Queue (DLQ-02) para deduplicación.",
        "target_portal": "AutoTrader",
        "vin_context": "1C4RJFAG4PC501923",
    },
]


@router.get("/logs", response_model=List[ScrapeAuditLog])
async def get_telemetry_logs(
    level: Optional[str] = Query(None, description="Filtro de nivel: ALL, INFO, WARN, ERROR, CRITICAL, PL/SQL"),
    limit: int = Query(50, ge=1, le=200),
):
    """Devuelve el stream de logs de auditoría visible en la consola del UI."""
    logs = MOCK_LOG_STREAM
    if level and level.upper() != "ALL":
        logs = [l for l in logs if l["log_level"] == level.upper()]
    return logs[:limit]
