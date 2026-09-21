import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { SchemaRuleMetric } from '../types';

interface SchemaHealthCardProps {
  rules: SchemaRuleMetric[];
}

export const SchemaHealthCard: React.FC<SchemaHealthCardProps> = ({ rules }) => {
  return (
    <div 
      id="schema-health-container"
      className="bg-[#0b1b2d] border border-[#1e293b] rounded-xl p-4 shadow-lg"
    >
      <div className="flex items-center justify-between mb-3 border-b border-[#1e293b]/80 pb-2.5">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-4 w-4 text-[#10b981]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#e2e8f0]">
            Reglas de Calidad y Salud del Esquema
          </h2>
        </div>
        <span className="text-[11px] font-mono text-[#38bdf8] bg-[#0284c7]/20 border border-[#0284c7]/40 px-2 py-0.5 rounded">
          ISO-VIN-2024.B
        </span>
      </div>

      <div className="space-y-3.5">
        {rules.map((rule) => {
          const isHigh = rule.pass_rate >= 98.0;
          return (
            <div key={rule.id} className="group">
              <div className="flex items-center justify-between text-xs mb-1">
                <div>
                  <span className="font-semibold text-[#f1f5f9] group-hover:text-[#38bdf8] transition-colors">
                    {rule.name}
                  </span>
                  <p className="text-[11px] text-[#64748b] leading-tight">
                    {rule.description}
                  </p>
                </div>
                <div className="text-right pl-2 shrink-0">
                  <span className="font-mono font-bold text-[#e2e8f0]">
                    {rule.pass_rate}%
                  </span>
                  <p className="text-[10px] font-mono text-[#64748b]">
                    {rule.passed_count.toLocaleString()} reg
                  </p>
                </div>
              </div>

              {/* Barra de Progreso */}
              <div className="w-full bg-[#030e1c] h-1.5 rounded-full overflow-hidden border border-[#1e293b]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isHigh
                      ? 'bg-gradient-to-r from-[#0284c7] to-[#10b981]'
                      : 'bg-gradient-to-r from-[#f59e0b] to-[#10b981]'
                  }`}
                  style={{ width: `${rule.pass_rate}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-[#1e293b]/60 flex items-center justify-between text-[11px] text-[#64748b] font-mono">
        <span className="flex items-center gap-1 text-[#10b981]">
          <CheckCircle2 className="h-3 w-3" />
          <span>Filtro anti-inyección activo (100% esterilizado)</span>
        </span>
        <span className="text-[#38bdf8]">Tasa de descarte: 3.5%</span>
      </div>
    </div>
  );
};
