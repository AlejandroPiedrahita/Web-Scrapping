-- ==============================================================================
-- AutoData ETL Pipeline: Esquema Relacional de Producción
-- Compatible con PostgreSQL 14+ / TimescaleDB
-- ==============================================================================

-- Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Esquema dedicado para la ingestión y transformación
CREATE SCHEMA IF NOT EXISTS autodata_core;
SET search_path TO autodata_core, public;

-- ------------------------------------------------------------------------------
-- 1. Tabla de Vehículos Canónicos Limpios (Data Warehouse Ingest Buffer)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicles_clean (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vin VARCHAR(17) NOT NULL,
    brand VARCHAR(60) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year SMALLINT NOT NULL CHECK (year BETWEEN 1970 AND 2030),
    mileage_mi INTEGER NOT NULL CHECK (mileage_mi >= 0),
    scraped_price_usd NUMERIC(12, 2) NOT NULL CHECK (scraped_price_usd >= 500.00),
    est_depr_value_usd NUMERIC(12, 2) NOT NULL,
    trim_tier VARCHAR(80),
    battery_health_pct NUMERIC(5, 2) CHECK (battery_health_pct BETWEEN 0.00 AND 100.00),
    postal_code VARCHAR(10) NOT NULL,
    source_portal VARCHAR(40) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Clean Valid',
    checksum_hash CHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Restricción de unicidad para evitar duplicados entre VIN y portal
    CONSTRAINT uk_vehicle_vin_portal UNIQUE (vin, source_portal)
);

-- Índices B-Tree optimizados para consultas de telemetría y métricas
CREATE INDEX IF NOT EXISTS idx_vehicles_clean_vin ON vehicles_clean(vin);
CREATE INDEX IF NOT EXISTS idx_vehicles_clean_portal ON vehicles_clean(source_portal);
CREATE INDEX IF NOT EXISTS idx_vehicles_clean_created_at ON vehicles_clean(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vehicles_clean_brand_model ON vehicles_clean(brand, model);

-- ------------------------------------------------------------------------------
-- 2. Tabla de Cuarentena / Dead-Letter Queue (DLQ)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicles_dlq (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_payload JSONB NOT NULL,
    vin_candidate VARCHAR(50),
    error_code VARCHAR(60) NOT NULL,
    error_message TEXT NOT NULL,
    source_portal VARCHAR(40) NOT NULL,
    quarantined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolution_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_dlq_quarantined_at ON vehicles_dlq(quarantined_at DESC);
CREATE INDEX IF NOT EXISTS idx_dlq_resolved ON vehicles_dlq(is_resolved);

-- ------------------------------------------------------------------------------
-- 3. Tabla de Logs de Auditoría y Telemetría del Clúster
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pipeline_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    worker_pod VARCHAR(50) NOT NULL,
    log_level VARCHAR(20) NOT NULL CHECK (log_level IN ('DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL', 'PL/SQL')),
    component VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    target_portal VARCHAR(50),
    vin_context VARCHAR(17),
    extra_metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON pipeline_audit_logs(event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_level ON pipeline_audit_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_audit_logs_worker ON pipeline_audit_logs(worker_pod);

-- ------------------------------------------------------------------------------
-- 4. Tabla de Estado del Pool de Proxies
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS proxy_nodes (
    node_ip VARCHAR(50) PRIMARY KEY,
    cidr_mask VARCHAR(10) NOT NULL,
    gateway_provider VARCHAR(80) NOT NULL,
    region_asn VARCHAR(100) NOT NULL,
    session_ttl VARCHAR(20) NOT NULL,
    throughput_rps NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    success_rate_pct NUMERIC(5, 2) NOT NULL DEFAULT 100.0,
    health_state VARCHAR(30) NOT NULL DEFAULT 'Healthy',
    last_rotated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. Tabla de Nodos del Clúster Kubernetes
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS worker_nodes (
    node_id VARCHAR(50) PRIMARY KEY,
    host_type VARCHAR(40) NOT NULL,
    vcpu_count SMALLINT NOT NULL,
    ram_gb SMALLINT NOT NULL,
    cpu_usage_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    ram_allocated_gb NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    pod_capacity SMALLINT NOT NULL DEFAULT 8,
    status VARCHAR(30) NOT NULL DEFAULT 'Healthy',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
