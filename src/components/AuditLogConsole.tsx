import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Play, Pause, Trash2, Copy, Check } from 'lucide-react';
import { AuditLogEntry, LogLevel } from '../types';

interface AuditLogConsoleProps {
  logs: AuditLogEntry[];
  onClearLogs: () => void;
  isStreaming: boolean;
  setIsStreaming: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AuditLogConsole: React.FC<AuditLogConsoleProps> = ({
  logs,
  onClearLogs,
  isStreaming,
  setIsStreaming,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<LogLevel>('ALL');
  const [copied, setCopied] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const filterLevels: LogLevel[] = ['ALL', 'INFO', 'WARN', 'ERROR', 'CRITICAL', 'PL/SQL'];

  const filteredLogs = logs.filter((log) => {
    if (selectedLevel === 'ALL') return true;
    return log.level === selectedLevel;
  });

  // Auto-desplazamiento cuando llegan nuevos logs si el streaming está activo
  useEffect(() => {
    if (isStreaming && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, isStreaming]);

  const handleCopyLogs = () => {
    const textToCopy = filteredLogs
      .map((l) => `${l.timestamp} [${l.level}] [${l.component}] ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case 'INFO':
        return 'bg-[#0369a1]/30 text-[#38bdf8] border-[#0284c7]/50';
      case 'WARN':
        return 'bg-[#78350f]/30 text-[#fbbf24] border-[#d97706]/50';
      case 'ERROR':
        return 'bg-[#7f1d1d]/40 text-[#f87171] border-[#ef4444]/60';
      case 'CRITICAL':
        return 'bg-[#881337]/50 text-[#fda4af] border-[#f43f5e]/80 animate-pulse';
      case 'PL/SQL':
        return 'bg-[#4c1d95]/40 text-[#c084fc] border-[#9333ea]/60';
      default:
        return 'bg-[#334155]/40 text-[#cbd5e1] border-[#475569]/50';
    }
  };

  return (
    <div 
      id="audit-log-console-container"
      className="bg-[#050f1d] border border-[#1e293b] rounded-xl flex flex-col h-[400px] shadow-xl overflow-hidden font-mono"
    >
      {/* Barra de Título y Controles */}
      <div className="bg-[#091728] border-b border-[#1e293b] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Terminal className="h-4 w-4 text-[#06b6d4]" />
          <span className="text-xs font-semibold text-[#e2e8f0] tracking-wide">
            Consola de Auditoría y Telemetría del Clúster (Live Audit Log)
          </span>
          <span className="flex h-2 w-2 relative">
            {isStreaming && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isStreaming ? 'bg-[#10b981]' : 'bg-[#64748b]'}`}></span>
          </span>
        </div>

        {/* Filtros de Nivel de Severidad */}
        <div className="flex items-center space-x-1 overflow-x-auto">
          {filterLevels.map((lvl) => (
            <button
              key={lvl}
              id={`filter-log-${lvl.toLowerCase()}`}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-2 py-0.5 text-[11px] rounded transition-all ${
                selectedLevel === lvl
                  ? 'bg-[#0284c7] text-white font-bold shadow-sm'
                  : 'text-[#94a3b8] hover:text-white hover:bg-[#1e293b]'
              }`}
            >
              {lvl === 'ALL' ? 'TODOS' : lvl}
            </button>
          ))}
        </div>

        {/* Acciones de Consola */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className="p-1 rounded text-[#94a3b8] hover:text-white hover:bg-[#1e293b] transition-colors"
            title={isStreaming ? 'Pausar desplazamiento' : 'Reanudar desplazamiento'}
          >
            {isStreaming ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={handleCopyLogs}
            className="p-1 rounded text-[#94a3b8] hover:text-white hover:bg-[#1e293b] transition-colors"
            title="Copiar registros al portapapeles"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[#10b981]" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={onClearLogs}
            className="p-1 rounded text-[#94a3b8] hover:text-[#f87171] hover:bg-[#1e293b] transition-colors"
            title="Limpiar consola"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Cuerpo de Registros / Stream en Vivo */}
      <div 
        ref={logContainerRef}
        className="flex-1 p-3 overflow-y-auto space-y-1.5 text-xs select-text bg-[#020912]"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-[#64748b]">
            No hay eventos registrados para el filtro seleccionado [{selectedLevel}].
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start space-x-2 py-0.5 hover:bg-[#0d1e33]/70 px-1.5 rounded transition-colors"
            >
              {/* Marca Temporal */}
              <span className="text-[#64748b] text-[11px] shrink-0 font-mono">
                {log.timestamp}
              </span>

              {/* Badge de Nivel */}
              <span
                className={`px-1.5 py-0.2 text-[10px] font-bold rounded border uppercase shrink-0 font-mono ${getLevelBadgeClass(
                  log.level
                )}`}
              >
                {log.level}
              </span>

              {/* Componente Origen */}
              <span className="text-[#38bdf8] text-[11px] font-semibold shrink-0">
                [{log.component}]
              </span>

              {/* Pod Identificador */}
              <span className="text-[#475569] text-[10px] shrink-0 hidden sm:inline">
                {log.worker_pod} &bull;
              </span>

              {/* Mensaje de Log Técnico */}
              <span className="text-[#d1d5db] font-normal leading-relaxed break-all">
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Barra de Estado Inferior de la Consola */}
      <div className="bg-[#091728] border-t border-[#1e293b] px-3 py-1 text-[11px] text-[#64748b] flex justify-between items-center">
        <span>Total de eventos en búfer: {filteredLogs.length}</span>
        <span className="flex items-center gap-2">
          <span>Túnel TLS JA3: Activo</span>
          <span>&bull;</span>
          <span className="text-[#38bdf8]">Pool Playwright: 32 hilos</span>
        </span>
      </div>
    </div>
  );
};
