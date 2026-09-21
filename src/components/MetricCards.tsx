import React from 'react';
import { ArrowUpRight, CheckCircle2, Filter, ShieldCheck, Activity } from 'lucide-react';
import { PipelineMetrics } from '../types';

interface MetricCardsProps {
  metrics: PipelineMetrics;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {/* Tarjeta 1: Total Extraído */}
      <div 
        id="metric-card-total-scraped"
        className="bg-[#0b1b2d] border border-[#1e293b] rounded-xl p-4 shadow-lg hover:border-[#0284c7]/40 transition-all relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
            Total Extraído
          </span>
          <span className="inline-flex items-center space-x-1 rounded bg-[#065f46]/30 px-2 py-0.5 text-[11px] font-mono font-semibold text-[#34d399] border border-[#059669]/40">
            <ArrowUpRight className="h-3 w-3" />
            <span>+{metrics.rate_delta}%</span>
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <div className="text-2xl font-bold font-mono tracking-tight text-white">
            {metrics.total_scraped.toLocaleString()}
          </div>
          <span className="text-xs font-mono text-[#64748b]">registros</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-[#94a3b8] border-t border-[#1e293b]/60 pt-2 font-mono">
          <span className="flex items-center gap-1.5 text-[#38bdf8]">
            <Activity className="h-3.5 w-3.5" />
            <span>{metrics.ingest_rate_per_min} rec/min</span>
          </span>
          <span className="text-[#64748b]">Clúster Playwright</span>
        </div>
      </div>

      {/* Tarjeta 2: Registros Válidos */}
      <div 
        id="metric-card-valid-records"
        className="bg-[#0b1b2d] border border-[#1e293b] rounded-xl p-4 shadow-lg hover:border-[#10b981]/40 transition-all relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
            Registros Válidos
          </span>
          <span className="inline-flex items-center space-x-1 rounded bg-[#065f46]/30 px-2 py-0.5 text-[11px] font-mono font-semibold text-[#34d399] border border-[#059669]/40">
            <CheckCircle2 className="h-3 w-3" />
            <span>{metrics.q_score}% Puntuación Q</span>
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <div className="text-2xl font-bold font-mono tracking-tight text-[#e2e8f0]">
            {metrics.valid_records.toLocaleString()}
          </div>
          <span className="text-xs font-mono text-[#64748b]">aprobados</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-[#94a3b8] border-t border-[#1e293b]/60 pt-2 font-mono">
          <span className="text-[#94a3b8]">Pérdida neta:</span>
          <span className="text-[#f59e0b] font-medium">{metrics.loss_rate}% (filtrado)</span>
        </div>
      </div>

      {/* Tarjeta 3: Limpios vs. Descartados */}
      <div 
        id="metric-card-clean-vs-dropped"
        className="bg-[#0b1b2d] border border-[#1e293b] rounded-xl p-4 shadow-lg hover:border-[#06b6d4]/40 transition-all relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
            Limpios vs. Descartados
          </span>
          <span className="inline-flex items-center space-x-1 rounded bg-[#0284c7]/20 px-2 py-0.5 text-[11px] font-mono font-semibold text-[#38bdf8] border border-[#0284c7]/40">
            <Filter className="h-3 w-3" />
            <span>96.5% Aprobados</span>
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <div className="text-2xl font-bold font-mono tracking-tight text-white">
            {(metrics.clean_records / 1000).toFixed(1)}k
          </div>
          <span className="text-lg font-mono text-[#475569]">/</span>
          <div className="text-xl font-bold font-mono tracking-tight text-[#f87171]">
            {(metrics.dropped_records / 1000).toFixed(1)}k
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-[#94a3b8] border-t border-[#1e293b]/60 pt-2 font-mono">
          <span className="text-[#94a3b8]">En cola DLQ:</span>
          <span className="text-[#f87171] font-semibold">{metrics.dropped_records.toLocaleString()} items</span>
        </div>
      </div>

      {/* Tarjeta 4: Tasa de Nulos de Esquema */}
      <div 
        id="metric-card-schema-null-rate"
        className="bg-[#0b1b2d] border border-[#1e293b] rounded-xl p-4 shadow-lg hover:border-[#10b981]/40 transition-all relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
            Tasa de Nulos de Esquema
          </span>
          <span className="inline-flex items-center space-x-1 rounded bg-[#065f46]/30 px-2 py-0.5 text-[11px] font-mono font-semibold text-[#34d399] border border-[#059669]/40">
            <ShieldCheck className="h-3 w-3" />
            <span>&lt; {metrics.sla_null_threshold}% Umbral SLA</span>
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <div className="text-2xl font-bold font-mono tracking-tight text-[#34d399]">
            {metrics.null_rate}%
          </div>
          <span className="text-xs font-mono text-[#64748b]">sobre carga total</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-[#94a3b8] border-t border-[#1e293b]/60 pt-2 font-mono">
          <span className="text-[#94a3b8]">Estado SLA:</span>
          <span className="text-[#34d399] font-medium">Cumplimiento Óptimo</span>
        </div>
      </div>
    </div>
  );
};
