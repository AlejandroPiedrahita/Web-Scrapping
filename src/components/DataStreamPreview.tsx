import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  Eye, 
  X, 
  Check,
  Copy,
  Layers
} from 'lucide-react';
import { VehicleRecord, VehicleStatus } from '../types';

interface DataStreamPreviewProps {
  vehicles: VehicleRecord[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const DataStreamPreview: React.FC<DataStreamPreviewProps> = ({
  vehicles,
  searchQuery,
  setSearchQuery,
}) => {
  const [portalFilter, setPortalFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleRecord | null>(null);
  const [copiedVin, setCopiedVin] = useState<string | null>(null);

  const filteredVehicles = vehicles.filter((v) => {
    const matchesPortal = portalFilter === 'ALL' || v.source_portal === portalFilter;
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      v.vin.toLowerCase().includes(q) ||
      v.brand.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.source_portal.toLowerCase().includes(q) ||
      (v.trim_tier && v.trim_tier.toLowerCase().includes(q));

    return matchesPortal && matchesStatus && matchesQuery;
  });

  const handleCopyVin = (vin: string) => {
    navigator.clipboard.writeText(vin);
    setCopiedVin(vin);
    setTimeout(() => setCopiedVin(null), 1500);
  };

  const handleExportCsv = () => {
    const headers = [
      'VIN',
      'Marca',
      'Modelo',
      'Año',
      'Millaje (mi)',
      'Precio Extraído (USD)',
      'Valor Depr. Est. (USD)',
      'Trim',
      'Código Postal',
      'Portal de Origen',
      'Estado',
      'Firma SHA-256',
    ];
    const rows = filteredVehicles.map((v) => [
      v.vin,
      v.brand,
      `"${v.model}"`,
      v.year,
      v.mileage_mi,
      v.scraped_price_usd.toFixed(2),
      v.est_depr_value_usd.toFixed(2),
      `"${v.trim_tier || ''}"`,
      v.postal_code,
      v.source_portal,
      v.status,
      v.checksum_hash,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `autodata_clean_stream_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      id="cleaned-data-stream-container"
      className="bg-[#0b1b2d] border border-[#1e293b] rounded-xl p-4 shadow-xl space-y-4"
    >
      {/* Encabezado y Barra de Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1e293b]/80 pb-3">
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-[#06b6d4]" />
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              Búfer de Ingesta en Vivo (Cleaned Data Stream Preview)
              <span className="text-[11px] font-mono font-normal text-[#38bdf8] bg-[#0284c7]/20 border border-[#0284c7]/40 px-2 py-0.5 rounded">
                Live Buffer
              </span>
            </h2>
            <p className="text-xs text-[#64748b]">
              Registros canónicos limpios validados bajo ISO-VIN-2024.B listos para inserción masiva en PL/SQL
            </p>
          </div>
        </div>

        {/* Acciones: Filtros y Botón de Exportación */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro de Portal */}
          <select
            id="filter-portal-select"
            value={portalFilter}
            onChange={(e) => setPortalFilter(e.target.value)}
            className="bg-[#020b14] border border-[#1e293b] text-xs text-[#cbd5e1] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#06b6d4] font-mono"
          >
            <option value="ALL">Todos los Portales</option>
            <option value="AutoTrader">AutoTrader</option>
            <option value="Cars.com">Cars.com</option>
            <option value="Carvana">Carvana</option>
          </select>

          {/* Filtro de Estado */}
          <select
            id="filter-status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#020b14] border border-[#1e293b] text-xs text-[#cbd5e1] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#06b6d4] font-mono"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="Clean Valid">Clean Valid</option>
            <option value="Normal">Normal</option>
            <option value="Anomaly Price">Anomaly Price</option>
          </select>

          {/* Botón Exportar CSV */}
          <button
            id="btn-export-csv"
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 bg-[#0f243a] hover:bg-[#13304d] text-[#38bdf8] border border-[#0284c7]/50 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Tabla Canónica de Vehículos */}
      <div className="overflow-x-auto rounded-lg border border-[#1e293b]/70 bg-[#071322]">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="bg-[#020a14] border-b border-[#1e293b] text-[#94a3b8] uppercase text-[11px] tracking-wider">
              <th className="py-2.5 px-3">Marca (Brand)</th>
              <th className="py-2.5 px-3">Modelo (Model)</th>
              <th className="py-2.5 px-2 text-center">Año</th>
              <th className="py-2.5 px-3 text-right">Millaje (Mileage)</th>
              <th className="py-2.5 px-3 text-right">Precio Extraído</th>
              <th className="py-2.5 px-3 text-right">Valor Depr. Est.</th>
              <th className="py-2.5 px-3 text-center">Estado (Status)</th>
              <th className="py-2.5 px-3">VIN (17-chars)</th>
              <th className="py-2.5 px-2 text-center">Detalles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b]/50">
            {filteredVehicles.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-10 text-[#64748b]">
                  No se encontraron registros que coincidan con los filtros aplicados.
                </td>
              </tr>
            ) : (
              filteredVehicles.map((veh) => {
                const isClean = veh.status === 'Clean Valid';
                return (
                  <tr
                    key={veh.id}
                    className="hover:bg-[#0d1e33] transition-colors group cursor-pointer"
                    onClick={() => setSelectedVehicle(veh)}
                  >
                    {/* Marca */}
                    <td className="py-2.5 px-3 font-semibold text-[#38bdf8]">
                      {veh.brand}
                    </td>

                    {/* Modelo y Trim */}
                    <td className="py-2.5 px-3">
                      <div className="text-white font-medium">{veh.model}</div>
                      {veh.trim_tier && (
                        <div className="text-[10px] text-[#64748b]">{veh.trim_tier}</div>
                      )}
                    </td>

                    {/* Año */}
                    <td className="py-2.5 px-2 text-center text-[#cbd5e1]">
                      {veh.year}
                    </td>

                    {/* Millaje */}
                    <td className="py-2.5 px-3 text-right text-[#94a3b8]">
                      {veh.mileage_mi.toLocaleString()} mi
                    </td>

                    {/* Precio Extraído */}
                    <td className="py-2.5 px-3 text-right font-bold text-white">
                      ${veh.scraped_price_usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Valor Depreciado Estimado */}
                    <td className="py-2.5 px-3 text-right text-[#34d399] font-medium">
                      ${veh.est_depr_value_usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Estado */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${
                          isClean
                            ? 'bg-[#065f46]/30 text-[#34d399] border border-[#059669]/60'
                            : 'bg-[#0369a1]/30 text-[#38bdf8] border border-[#0284c7]/60'
                        }`}
                      >
                        {veh.status}
                      </span>
                    </td>

                    {/* VIN con Botón de Copiar */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[#94a3b8] text-[11px] font-mono tracking-wider">
                          {veh.vin}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyVin(veh.vin);
                          }}
                          className="text-[#475569] hover:text-[#38bdf8] transition-colors p-1"
                          title="Copiar VIN"
                        >
                          {copiedVin === veh.vin ? (
                            <Check className="h-3 w-3 text-[#10b981]" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Botón Ver Detalles */}
                    <td className="py-2.5 px-2 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVehicle(veh);
                        }}
                        className="p-1 rounded text-[#64748b] hover:text-[#38bdf8] hover:bg-[#1e293b] transition-colors"
                        title="Ver comparativa Cruda vs Limpia"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pie de Tabla con Resumen y Fuente de Portales */}
      <div className="flex flex-wrap items-center justify-between text-xs text-[#64748b] font-mono pt-1">
        <span>Mostrando {filteredVehicles.length} de {vehicles.length} registros canónicos en búfer</span>
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1 text-[#38bdf8]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0284c7]"></span>
            AutoTrader (45%)
          </span>
          <span className="flex items-center gap-1 text-[#34d399]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]"></span>
            Cars.com (35%)
          </span>
          <span className="flex items-center gap-1 text-[#f59e0b]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d97706]"></span>
            Carvana (20%)
          </span>
        </div>
      </div>

      {/* Modal de Inspección Detallada: Crudo vs Limpio */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#071322] border border-[#1e293b] rounded-xl max-w-2xl w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <div className="flex items-center space-x-2">
                <Layers className="h-5 w-5 text-[#06b6d4]" />
                <h3 className="text-sm font-bold text-white">
                  Auditoría de Transformación: {selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.year})
                </h3>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="text-[#64748b] hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              {/* Carga Cruda (Raw Scraped) */}
              <div className="bg-[#020b14] border border-[#334155] rounded-lg p-3 space-y-2">
                <span className="text-[11px] font-bold text-[#f59e0b] uppercase tracking-wider block border-b border-[#334155] pb-1">
                  1. Carga Cruda (Scraper Output)
                </span>
                <div>
                  <span className="text-[#64748b]">Portal de Origen:</span>{' '}
                  <span className="text-white">{selectedVehicle.source_portal}</span>
                </div>
                <div>
                  <span className="text-[#64748b]">Precio Crudo:</span>{' '}
                  <span className="text-[#f87171]">{selectedVehicle.raw_payload?.raw_price || 'N/D'}</span>
                </div>
                <div>
                  <span className="text-[#64748b]">Odómetro Crudo:</span>{' '}
                  <span className="text-[#f87171]">{selectedVehicle.raw_payload?.raw_odometer || 'N/D'}</span>
                </div>
                <div>
                  <span className="text-[#64748b]">Título Original:</span>{' '}
                  <span className="text-[#cbd5e1]">{selectedVehicle.raw_payload?.raw_title || 'N/D'}</span>
                </div>
                <div>
                  <span className="text-[#64748b]">Moneda Detectada:</span>{' '}
                  <span className="text-[#f59e0b]">{selectedVehicle.raw_payload?.detected_currency || 'USD'}</span>
                </div>
              </div>

              {/* Registro Canónico Limpio */}
              <div className="bg-[#020b14] border border-[#059669]/60 rounded-lg p-3 space-y-2">
                <span className="text-[11px] font-bold text-[#34d399] uppercase tracking-wider block border-b border-[#059669]/60 pb-1">
                  2. Registro Canónico (ISO-VIN-2024.B)
                </span>
                <div>
                  <span className="text-[#64748b]">VIN Canónico:</span>{' '}
                  <span className="text-[#38bdf8] font-bold">{selectedVehicle.vin}</span>
                </div>
                <div>
                  <span className="text-[#64748b]">Precio Normalizado:</span>{' '}
                  <span className="text-[#34d399] font-bold">${selectedVehicle.scraped_price_usd.toLocaleString()} USD</span>
                </div>
                <div>
                  <span className="text-[#64748b]">Millaje Normalizado:</span>{' '}
                  <span className="text-white">{selectedVehicle.mileage_mi.toLocaleString()} millas</span>
                </div>
                <div>
                  <span className="text-[#64748b]">Valor Depreciado Est:</span>{' '}
                  <span className="text-[#34d399]">${selectedVehicle.est_depr_value_usd.toLocaleString()} USD</span>
                </div>
                <div>
                  <span className="text-[#64748b]">Nivel Trim Ded.:</span>{' '}
                  <span className="text-white">{selectedVehicle.trim_tier || 'Base'}</span>
                </div>
                {selectedVehicle.battery_health_pct && (
                  <div>
                    <span className="text-[#64748b]">Salud Batería EV:</span>{' '}
                    <span className="text-[#34d399]">{selectedVehicle.battery_health_pct}%</span>
                  </div>
                )}
                <div>
                  <span className="text-[#64748b]">Código Postal:</span>{' '}
                  <span className="text-white">{selectedVehicle.postal_code}</span>
                </div>
              </div>
            </div>

            {/* Hash de Idempotencia */}
            <div className="bg-[#020b14] border border-[#1e293b] rounded-lg p-2.5 text-xs font-mono">
              <span className="text-[#64748b] block mb-0.5">Firma de Idempotencia SHA-256 (Base de Datos):</span>
              <span className="text-[#38bdf8] text-[11px] break-all">{selectedVehicle.checksum_hash}</span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedVehicle(null)}
                className="bg-[#0f243a] hover:bg-[#1e293b] text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              >
                Cerrar Auditoría
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
