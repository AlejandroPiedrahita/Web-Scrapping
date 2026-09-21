import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Square, 
  Activity, 
  Layers, 
  Database, 
  Search, 
  FlaskConical, 
  RefreshCw,
  Radio,
  Workflow
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRunPipeline: () => void;
  onEmergencyStop: () => void;
  isRunning: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenSimulator: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onRunPipeline,
  onEmergencyStop,
  isRunning,
  searchQuery,
  setSearchQuery,
  onOpenSimulator,
}) => {
  const [timeUtc, setTimeUtc] = useState<string>('14:32:04 UTC');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimeUtc(now.toTimeString().split(' ')[0] + ' UTC');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navTabs = [
    { id: 'dashboard', label: 'Panel de Telemetría', icon: Activity },
    { id: 'how-it-works', label: '¿Cómo Funciona? (Guía Visual)', icon: Workflow },
    { id: 'buffer', label: 'Búfer de Ingesta en Vivo', icon: Database },
    { id: 'architecture', label: 'Arquitectura Limpia (Ports & Adapters)', icon: Layers },
    { id: 'qa', label: 'Suite de Pruebas QA (pytest)', icon: FlaskConical },
  ];

  return (
    <header className="border-b border-[#1e293b] bg-[#071322] px-4 py-3 sticky top-0 z-40 shadow-xl backdrop-blur-md">
      {/* Fila Superior: Marca, Búsqueda, Estado de Sincronización y Acciones */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Logotipo & Versión */}
        <div className="flex items-center space-x-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#06b6d4] to-[#0284c7] shadow-lg shadow-[#06b6d4]/20 border border-[#38bdf8]/40">
            <Radio className="h-5 w-5 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10b981]"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                AutoData ETL
                <span className="rounded bg-[#0f243a] px-2 py-0.5 text-[11px] font-mono font-medium text-[#38bdf8] border border-[#0284c7]/40">
                  v4.18.2-prod
                </span>
              </h1>
            </div>
            <p className="text-xs font-mono text-[#64748b]">
              Orquestador de Clúster Playwright &bull; ISO-VIN-2024.B &bull; Ports &amp; Adapters
            </p>
          </div>
        </div>

        {/* Buscador Global Rápido */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#475569]" />
            <input
              id="global-pipeline-search"
              type="text"
              placeholder="Buscar VIN, marca, modelo, nodo proxy o mensaje de error..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#020b14] border border-[#1e293b] rounded-lg pl-9 pr-4 py-1.5 text-xs text-[#e2e8f0] placeholder-[#475569] focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] font-mono transition-colors"
            />
          </div>
        </div>

        {/* Estado de Sincronización de Clúster */}
        <div className="hidden lg:flex items-center space-x-2 bg-[#020b14] border border-[#1e293b] px-3 py-1.5 rounded-lg text-xs font-mono">
          <span className="h-2 w-2 rounded-full bg-[#10b981]"></span>
          <span className="text-[#94a3b8]">Sincronizado:</span>
          <span className="text-[#38bdf8] font-semibold">{timeUtc}</span>
          <span className="text-[#475569]">&bull;</span>
          <span className="text-[#10b981]">Desvío 0.02ms</span>
        </div>

        {/* Botones de Control del Pipeline */}
        <div className="flex items-center space-x-2">
          <button
            id="btn-open-simulator"
            onClick={onOpenSimulator}
            className="flex items-center space-x-1.5 rounded-lg bg-[#0f243a] border border-[#0284c7]/50 px-3 py-1.5 text-xs font-medium text-[#38bdf8] hover:bg-[#13304d] hover:text-white transition-all shadow-sm"
            title="Abrir Simulador Interactivo de Limpieza"
          >
            <FlaskConical className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Simulador ETL</span>
          </button>

          <button
            id="btn-run-pipeline"
            onClick={onRunPipeline}
            disabled={isRunning}
            className={`flex items-center space-x-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white shadow-md transition-all ${
              isRunning
                ? 'bg-[#059669]/60 cursor-not-allowed text-[#a7f3d0]'
                : 'bg-gradient-to-r from-[#059669] to-[#10b981] hover:from-[#047857] hover:to-[#059669] active:scale-95 shadow-[#10b981]/20'
            }`}
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Ingiriendo Lote...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Ejecutar Pipeline</span>
              </>
            )}
          </button>

          <button
            id="btn-emergency-stop"
            onClick={onEmergencyStop}
            className="flex items-center space-x-1.5 rounded-lg bg-[#450a0a] border border-[#991b1b] px-3 py-1.5 text-xs font-semibold text-[#fca5a5] hover:bg-[#7f1d1d] hover:text-white active:scale-95 transition-all shadow-sm"
          >
            <Square className="h-3 w-3 fill-current" />
            <span className="hidden sm:inline">Parada de Emergencia</span>
          </button>
        </div>
      </div>

      {/* Fila Inferior: Pestañas de Navegación de Arquitectura y Vistas */}
      <div className="flex items-center space-x-1 mt-3 border-t border-[#1e293b]/60 pt-2.5 overflow-x-auto">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#06b6d4]/15 text-[#38bdf8] border border-[#06b6d4]/40 font-semibold shadow-sm'
                  : 'text-[#94a3b8] hover:text-white hover:bg-[#0f172a]'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#06b6d4]' : 'text-[#64748b]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
