"""Modelos ORM de SQLAlchemy para PostgreSQL
Mapea el esquema relacional y garantiza tipos estrictos y enlaces parametrizados.
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Numeric,
    SmallInteger,
    DateTime,
    Boolean,
    Text,
    BigInteger,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class VehicleCleanModel(Base):
    __tablename__ = "vehicles_clean"
    __table_args__ = (
        UniqueConstraint("vin", "source_portal", name="uk_vehicle_vin_portal"),
        {"schema": "autodata_core"},
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vin = Column(String(17), nullable=False, index=True)
    brand = Column(String(60), nullable=False)
    model = Column(String(100), nullable=False)
    year = Column(SmallInteger, nullable=False)
    mileage_mi = Column(Integer, nullable=False)
    scraped_price_usd = Column(Numeric(12, 2), nullable=False)
    est_depr_value_usd = Column(Numeric(12, 2), nullable=False)
    trim_tier = Column(String(80), nullable=True)
    battery_health_pct = Column(Numeric(5, 2), nullable=True)
    postal_code = Column(String(10), nullable=False)
    source_portal = Column(String(40), nullable=False, index=True)
    status = Column(String(30), nullable=False, default="Clean Valid")
    checksum_hash = Column(String(64), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)


class VehicleDLQModel(Base):
    __tablename__ = "vehicles_dlq"
    __table_args__ = {"schema": "autodata_core"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    raw_payload = Column(JSONB, nullable=False)
    vin_candidate = Column(String(50), nullable=True)
    error_code = Column(String(60), nullable=False)
    error_message = Column(Text, nullable=False)
    source_portal = Column(String(40), nullable=False)
    quarantined_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    is_resolved = Column(Boolean, default=False)
    resolution_notes = Column(Text, nullable=True)


class PipelineAuditLogModel(Base):
    __tablename__ = "pipeline_audit_logs"
    __table_args__ = {"schema": "autodata_core"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    event_timestamp = Column(DateTime(timezone=True), default=datetime.utcnow, index=True)
    worker_pod = Column(String(50), nullable=False)
    log_level = Column(String(20), nullable=False)
    component = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    target_portal = Column(String(50), nullable=True)
    vin_context = Column(String(17), nullable=True)
    extra_metadata = Column(JSONB, default=dict)
