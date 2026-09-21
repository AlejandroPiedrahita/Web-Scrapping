import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { AuditLogConsole } from './components/AuditLogConsole';
import { SchemaHealthCard } from './components/SchemaHealthCard';
import { ProxyClusterTable } from './components/ProxyClusterTable';
import { DataStreamPreview } from './components/DataStreamPreview';
import { ArchitectureView } from './components/ArchitectureView';
import { QATestSuiteView } from './components/QATestSuiteView';
import { HowItWorksView } from './components/HowItWorksView';
import { ETLSimulatorModal } from './components/ETLSimulatorModal';

import { 
  INITIAL_METRICS, 
  INITIAL_VEHICLES, 
  INITIAL_LOGS, 
  SCHEMA_RULES, 
  PROXY_NODES, 
  WORKER_NODES 
} from './data/mockData';
import { VehicleRecord, AuditLogEntry, PipelineMetrics, ProxyNode } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [metrics, setMetrics] = useState<PipelineMetrics>(INITIAL_METRICS);
  const [vehicles, setVehicles] = useState<VehicleRecord[]>(INITIAL_VEHICLES);
  const [logs, setLogs] = useState<AuditLogEntry[]>(INITIAL_LOGS);
  const [proxies, setProxies] = useState<ProxyNode[]>(PROXY_NODES);
  const [workers, setWorkers] = useState(WORKER_NODES);
  
  const [isRunning, setIsRunning] = useState(false);
  const [isStreaming, setIsStreaming] = useState(true);
  const [isRotating, setIsRotating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [systemAlert, setSystemAlert] = useState<string | null>(null);

  // Simulación periódica de ingestión continua de logs
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      const sampleEvents: Array<Omit<AuditLogEntry, 'id' | 'timestamp'>> = [
        {
          worker_pod: 'worker-pod-08',
          level: 'INFO',
          component: 'PLAYWRIGHT',
          message: `Navegación Playwright completada en autotrader.com/cars-for-sale (${Math.floor(Math.random() * 20 + 10)} elementos procesados)`,
          portal: 'AutoTrader',
        },
        {
          worker_pod: 'worker-pod-01',
          level: 'PL/SQL',
          component: 'DB_SINK',
          message: `EXEC PKG_VEHICLE_INGEST.MERGE_BATCH(p_batch_size=>128, p_checksum_mode=>'SHA256'); COMMIT. Rows affected: 128 (0 deadlocks, 1.2ms flush).`,
          portal: 'AutoTrader',
        },
        {
          worker_pod: 'worker-pod-03',
          level: 'INFO',
          component: 'EXTRACTOR',
          message: `VIN normalizado ISO 3779 verificado con éxito. Tasa de integridad 99.8%.`,
          portal: 'Cars.com',
        },
        {
          worker_pod: 'worker-pod-11',
          level: 'WARN',
          component: 'PROXY_ROT',
          message: `Control de tasa HTTP 429 mitigado. Rotación de túnel hacia subred residencial IPv6.`,
          portal: 'AutoTrader',
        },
      ];

      const chosen = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
      const newEntry: AuditLogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        timestamp: timeStr,
        ...chosen,
      };

      setLogs((prev) => [...prev.slice(-99), newEntry]);

      // Incremento dinámico sutil de métricas
      setMetrics((prev) => ({
        ...prev,
        total_scraped: prev.total_scraped + Math.floor(Math.random() * 4 + 1),
        valid_records: prev.valid_records + Math.floor(Math.random() * 4 + 1),
      }));
    }, 4500);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Ejecutar Pipeline manual
  const handleRunPipeline = () => {
    setIsRunning(true);
    setSystemAlert('Disparando ejecución masiva: 32 navegadores Playwright enrutados a través de la malla de proxies.');

    setTimeout(() => {
      // Inyecta un lote de vehículos canónicos recién extraídos
      const freshVehicle: VehicleRecord = {
        id: `veh-${Date.now()}`,
        vin: 'WP0AB2A99NS249811',
        brand: 'Porsche',
        model: '911 GT3 Touring',
        year: 2022,
        mileage_mi: 6420,
        scraped_price_usd: 189500.00,
        est_depr_value_usd: 184200.00,
        trim_tier: 'GT3 Touring Coupe',
        postal_code: '94016',
        source_portal: 'AutoTrader',
        status: 'Clean Valid',
        checksum_hash: `sha256_porsche_gt3_${Date.now()}`,
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
        raw_payload: {
          raw_price: '$189,500 USD',
          raw_odometer: '6,420 mi',
          raw_title: '2022 Porsche 911 GT3 Touring Package',
          detected_currency: 'USD',
        },
      };

      setVehicles((prev) => [freshVehicle, ...prev]);
      setMetrics((prev) => ({
        ...prev,
        total_scraped: prev.total_scraped + 128,
        valid_records: prev.valid_records + 124,
        clean_records: prev.clean_records + 124,
      }));

      const newLog: AuditLogEntry = {
        id: `log-batch-${Date.now()}`,
        timestamp: new Date().toTimeString().split(' ')[0],
        worker_pod: 'worker-pod-01',
        level: 'PL/SQL',
        component: 'DB_SINK',
        message: "EXEC PKG_VEHICLE_INGEST.MERGE_BATCH(p_batch_size=>128, p_checksum_mode=>'SHA256'); COMMIT. Lote persistido exitosamente en vehicles_clean.",
        portal: 'AutoTrader',
      };
      setLogs((prev) => [...prev, newLog]);
      setIsRunning(false);
      setSystemAlert('Lote #4183 procesado: 128 registros extraídos y persistidos mediante PL/SQL.');
      setTimeout(() => setSystemAlert(null), 4000);
    }, 1800);
  };

  // Parada de Emergencia
  const handleEmergencyStop = () => {
    setIsRunning(false);
    setIsStreaming(false);
    const stopLog: AuditLogEntry = {
      id: `log-stop-${Date.now()}`,
      timestamp: new Date().toTimeString().split(' ')[0],
      worker_pod: 'orchestrator-core',
      level: 'CRITICAL',
      component: 'EMERGENCY',
      message: 'PARADA DE EMERGENCIA EJECUTADA: 32 hilos Playwright cancelados de forma limpia. Pool de conexiones PostgreSQL drenado.',
    };
    setLogs((prev) => [...prev, stopLog]);
    setSystemAlert('ALERTA: Parada de emergencia activada. Clúster de extracción suspendido.');
  };

  // Rotar IPs de proxies manualmente
  const handleRotateProxies = () => {
    setIsRotating(true);
    setTimeout(() => {
      setProxies((prev) =>
        prev.map((p) => ({
          ...p,
          ip: `${Math.floor(Math.random() * 50 + 190)}.${Math.floor(Math.random() * 200)}.${Math.floor(
            Math.random() * 250
          )}.${Math.floor(Math.random() * 250 + 1)}`,
          throughput: +(Math.random() * 20 + 30).toFixed(1),
          success_rate: +(Math.random() * 2 + 98).toFixed(1),
        }))
      );
      setIsRotating(false);
      const logEntry: AuditLogEntry = {
        id: `log-rot-${Date.now()}`,
        timestamp: new Date().toTimeString().split(' ')[0],
        worker_pod: 'worker-pod-07',
        level: 'INFO',
        component: 'PROXY_ROT',
        message: 'Rotación forzada de 1,420 IPs completada en 350ms. Nuevas huellas TLS JA3 propagadas al clúster.',
      };
      setLogs((prev) => [...prev, logEntry]);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#051424] text-[#d4e4fa] flex flex-col font-sans selection:bg-[#06b6d4] selection:text-[#003640]">
      {/* Header con Controles y Métricas de Sincronización */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunPipeline={handleRunPipeline}
        onEmergencyStop={handleEmergencyStop}
        isRunning={isRunning}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
      />

      {/* Alertas de Sistema / Notificaciones Flotantes */}
      {systemAlert && (
        <div className="bg-[#0284c7] text-white px-4 py-2 text-xs font-mono font-medium flex items-center justify-between border-b border-[#38bdf8]/40 shadow-lg animate-in slide-in-from-top duration-300">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-white animate-ping"></span>
            <span>{systemAlert}</span>
          </div>
          <button onClick={() => setSystemAlert(null)} className="text-white/80 hover:text-white text-sm">
            &times;
          </button>
        </div>
      )}

      {/* Contenedor Principal */}
      <main className="flex-1 p-4 max-w-[1700px] w-full mx-auto overflow-y-auto space-y-4">
        {activeTab === 'dashboard' && (
          <>
            {/* 4 Tarjetas Bento de Métricas Superiores */}
            <MetricCards metrics={metrics} />

            {/* Fila Principal: Consola de Auditoría (Izquierda) + Reglas de Salud y Malla de Proxies (Derecha) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Columna Izquierda (7 columnas): Consola de Auditoría y Malla de Proxies */}
              <div className="lg:col-span-7 space-y-4">
                <AuditLogConsole
                  logs={logs}
                  onClearLogs={() => setLogs([])}
                  isStreaming={isStreaming}
                  setIsStreaming={setIsStreaming}
                />

                <ProxyClusterTable
                  proxies={proxies}
                  workers={workers}
                  onRotateProxies={handleRotateProxies}
                  isRotating={isRotating}
                />
              </div>

              {/* Columna Derecha (5 columnas): Reglas de Salud del Esquema y Previsualización Rápida */}
              <div className="lg:col-span-5 space-y-4">
                <SchemaHealthCard rules={SCHEMA_RULES} />

                {/* Vista Rápida del Búfer Limpio */}
                <DataStreamPreview
                  vehicles={vehicles.slice(0, 5)}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'how-it-works' && <HowItWorksView />}

        {activeTab === 'buffer' && (
          <DataStreamPreview
            vehicles={vehicles}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {activeTab === 'architecture' && <ArchitectureView />}

        {activeTab === 'qa' && <QATestSuiteView />}
      </main>

      {/* Modal de Simulación Interactiva ETL */}
      <ETLSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onAddSimulatedVehicle={(newVeh) => {
          setVehicles((prev) => [newVeh, ...prev]);
          setSystemAlert(`Vehículo simulado (${newVeh.brand} ${newVeh.model}) inyectado con éxito en el búfer de ingesta.`);
          setTimeout(() => setSystemAlert(null), 4000);
        }}
      />
    </div>
  );
}

export default App;
