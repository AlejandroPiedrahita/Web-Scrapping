"""Endpoints de Métricas en Tiempo Real para Tarjetas Bento del UI
"""

from fastapi import APIRouter
from app.core.entities import PipelineMetrics

router = APIRouter()


@router.get("", response_model=PipelineMetrics)
async def get_realtime_metrics():
    """Alimenta las 4 tarjetas de métricas superiores y el desglose de salud de esquema:

    - Total Extraído: 148,920 (+12.4% rec/min, 842 rec/min)
    - Registros Válidos: 143,712 (96.5% Puntuación Q)
    - Limpios vs Descartados: 143.7k / 5.2k (96.5% aprobados, 5,208 rechazados)
    - Tasa de Nulos de Esquema: 0.84% (< 2.0% Umbral SLA)
    """
    return PipelineMetrics()


@router.get("/schema-health")
async def get_schema_health_breakdown():
    """Desglose específico de las reglas de negocio y calidad."""
    return {
        "spec": "ISO-VIN-2024.B",
        "rules": [
            {
                "id": "vin_normalization",
                "name": "Normalización de VIN (17 caracteres ISO 3779 mod-11)",
                "pass_rate_percentage": 99.8,
                "passed_count": 148622,
                "status": "PASS"
            },
            {
                "id": "price_cleansing",
                "name": "Limpieza de Precios USD (Conversión FX y rango $500-$250k)",
                "pass_rate_percentage": 98.2,
                "passed_count": 146239,
                "status": "PASS"
            },
            {
                "id": "odometer_validation",
                "name": "Validación de Odómetro (0 a 350,000 millas)",
                "pass_rate_percentage": 99.1,
                "passed_count": 147579,
                "status": "PASS"
            },
            {
                "id": "trim_deduction",
                "name": "Deducción de Nivel de Equipamiento (Resolución NLP de Taxonomía)",
                "pass_rate_percentage": 94.7,
                "passed_count": 141027,
                "status": "PASS"
            }
        ]
    }
