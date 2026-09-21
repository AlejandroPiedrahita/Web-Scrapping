// ==============================================================================
// AutoData ETL Pipeline - Tipos e Interfaces TypeScript
// ==============================================================================

export type VehicleStatus = 'Clean Valid' | 'Normal' | 'Anomaly Price' | 'Quarantined DLQ';

export type LogLevel = 'ALL' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL' | 'PL/SQL';

export interface VehicleRecord {
  id: string;
  vin: string;
  brand: string;
  model: string;
  year: number;
  mileage_mi: number;
  scraped_price_usd: number;
  est_depr_value_usd: number;
  trim_tier?: string;
  battery_health_pct?: number;
  postal_code: string;
  source_portal: 'AutoTrader' | 'Cars.com' | 'Carvana' | string;
  status: VehicleStatus;
  checksum_hash: string;
  created_at: string;
  raw_payload?: {
    raw_price?: string;
    raw_odometer?: string;
    raw_title?: string;
    detected_currency?: string;
  };
}

export type VehicleClean = VehicleRecord;

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  worker_pod: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL' | 'PL/SQL';
  component: string;
  message: string;
  portal?: string;
  vin_context?: string;
}

export interface SchemaRuleMetric {
  id: string;
  name: string;
  description: string;
  pass_rate: number;
  passed_count: number;
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
}

export interface ProxyNode {
  ip: string;
  mask: string;
  gateway: string;
  region: string;
  ttl: string;
  throughput: number;
  success_rate: number;
  status: 'Healthy' | 'Degraded' | 'Rotating' | 'Halted';
}

export interface WorkerNode {
  id: string;
  type: string;
  vcpu: number;
  ram: string;
  cpu_usage: number;
  status: 'Activo' | 'Reciclando' | 'En espera';
}

export interface PipelineMetrics {
  total_scraped: number;
  valid_records: number;
  clean_records: number;
  dropped_records: number;
  q_score: number;
  loss_rate: number;
  null_rate: number;
  sla_null_threshold: number;
  ingest_rate_per_min: number;
  rate_delta: number;
  active_proxies: number;
  total_proxies: number;
  uptime_pct: number;
  avg_latency_ms: number;
}
