"""Endpoint para Previsualización del Búfer de Datos Limpios (Cleaned Data Stream Preview)
"""

from typing import List
from fastapi import APIRouter
from app.core.entities import VehicleClean
from app.adapters.persistence.postgres_repository import PostgresVehicleRepository

router = APIRouter()
repo = PostgresVehicleRepository()


@router.get("/preview", response_model=List[VehicleClean])
async def get_cleaned_data_preview():
    """Alimenta la tabla 'Cleaned Data Stream Preview (Live Ingest Buffer)' con los atributos exactos:

    Brand, Model, Year, Mileage, Scraped Price, Est. Depr. Value, Status.
    """
    records = await repo.get_recent_clean_preview(limit=10)
    return records


@router.get("/export-csv")
async def export_cleaned_csv():
    """Genera descarga en formato CSV de los datos limpios."""
    records = await repo.get_recent_clean_preview(limit=100)
    lines = ["vin,brand,model,year,mileage_mi,scraped_price_usd,est_depr_value_usd,status"]
    for r in records:
        lines.append(f"{r.vin},{r.brand},{r.model},{r.year},{r.mileage_mi},{r.scraped_price_usd},{r.est_depr_value_usd},{r.status.value}")
    return {"csv_content": "\n".join(lines), "records_exported": len(records)}
