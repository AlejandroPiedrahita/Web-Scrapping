"""API de Monitoreo y Orquestación AutoData ETL (FastAPI Application)
Expone los endpoints REST para telemetría en tiempo real, control de scrapers y previsualización.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import metrics, pipeline, data_preview, logs

app = FastAPI(
    title="AutoData ETL Pipeline API",
    description="Backend de monitoreo, telemetría y orquestación de Playwright con arquitectura Ports & Adapters",
    version="4.18.2-prod",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro de routers de API
app.include_router(metrics.router, prefix="/api/v1/metrics", tags=["Métricas de Clúster"])
app.include_router(pipeline.router, prefix="/api/v1/pipeline", tags=["Control de Pipeline"])
app.include_router(data_preview.router, prefix="/api/v1/data", tags=["Previsualización de Datos"])
app.include_router(logs.router, prefix="/api/v1/telemetry", tags=["Logs de Auditoría"])


@app.get("/api/health", tags=["Salud"])
async def health_check():
    """Endpoint de comprobación de salud para orquestadores Kubernetes / Docker."""
    return {
        "status": "online",
        "service": "AutoData ETL Pipeline Engine",
        "version": "4.18.2-prod",
        "spec": "ISO-VIN-2024.B",
        "environment": settings.environment,
        "sync_drift_ms": 0.02,
        "active_pods": 48,
    }
