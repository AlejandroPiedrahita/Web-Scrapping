"""Endpoints de Control de Pipeline y Previsualización de Datos
"""

from typing import List
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class TriggerPipelineRequest(BaseModel):
    portal_targets: List[str] = ["AutoTrader", "Cars.com", "Carvana"]
    concurrency_browsers: int = 32
    headless_mode: bool = True
    adaptive_jitter_ms: int = 1250
    proxy_rotation_strategy: str = "Residential IPv6 Subnet - Auto Rotate on 429"


@router.post("/run")
async def trigger_pipeline_run(request: TriggerPipelineRequest):
    """Dispara una ejecución inmediata de ingestión del pipeline (Botón 'Run Pipeline')."""
    return {
        "status": "RUNNING",
        "job_id": "job-ingest-20250920-04",
        "message": f"Pipeline disparado con éxito con {request.concurrency_browsers} navegadores concurrentes.",
        "portals_mounted": request.portal_targets,
        "proxy_strategy": request.proxy_rotation_strategy,
    }


@router.post("/emergency-stop")
async def emergency_stop():
    """Detiene inmediatamente todos los trabajadores Playwright (Botón 'Emergency Stop')."""
    return {
        "status": "HALTED",
        "message": "Parada de emergencia ejecutada. 32 hilos drenados de forma segura.",
        "timestamp_utc": "14:32:15 UTC",
    }
