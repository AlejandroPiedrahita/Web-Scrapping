"""Modelos de Dominio y Entidades Canónicas (Core Entities)
Define las estructuras inmutables y contratos de datos utilizados a lo largo del pipeline.
"""

from datetime import datetime
from enum import Enum
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, ConfigDict


class VehicleStatus(str, Enum):
    """Estado de validación del vehículo en el flujo ETL."""
    CLEAN_VALID = "Clean Valid"
    NORMAL = "Normal"
    ANOMALY_PRICE = "Anomaly Price"
    QUARANTINED = "Quarantined DLQ"
    REJECTED = "Rejected"


class AuditLogLevel(str, Enum):
    """Niveles de severidad para la telemetría del sistema."""
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARN = "WARN"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"
    PL_SQL = "PL/SQL"


class VehicleRaw(BaseModel):
    """Entidad cruda obtenida directamente del scraper o DOM del portal."""
    model_config = ConfigDict(extra="ignore")

    raw_vin: str = Field(description="VIN original sin normalizar")
    listing_price: Optional[str] = Field(default=None, description="Cadena de precio con símbolos y moneda")
    title_meta: Optional[str] = Field(default=None, description="Título completo extraído del portal")
    brand: Optional[str] = Field(default=None, description="Marca tentativa")
    model: Optional[str] = Field(default=None, description="Modelo del vehículo")
    year: Optional[int] = Field(default=None, description="Año de fabricación")
    odometer_raw: Optional[str] = Field(default=None, description="Lectura cruda de kilometraje/millaje")
    battery_pack_health: Optional[str] = Field(default=None, description="Porcentaje de degradación de batería")
    dealer_zip: Optional[str] = Field(default=None, description="Código postal del concesionario")
    source_portal: str = Field(default="AutoTrader", description="Portal de origen (AutoTrader, Cars.com, etc.)")
    scraped_at: datetime = Field(default_factory=datetime.utcnow, description="Marca temporal de extracción")


class VehicleClean(BaseModel):
    """Entidad canónica limpiecita, tipada y validada según el estándar ISO-VIN-2024.B."""
    model_config = ConfigDict(from_attributes=True)

    vin: str = Field(..., min_length=17, max_length=17, description="VIN de 17 caracteres normalizado con checksum ISO 3779")
    brand: str = Field(..., description="Marca canónica normalizada")
    model: str = Field(..., description="Modelo canónico")
    year: int = Field(..., ge=1970, le=2030, description="Año del vehículo")
    mileage_mi: int = Field(..., ge=0, le=350000, description="Millaje normalizado en millas enteras")
    scraped_price_usd: float = Field(..., ge=500.0, le=250000.0, description="Precio de venta normalizado en USD")
    est_depr_value_usd: float = Field(..., description="Valor depreciado estimado por matriz algorítmica")
    trim_tier: Optional[str] = Field(default=None, description="Nivel de equipamiento deducido por NLP")
    battery_health_pct: Optional[float] = Field(default=None, ge=0.0, le=100.0, description="Salud de batería (solo EV)")
    postal_code: str = Field(..., min_length=5, max_length=10, description="Código postal validado")
    source_portal: str = Field(..., description="Portal objetivo de extracción")
    status: VehicleStatus = Field(default=VehicleStatus.CLEAN_VALID, description="Estado en el pipeline")
    checksum_hash: str = Field(..., description="Firma SHA-256 para idempotencia")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ScrapeAuditLog(BaseModel):
    """Evento individual de auditoría y telemetría de clúster."""
    id: Optional[int] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    worker_pod: str = Field(description="Identificador del pod de ejecución (e.g. worker-pod-01)")
    log_level: AuditLogLevel = Field(description="Nivel del evento")
    component: str = Field(description="Componente origen [PLAYWRIGHT, EXTRACTOR, PROXY_ROT, DB_SINK, etc.]")
    message: str = Field(description="Detalle técnico en español del evento o excepción")
    target_portal: Optional[str] = Field(default=None, description="Portal involucrado")
    vin_context: Optional[str] = Field(default=None, description="VIN de referencia si aplica")
    extra_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


class PipelineMetrics(BaseModel):
    """Métricas en tiempo real visualizadas en las tarjetas Bento del diseño."""
    total_scraped: int = 148920
    valid_records: int = 143712
    clean_records: int = 143700
    dropped_records: int = 5208
    q_score_percentage: float = 96.5
    loss_percentage: float = 3.5
    schema_null_rate_percentage: float = 0.84
    sla_null_threshold_percentage: float = 2.0
    ingest_rate_per_min: int = 842
    rate_change_percentage: float = 12.4
    vin_normalization_pass_rate: float = 99.8
    vin_normalization_count: int = 148622
    price_cleansing_pass_rate: float = 98.2
    price_cleansing_count: int = 146239
    odometer_validation_pass_rate: float = 99.1
    odometer_validation_count: int = 147579
    trim_deduction_pass_rate: float = 94.7
    trim_deduction_count: int = 141027
    active_proxies: int = 1420
    total_proxies: int = 1500
    cluster_uptime_percentage: float = 98.8
    average_latency_ms: float = 14.2
