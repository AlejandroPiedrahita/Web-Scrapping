import React from 'react';
import { Network, Cpu, RefreshCw } from 'lucide-react';
import { ProxyNode, WorkerNode } from '../types';

interface ProxyClusterTableProps {
  proxies: ProxyNode[];
  workers: WorkerNode[];
  onRotateProxies: () => void;
  isRotating: boolean;
}

export const ProxyClusterTable: React.FC<ProxyClusterTableProps> = ({
  proxies,
  workers,
  onRotateProxies,
  isRotating,
}) => {
  return (
    <div 
      id="proxy-cluster-container"
      className="bg-[#0b1b2d] border border-[#1e293b] rounded-xl p-4 shadow-lg space-y-4"
    >
      {/* Cabecera con selector de estrategia y botón de rotación forzada */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e293b]/80 pb-3">
        <div className="flex items-center space-x-2">
          <Network className="h-4 w-4 text-[#06b6d4]" />
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#e2e8f0]">
              Malla de Proxies y Orquestación de Evasión
            </h2>
            <p className="text-[11px] text-[#64748b]">
              Túneles residenciales con rotación automática ante código 429 (Too Many Requests)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono text-[#34d399] bg-[#065f46]/30 border border-[#059669]/40 px-2.5 py-1 rounded">
            1,420 / 1,500 Activos (94.6%)
          </span>
          <button
            id="btn-rotate-proxies"
            onClick={onRotateProxies}
            disabled={isRotating}
            className="flex items-center space-x-1.5 bg-[#0f243a] hover:bg-[#13304d] text-[#38bdf8] border border-[#0284c7]/40 px-2.5 py-1 rounded text-xs font-medium transition-all"
          >
            <RefreshCw className={`h-3 w-3 ${isRotating ? 'animate-spin' : ''}`} />
            <span>Rotar IPs</span>
          </button>
        </div>
      </div>

      {/* Tabla de Nodos Proxy */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-[#1e293b] text-[#64748b] uppercase text-[10px]">
              <th className="py-2 px-2">IP / Subred</th>
              <th className="py-2 px-2">Proveedor Gateway</th>
              <th className="py-2 px-2">Región / ASN</th>
              <th className="py-2 px-2">TTL Sesión</th>
              <th className="py-2 px-2 text-right">Rendimiento</th>
              <th className="py-2 px-2 text-right">Éxito</th>
              <th className="py-2 px-2 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b]/40">
            {proxies.map((node, idx) => (
              <tr key={idx} className="hover:bg-[#071322] transition-colors">
                <td className="py-2 px-2">
                  <span className="text-[#38bdf8] font-semibold">{node.ip}</span>
                  <span className="text-[#64748b] text-[10px] ml-1">{node.mask}</span>
                </td>
                <td className="py-2 px-2 text-[#cbd5e1]">{node.gateway}</td>
                <td className="py-2 px-2 text-[#94a3b8]">{node.region}</td>
                <td className="py-2 px-2 text-[#cbd5e1]">{node.ttl}</td>
                <td className="py-2 px-2 text-right text-[#34d399] font-bold">
                  {node.throughput} rps
                </td>
                <td className="py-2 px-2 text-right text-[#e2e8f0]">
                  {node.success_rate}%
                </td>
                <td className="py-2 px-2 text-center">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      node.status === 'Healthy'
                        ? 'bg-[#065f46]/30 text-[#34d399] border border-[#059669]/50'
                        : 'bg-[#78350f]/30 text-[#fbbf24] border border-[#d97706]/50'
                    }`}
                  >
                    {node.status === 'Healthy' ? 'Saludable' : 'Rotando'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resumen de Pods de Trabajadores Kubernetes */}
      <div className="border-t border-[#1e293b]/80 pt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5 text-xs text-[#cbd5e1] font-semibold">
            <Cpu className="h-3.5 w-3.5 text-[#06b6d4]" />
            <span>Topología de Trabajadores Playwright (Pods de Ejecución)</span>
          </div>
          <span className="text-[11px] font-mono text-[#64748b]">32 Workers Concurrentes</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {workers.map((w) => (
            <div key={w.id} className="bg-[#020b14] border border-[#1e293b] rounded-lg p-2 text-xs font-mono">
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-[#38bdf8] font-medium">{w.id}</span>
                <span className="text-[#10b981] text-[10px]">● {w.status}</span>
              </div>
              <div className="text-[#64748b] text-[10px] truncate">{w.type}</div>
              <div className="mt-1 flex justify-between text-[11px] text-[#cbd5e1]">
                <span>CPU: {w.cpu_usage}%</span>
                <span>{w.ram}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
