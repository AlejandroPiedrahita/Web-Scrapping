"""Módulo de Configuración Centralizada (Core Settings)
Utiliza Pydantic Settings para cargar y validar estrictamente las variables de entorno.
"""

from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class PipelineSettings(BaseSettings):
    """Configuración inmutable y tipada del Pipeline ETL AutoData."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Entorno
    environment: str = Field(default="production", description="Entorno activo")
    debug: bool = Field(default=False, description="Modo depuración")
    log_level: str = Field(default="INFO", description="Nivel de logs de auditoría")

    # API
    api_host: str = Field(default="0.0.0.0", description="Host de enlace")
    api_port: int = Field(default=8000, description="Puerto de servicio")
    api_workers: int = Field(default=4, description="Número de trabajadores uvicorn")

    # Base de Datos
    db_host: str = Field(default="localhost", description="Host del motor PostgreSQL")
    db_port: int = Field(default=5432, description="Puerto PostgreSQL")
    db_user: str = Field(default="autodata_admin", description="Usuario DB")
    db_password: str = Field(default="secure_password", description="Contraseña DB")
    db_name: str = Field(default="autodata_db", description="Nombre de BD")
    db_ssl_mode: str = Field(default="prefer", description="Modo SSL")
    db_pool_size: int = Field(default=20, description="Tamaño del pool")
    db_max_overflow: int = Field(default=10, description="Conexiones adicionales de desbordamiento")

    # Playwright Engine & Scrapers
    playwright_headless: bool = Field(default=True, description="Ejecución sin interfaz gráfica")
    playwright_worker_concurrency: int = Field(default=32, description="Número de navegadores concurrentes")
    playwright_navigation_timeout_ms: int = Field(default=30000, description="Timeout de navegación")
    stealth_profile_version: str = Field(default="v4.2", description="Perfil de evasión antibot")

    # Proxy Mesh
    proxy_rotation_strategy: str = Field(default="residential_ipv6_auto", description="Estrategia de rotación")
    residential_proxy_gateway: Optional[str] = Field(default=None, description="Pasarela de salida")
    proxy_max_retries: int = Field(default=5, description="Máximo reintentos ante código 429")
    adaptive_jitter_min_ms: int = Field(default=300, description="Jitter mínimo")
    adaptive_jitter_max_ms: int = Field(default=1250, description="Jitter máximo")

    # Umbrales SLA y Reglas de Negocio
    max_null_field_limit: int = Field(default=3, description="Límite de campos nulos antes de descarte DLQ")
    min_price_usd: float = Field(default=500.00, description="Precio piso en USD")
    max_price_usd: float = Field(default=250000.00, description="Precio techo en USD")
    dead_letter_queue_enabled: bool = Field(default=True, description="Enrutamiento a cola de mensajes muertos")

    @property
    def async_database_url(self) -> str:
        """Genera la URL de conexión asíncrona para asyncpg."""
        return f"postgresql+asyncpg://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"

    @property
    def sync_database_url(self) -> str:
        """Genera la URL de conexión sincrónica para psycopg2 y procedimientos PL/SQL."""
        return f"postgresql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"


settings = PipelineSettings()
