"""Puertos Arquitectónicos (Ports & Interfaces)
Define los contratos abstractos de entrada (Driving) y salida (Driven) según Ports & Adapters.
"""

from abc import ABC, abstractmethod
from typing import List, Optional
import pandas as pd
from app.core.entities import VehicleRaw, VehicleClean, ScrapeAuditLog, PipelineMetrics


class ScraperStrategyPort(ABC):
    """Puerto para las estrategias de scraping según portal objetivo (Patrón Strategy)."""

    @property
    @abstractmethod
    def portal_name(self) -> str:
        """Nombre del portal objetivo (ej. 'AutoTrader', 'Cars.com', 'Carvana')."""
        pass

    @abstractmethod
    async def extract_raw_listings(self, target_url: str, max_items: int = 50) -> List[VehicleRaw]:
        """Extrae vehículos crudos desde el portal objetivo aplicando stealth y evasión."""
        pass


class VehicleCleanerPort(ABC):
    """Puerto de dominio para la limpieza, sanitización y deducción de vehículos (Domain Core)."""

    @abstractmethod
    def clean_record(self, raw: VehicleRaw) -> VehicleClean:
        """Limpia y valida un único registro crudo."""
        pass

    @abstractmethod
    def process_dataframe_batch(self, raw_df: pd.DataFrame) -> pd.DataFrame:
        """Procesa y limpia un lote completo en Pandas aplicando vectorización eficiente."""
        pass


class VehicleRepositoryPort(ABC):
    """Puerto de persistencia para la base de datos PostgreSQL / PL-SQL (Adapter de salida)."""

    @abstractmethod
    async def merge_clean_vehicle(self, vehicle: VehicleClean) -> bool:
        """Inserta o actualiza un registro limpio invocando el procedimiento almacenado."""
        pass

    @abstractmethod
    async def batch_merge_vehicles(self, vehicles: List[VehicleClean]) -> int:
        """Realiza la inserción masiva por lotes optimizados con control de transacciones."""
        pass

    @abstractmethod
    async def quarantine_to_dlq(self, raw_payload: dict, error_reason: str) -> None:
        """Envía registros que no cumplieron las reglas de validación a la tabla DLQ."""
        pass

    @abstractmethod
    async def get_recent_clean_preview(self, limit: int = 10) -> List[VehicleClean]:
        """Obtiene los últimos vehículos procesados para alimentar la tabla de previsualización."""
        pass


class AuditLoggerPort(ABC):
    """Puerto para la emisión y registro de telemetría en tiempo real."""

    @abstractmethod
    async def log_event(self, event: ScrapeAuditLog) -> None:
        """Persiste y emite un evento de auditoría en la consola y stream del clúster."""
        pass

    @abstractmethod
    async def get_latest_logs(self, limit: int = 50, level: Optional[str] = None) -> List[ScrapeAuditLog]:
        """Recupera los logs más recientes con filtrado opcional por severidad."""
        pass

    @abstractmethod
    async def get_pipeline_metrics(self) -> PipelineMetrics:
        """Calcula y devuelve las métricas agregadas del pipeline."""
        pass
