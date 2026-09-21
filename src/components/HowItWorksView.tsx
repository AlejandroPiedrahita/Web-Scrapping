import React, { useState } from 'react';
import {
  Workflow,
  ShieldCheck,
  Cpu,
  Database,
  ArrowRight,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Terminal,
  Network,
  Lock,
  FileCode,
  Zap,
  ChevronRight,
  Check
} from 'lucide-react';

interface PipelineStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  tag: string;
  icon: any;
  color: string;
  description: string;
  inputs: string[];
  transformations: string[];
  outputs: string[];
  plsqlOrPythonSnippet: string;
}

export const HowItWorksView: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [interactiveModeStep, setInteractiveModeStep] = useState<number>(1);
  const [isSimulatingJourney, setIsSimulatingJourney] = useState<boolean>(false);
  const [copiedFormula, setCopiedFormula] = useState<boolean>(false);

  const steps: PipelineStep[] = [
    {
      stepNumber: 1,
      title: 'Extracción & Evasión Sigilosa',
      subtitle: 'Driving Adapter: Web Scraper Playwright',
      tag: 'Playwright + Malla Residencial',
      icon: Network,
      color: '#06b6d4',
      description:
        'Una flota concurrente de 32 navegadores Chromium headless controlados por Playwright navega portales automotrices emulando comportamientos humanos realistas (curvas de Bézier con aceleración y jitter) a través de una malla de 1,500 proxies residenciales rotativos.',
      inputs: [
        'URL objetivo: autotrader.com/cars-for-sale',
        'Huella TLS JA3 aleatoria y User-Agent rotativo',
        'Túnel proxy residencial con IP rotativa'
      ],
      transformations: [
        'Intercepción de peticiones HTTP 429 con retroceso exponencial (Exponential Backoff)',
        'Espera de selectores dinámicos y renderizado de Single Page Applications (SPA)',
        'Extracción de campos en crudo (DOM Parsing a diccionarios JSON estructurados)'
      ],
      outputs: [
        'Payload crudo no estructurado con precio en texto, odómetro sin convertir y título'
      ],
      plsqlOrPythonSnippet: `# Playwright Scraper: Captura con curvas Bézier y rotación ante 429
async def scrape_portal(target_url: str, proxy: str) -> dict:
    context = await browser.new_context(
        proxy={"server": proxy},
        user_agent=get_random_user_agent()
    )
    page = await context.new_page()
    await simulate_human_mouse(page)
    raw_data = await extract_vehicle_card(page)
    return raw_data`
    },
    {
      stepNumber: 2,
      title: 'Normalización & Sanitización',
      subtitle: 'Domain Core: Capa de Transformación y Negocio',
      tag: 'Regex + ISO 3779 + Sanitización Anti-XSS',
      icon: ShieldCheck,
      color: '#10b981',
      description:
        'El corazón del pipeline limpia la información. Aplica el estándar ISO-VIN-2024.B para verificar el dígito verificador en la posición 9 del VIN con el algoritmo Módulo 11. Además, neutraliza scripts maliciosos, convierte divisas (CAD a USD) y transforma distancias métricas.',
      inputs: [
        'Payload crudo: "$42,950 CAD", "38,200 km", "<script>..."'
      ],
      transformations: [
        'Algoritmo ISO 3779: Multiplicación de cada carácter por ponderaciones oficiales mod 11',
        'Conversión cambiaria: $42,950 CAD * 0.7338 = ~$31,516.71 USD',
        'Conversión métrica: 38,200 km * 0.621371 = 23,736 millas',
        'Filtro de seguridad: Detección y bloqueo de inyecciones SQL y ataques XSS'
      ],
      outputs: [
        'Objeto VehicleClean fuertemente tipado con campos estandarizados'
      ],
      plsqlOrPythonSnippet: `# Domain Core: Validación ISO 3779 (Módulo 11)
def validate_vin_checksum(vin: str) -> bool:
    weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2]
    total = sum(CHAR_MAP[c] * weights[i] for i, c in enumerate(vin) if i != 8)
    expected = "X" if total % 11 == 10 else str(total % 11)
    if expected != vin[8]:
        raise InvalidVINChecksumException(vin, expected)
    return True`
    },
    {
      stepNumber: 3,
      title: 'Enriquecimiento & Criptografía',
      subtitle: 'Domain Core: Estimación y Firma Digital',
      tag: 'Depreciación + Hash SHA-256',
      icon: Cpu,
      color: '#8b5cf6',
      description:
        'Calcula el valor residual de mercado aplicando una curva exponencial de depreciación automotriz en función del año de fabricación, tipo de vehículo y millaje. Posteriormente calcula un hash SHA-256 único e inmutable para garantizar la trazabilidad y evitar colisiones.',
      inputs: [
        'Registro limpio: Año 2021, Millaje 23,736 mi, Precio $31,516.71 USD'
      ],
      transformations: [
        'Curva de depreciación: V_depr = Precio_base * (1 - 0.15)^edad * (1 - millaje/200000)',
        'Deducción léxica de versión/acabado (Trim tier) mediante análisis sintáctico',
        'Generación de huella criptográfica SHA-256(VIN + Portal + Precio + Timestamp)'
      ],
      outputs: [
        'Registro canónico final listo para inserción en base de datos relacional'
      ],
      plsqlOrPythonSnippet: `# Cálculo de depreciación y firma SHA-256
depr_factor = max(0.20, (1.0 - 0.12 * age) * (1.0 - mileage / 250000.0))
est_depr_value = round(clean_price * depr_factor, 2)

raw_signature = f"{vin}:{portal}:{clean_price}:{year}"
checksum_hash = hashlib.sha256(raw_signature.encode()).hexdigest()`
    },
    {
      stepNumber: 4,
      title: 'Persistencia Transaccional PL/SQL',
      subtitle: 'Driven Adapter: Base de Datos Relacional PostgreSQL',
      tag: 'Procedimientos Almacenados Idempotentes',
      icon: Database,
      color: '#f59e0b',
      description:
        'Los registros aprobados se consolidan en lotes de 128 elementos y se envían a la base de datos a través del procedimiento almacenado PL/pgSQL PKG_VEHICLE_INGEST.MERGE_BATCH. Las operaciones son atómicas (ACID) e idempotentes (UPSERT sobre VIN + portal). Los registros corruptos se aíslan en la tabla de cuarentena DLQ.',
      inputs: [
        'Batch JSON de registros validados por la capa de dominio'
      ],
      transformations: [
        'Ejecución del Stored Procedure proc_merge_batch() en un único viaje de red (Single Roundtrip)',
        'ON CONFLICT (vin, source_portal) DO UPDATE SET updated_at = NOW()...',
        'Canalización automática de fallos graves a la tabla vehicles_dlq'
      ],
      outputs: [
        'Inserción permanente en tabla canónica vehicles_clean',
        'Actualización de índices B-Tree para consultas de telemetría'
      ],
      plsqlOrPythonSnippet: `-- Driven Adapter: Procedimiento PL/SQL Idempotente
CREATE OR REPLACE FUNCTION proc_merge_vehicle(...) RETURNS VOID AS $$
BEGIN
    INSERT INTO vehicles_clean (vin, brand, model, year, mileage_mi, scraped_price_usd, est_depr_value_usd, status, checksum_hash)
    VALUES (p_vin, p_brand, p_model, p_year, p_mileage, p_price, p_depr, 'Clean Valid', p_hash)
    ON CONFLICT (vin, source_portal) DO UPDATE
    SET scraped_price_usd = EXCLUDED.scraped_price_usd,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;`
    },
    {
      stepNumber: 5,
      title: 'Telemetría & Monitoreo SLA en Vivo',
      subtitle: 'Monitoring Sink: Auditoría y Tableros Operacionales',
      tag: 'Event Streaming & Métricas SLA',
      icon: Terminal,
      color: '#38bdf8',
      description:
        'Cada lote persistido emite un evento auditado en la tabla pipeline_audit_logs. El frontend de telemetría consume los eventos para actualizar en vivo las tarjetas de métricas SLA, reflejar los tiempos de procesamiento en microsegundos y refrescar la tabla del búfer.',
      inputs: [
        'Registros auditados emitidos por los pods de ejecución y el motor PL/SQL'
      ],
      transformations: [
        'Cálculo en tiempo real de la tasa de ingesta (registros/minuto)',
        'Supervisión del umbral de valores nulos (< 2.0% SLA Threshold)',
        'Transmisión en streaming hacia la consola Live Audit Log'
      ],
      outputs: [
        'Visualización en vivo en el Panel de Telemetría',
        'Capacidad de descarga de lotes en formato CSV'
      ],
      plsqlOrPythonSnippet: `-- Inserción de logs de telemetría
INSERT INTO pipeline_audit_logs (worker_pod, log_level, component, message, source_portal)
VALUES (p_worker, 'PL/SQL', 'DB_SINK', FORMAT('Lote procesado: %s filas', v_count), 'AutoTrader');`
    }
  ];

  // Simulación paso a paso del viaje de datos (Data Journey)
  const journeySteps = [
    {
      step: 1,
      name: 'Extracción Cruda (Playwright)',
      badge: 'Extracción Web',
      statusColor: 'text-[#06b6d4]',
      stateData: {
        raw_title: '2021 Porsche 911 Carrera S Coupe 2D (Clean Title)',
        raw_price: '  $ 118,900 USD  ',
        raw_odometer: '18,450 mi',
        raw_vin: 'WP0AB2A99NS249811',
        source: 'AutoTrader (Túnel Residencial BrightData IP 198.51.100.44)',
        threat_level: 'Limpio (Sin inyecciones)'
      },
      explanation: 'El navegador Playwright descarga el DOM dinámico, evade la detección de bots con curvas Bézier y entrega el diccionario crudo.'
    },
    {
      step: 2,
      name: 'Validación ISO 3779 & Sanitización',
      badge: 'Normalización Core',
      statusColor: 'text-[#10b981]',
      stateData: {
        vin_normalized: 'WP0AB2A99NS249811',
        iso_checksum_status: 'VÁLIDO (Dígito en posición 9 es "9" == Calculado mod-11: 9)',
        sanitized_price_usd: 118900.00,
        sanitized_mileage_mi: 18450,
        sanitized_brand: 'Porsche',
        sanitized_model: '911'
      },
      explanation: 'Se valida matemáticamente la autenticidad del VIN y se esterilizan caracteres especiales.'
    },
    {
      step: 3,
      name: 'Deducción de Trim & Depreciación',
      badge: 'Enriquecimiento',
      statusColor: 'text-[#8b5cf6]',
      stateData: {
        extracted_trim: 'Carrera S Coupe 2D',
        vehicle_age: '3 años',
        depreciation_rate: '-18.4% sobre valor base',
        est_depr_value_usd: '$97,022.40 USD',
        sha256_checksum: '4f92d8b13a6e87c02b11548e6c4e09f58273... (64 hex)'
      },
      explanation: 'Se analiza el acabado del coche y se aplica la fórmula de depreciación actuarial junto con la firma SHA-256.'
    },
    {
      step: 4,
      name: 'Inserción Transaccional en Base de Datos',
      badge: 'Persistencia PL/SQL',
      statusColor: 'text-[#f59e0b]',
      stateData: {
        stored_procedure: 'PKG_VEHICLE_INGEST.MERGE_BATCH',
        table_destination: 'autodata_core.vehicles_clean',
        transaction_isolation: 'READ COMMITTED (ACID)',
        execution_time: '1.2 ms',
        row_status: 'Clean Valid'
      },
      explanation: 'El registro se consolida en PostgreSQL mediante un upsert atómico de alta velocidad que previene duplicados.'
    }
  ];

  const handleRunJourneySimulation = () => {
    setIsSimulatingJourney(true);
    setInteractiveModeStep(1);

    const timer = setInterval(() => {
      setInteractiveModeStep((prev) => {
        if (prev >= 4) {
          clearInterval(timer);
          setIsSimulatingJourney(false);
          return 4;
        }
        return prev + 1;
      });
    }, 1400);
  };

  const handleCopyFormula = () => {
    navigator.clipboard.writeText('total = sum(map(c) * weight[i]) % 11; check_digit = "X" if remainder == 10 else str(remainder)');
    setCopiedFormula(true);
    setTimeout(() => setCopiedFormula(false), 2000);
  };

  const activeStep = steps[activeStepIndex];

  return (
    <div id="how-it-works-container" className="space-y-6">
      {/* Banner Principal Informativo */}
      <div className="bg-gradient-to-r from-[#0b1b2d] via-[#09223b] to-[#0b1b2d] border border-[#1e293b] rounded-xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#0284c7]/20 text-[#38bdf8] border border-[#0284c7]/40">
                Guía de Arquitectura Visual
              </span>
              <span className="text-xs text-[#94a3b8] font-mono">Clean Data Pipeline &bull; Ports &amp; Adapters</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              ¿Cómo Funciona el Pipeline AutoData ETL?
            </h1>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Descubre paso a paso el ciclo de vida de los datos: desde la extracción sigilosa con Playwright y túneles proxy residenciales, 
              pasando por la validación matemática ISO 3779, hasta la persistencia idempotente en base de datos relacional mediante procedimientos almacenados PL/SQL.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunJourneySimulation}
              disabled={isSimulatingJourney}
              className="flex items-center space-x-2 bg-gradient-to-r from-[#0284c7] to-[#06b6d4] hover:from-[#0369a1] hover:to-[#0284c7] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-lg shadow-[#06b6d4]/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <Play className={`h-4 w-4 fill-current ${isSimulatingJourney ? 'animate-spin' : ''}`} />
              <span>{isSimulatingJourney ? 'Simulando Flujo...' : 'Simular Flujo Visual Completo'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Diagrama de Navegación de los 5 Pasos del Pipeline */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {steps.map((st, idx) => {
          const Icon = st.icon;
          const isSelected = activeStepIndex === idx;
          return (
            <button
              key={st.stepNumber}
              onClick={() => setActiveStepIndex(idx)}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#0f243a] border-[#06b6d4] shadow-lg shadow-[#06b6d4]/10'
                  : 'bg-[#0b1b2d] border-[#1e293b] hover:border-[#334155] hover:bg-[#0d1f33]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  isSelected ? 'bg-[#06b6d4] text-[#002b36]' : 'bg-[#1e293b] text-[#94a3b8]'
                }`}>
                  FASE 0{st.stepNumber}
                </span>
                <Icon className={`h-4 w-4 ${isSelected ? 'text-[#06b6d4]' : 'text-[#64748b]'}`} />
              </div>
              <div>
                <div className="text-xs font-bold text-white line-clamp-1">{st.title}</div>
                <div className="text-[10px] text-[#64748b] truncate mt-0.5">{st.tag}</div>
              </div>
              {isSelected && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#06b6d4]"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Detalle Profundo del Paso Seleccionado */}
      <div className="bg-[#0b1b2d] border border-[#1e293b] rounded-xl p-5 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Columna Izquierda: Explicación, Entradas, Transformaciones y Salidas (7 columnas) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-lg bg-[#020b14] border border-[#1e293b] flex items-center justify-center text-[#06b6d4]">
                <activeStep.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#06b6d4] font-bold">FASE 0{activeStep.stepNumber}</span>
                  <span className="text-sm font-bold text-white">{activeStep.title}</span>
                </div>
                <p className="text-xs text-[#94a3b8]">{activeStep.subtitle}</p>
              </div>
            </div>
            <span className="text-xs font-mono px-2 py-1 rounded bg-[#020b14] text-[#34d399] border border-[#059669]/30">
              {activeStep.tag}
            </span>
          </div>

          <p className="text-xs text-[#cbd5e1] leading-relaxed">
            {activeStep.description}
          </p>

          {/* Caja Bento: Entradas vs Transformaciones vs Salidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {/* Entradas */}
            <div className="bg-[#071322] border border-[#1e293b] rounded-lg p-3 space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-[#38bdf8] flex items-center gap-1">
                <ChevronRight className="h-3 w-3" />
                Entradas (Inputs)
              </span>
              <ul className="space-y-1.5 text-[11px] text-[#94a3b8]">
                {activeStep.inputs.map((inp, i) => (
                  <li key={i} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-[#38bdf8] text-xs font-mono">&bull;</span>
                    <span>{inp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Transformaciones */}
            <div className="bg-[#071322] border border-[#1e293b] rounded-lg p-3 space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-[#10b981] flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Transformaciones
              </span>
              <ul className="space-y-1.5 text-[11px] text-[#94a3b8]">
                {activeStep.transformations.map((t, i) => (
                  <li key={i} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-[#10b981] text-xs font-mono">&bull;</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Salidas */}
            <div className="bg-[#071322] border border-[#1e293b] rounded-lg p-3 space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-[#c084fc] flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Salidas (Outputs)
              </span>
              <ul className="space-y-1.5 text-[11px] text-[#94a3b8]">
                {activeStep.outputs.map((out, i) => (
                  <li key={i} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-[#c084fc] text-xs font-mono">&bull;</span>
                    <span>{out}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Código Fuente Representativo (5 columnas) */}
        <div className="lg:col-span-5 bg-[#050f1d] border border-[#1e293b] rounded-xl flex flex-col overflow-hidden font-mono text-xs">
          <div className="bg-[#091728] border-b border-[#1e293b] px-3 py-2 flex items-center justify-between text-[#94a3b8] text-[11px]">
            <span className="flex items-center gap-1.5 text-[#38bdf8] font-bold">
              <FileCode className="h-3.5 w-3.5" />
              Código Fuente del Módulo
            </span>
            <span className="text-[#64748b]">Producción</span>
          </div>
          <div className="p-3 text-[11px] overflow-x-auto text-[#cbd5e1] leading-relaxed flex-1 bg-[#020813]">
            <pre>
              <code>{activeStep.plsqlOrPythonSnippet}</code>
            </pre>
          </div>
          <div className="border-t border-[#1e293b] px-3 py-2 bg-[#091728] text-[10px] text-[#64748b] flex justify-between items-center">
            <span>Clean Architecture / Ports &amp; Adapters</span>
            <span className="text-[#10b981]">100% Cobertura QA</span>
          </div>
        </div>
      </div>

      {/* Recorrido Interactivo del Viaje de Datos (Data Journey) */}
      <div className="bg-[#0b1b2d] border border-[#1e293b] rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e293b] pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-[#f59e0b]" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                Simulador del Viaje de un Dato (Data Journey Walkthrough)
                <span className="text-[10px] font-mono text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/30 px-2 py-0.5 rounded">
                  Paso a Paso
                </span>
              </h2>
              <p className="text-xs text-[#94a3b8]">
                Observa la transformación exacta de un registro desde el navegador hasta la persistencia en disco
              </p>
            </div>
          </div>

          {/* Selector Manual de Pasos */}
          <div className="flex items-center space-x-1 font-mono text-xs">
            {journeySteps.map((js) => (
              <button
                key={js.step}
                onClick={() => setInteractiveModeStep(js.step)}
                className={`px-3 py-1 rounded transition-all ${
                  interactiveModeStep === js.step
                    ? 'bg-[#0284c7] text-white font-bold'
                    : 'bg-[#071322] text-[#94a3b8] hover:text-white'
                }`}
              >
                Paso {js.step}
              </button>
            ))}
          </div>
        </div>

        {/* Tarjeta del Paso Activo en el Viaje */}
        {(() => {
          const currentJourney = journeySteps.find((j) => j.step === interactiveModeStep) || journeySteps[0];
          return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* Resumen del Paso (4 columnas) */}
              <div className="lg:col-span-4 bg-[#071322] border border-[#1e293b] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#38bdf8]">
                    ETAPA {currentJourney.step} DE 4
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1e293b] text-[#cbd5e1]">
                    {currentJourney.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{currentJourney.name}</h3>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  {currentJourney.explanation}
                </p>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => setInteractiveModeStep((prev) => Math.max(1, prev - 1))}
                    disabled={interactiveModeStep === 1}
                    className="text-xs font-mono text-[#94a3b8] hover:text-white disabled:opacity-40 disabled:hover:text-[#94a3b8]"
                  >
                    &larr; Anterior
                  </button>
                  <button
                    onClick={() => setInteractiveModeStep((prev) => Math.min(4, prev + 1))}
                    disabled={interactiveModeStep === 4}
                    className="text-xs font-mono font-bold text-[#38bdf8] hover:text-white disabled:opacity-40 disabled:hover:text-[#38bdf8]"
                  >
                    Siguiente &rarr;
                  </button>
                </div>
              </div>

              {/* Visualización del Estado JSON / Diccionario (8 columnas) */}
              <div className="lg:col-span-8 bg-[#050f1d] border border-[#1e293b] rounded-xl p-4 font-mono text-xs overflow-hidden">
                <div className="flex items-center justify-between text-[11px] text-[#64748b] border-b border-[#1e293b] pb-2 mb-3">
                  <span className="text-[#38bdf8] font-bold">Estado del Payload en Memoria:</span>
                  <span className="text-[#10b981]">Estado: En Proceso</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  {Object.entries(currentJourney.stateData).map(([key, value]) => (
                    <div key={key} className="flex flex-wrap items-baseline gap-2 py-0.5 border-b border-[#1e293b]/30">
                      <span className="text-[#94a3b8] font-semibold">{key}:</span>
                      <span className="text-[#e2e8f0] font-normal break-all">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Tarjetas de Respuestas Arquitectónicas & Glosario */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Tarjeta 1: Algoritmo ISO 3779 (VIN Checksum) */}
        <div className="bg-[#0b1b2d] border border-[#1e293b] rounded-xl p-4 shadow-lg space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-[#10b981]" />
              Algoritmo ISO 3779 (Módulo 11)
            </span>
            <button
              onClick={handleCopyFormula}
              className="text-[10px] font-mono text-[#38bdf8] hover:underline flex items-center gap-1"
            >
              {copiedFormula ? <Check className="h-3 w-3 text-[#10b981]" /> : 'Copiar'}
            </button>
          </div>
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            Cada VIN de 17 caracteres tiene un dígito de control en la posición 9 calculado asignando un valor numérico a cada letra (excluyendo I, O, Q para evitar confusión) y multiplicándolo por una matriz de ponderaciones fija [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2]. El residuo de la suma módulo 11 determina si el VIN es legítimo o adulterado.
          </p>
        </div>

        {/* Tarjeta 2: ¿Por qué Procedimientos Almacenados PL/SQL? */}
        <div className="bg-[#0b1b2d] border border-[#1e293b] rounded-xl p-4 shadow-lg space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Database className="h-4 w-4 text-[#f59e0b]" />
              ¿Por qué PL/SQL para el Merge?
            </span>
            <span className="text-[10px] font-mono text-[#f59e0b] bg-[#f59e0b]/10 px-1.5 py-0.5 rounded">
              High Throughput
            </span>
          </div>
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            Los ORMs tradicionales generan múltiples consultas HTTP individuales que saturan el pool de conexiones. Con el procedimiento <code className="text-[#38bdf8]">proc_merge_batch</code>, un lote entero de 128 vehículos se transfiere como un único payload JSON, ejecutando inserciones con resolución de conflictos a nivel nativo en menos de 2 milisegundos.
          </p>
        </div>

        {/* Tarjeta 3: Resiliencia ante HTTP 429 */}
        <div className="bg-[#0b1b2d] border border-[#1e293b] rounded-xl p-4 shadow-lg space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Network className="h-4 w-4 text-[#06b6d4]" />
              Evasión y Rotación Dinámica
            </span>
            <span className="text-[10px] font-mono text-[#06b6d4] bg-[#06b6d4]/10 px-1.5 py-0.5 rounded">
              Anti-Bot Shield
            </span>
          </div>
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            Al navegar portales con defensas agresivas (Cloudflare, PerimeterX), el sistema intercepta códigos de estado HTTP 429 ("Too Many Requests"). Aplica retroceso exponencial con jitter y conmuta la sesión inmediatamente hacia una nueva dirección IP residencial de la malla de 1,500 nodos con huella TLS JA3 renovada.
          </p>
        </div>
      </div>
    </div>
  );
};
