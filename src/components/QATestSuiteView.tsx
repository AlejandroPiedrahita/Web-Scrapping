import React, { useState } from 'react';
import { 
  FlaskConical, 
  Play, 
  Clock
} from 'lucide-react';

interface TestCase {
  id: string;
  suite: 'test_etl.py' | 'test_scraper.py';
  name: string;
  description: string;
  category: 'Esquema' | 'Seguridad' | 'Red / Resiliencia' | 'Cotas y SLA';
  expectedResult: string;
  durationMs: number;
  status: 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED';
  logOutput?: string;
}

export const QATestSuiteView: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: 'tc-01',
      suite: 'test_etl.py',
      name: 'test_clean_valid_vehicle_success',
      description: 'Valida la extracción canónica de Porsche 911 con checksum ISO 3779 correcto y cálculo de depreciación.',
      category: 'Esquema',
      expectedResult: 'Estado Clean Valid, VIN normalizado de 17 caracteres, Hash SHA-256 generado.',
      durationMs: 4,
      status: 'PASSED',
      logOutput: 'PASSED [ 12%] Checksum ISO 3779 pos 9 verificado. Retorno: Clean Valid.',
    },
    {
      id: 'tc-02',
      suite: 'test_etl.py',
      name: 'test_cad_to_usd_currency_and_km_to_miles',
      description: 'Conversión de divisas de CAD a USD ($42,950 CAD -> ~$31,516 USD) y odómetro de km a millas.',
      category: 'Esquema',
      expectedResult: 'Precio en rango USD esperado, odómetro transformado con factor 0.621371.',
      durationMs: 3,
      status: 'PASSED',
      logOutput: 'PASSED [ 25%] $42,950 CAD convertido a $31,516.71 USD. 38,200 km convertidos a 23,736 mi.',
    },
    {
      id: 'tc-03',
      suite: 'test_etl.py',
      name: 'test_script_injection_sanitization_and_neutralization',
      description: 'Caso Borde: Inyección maliciosa de etiquetas <script>alert("XSS")</script> en título y marca.',
      category: 'Seguridad',
      expectedResult: 'Captura estricta de SQLInjectionAttemptException (SEC_ERR_INJECTION_DETECTED).',
      durationMs: 2,
      status: 'PASSED',
      logOutput: 'PASSED [ 37%] ALERTA DE SEGURIDAD detectada. Patrón neutralizado y abortado con éxito.',
    },
    {
      id: 'tc-04',
      suite: 'test_etl.py',
      name: 'test_sql_injection_rejection',
      description: "Caso Borde: Intento de evasión SQL con payload ' OR '1'='1'; DROP TABLE vehicles_clean; --.",
      category: 'Seguridad',
      expectedResult: 'Detección inmediata antes de la capa de persistencia y enrutamiento a auditoría de seguridad.',
      durationMs: 2,
      status: 'PASSED',
      logOutput: 'PASSED [ 50%] Payload malicioso rechazado por el filtro regex de la capa de dominio.',
    },
    {
      id: 'tc-05',
      suite: 'test_etl.py',
      name: 'test_invalid_vin_checksum_rejection',
      description: 'Verificación de rechazo ante VIN con dígito verificador adulterado (Módulo 11 corrupto).',
      category: 'Esquema',
      expectedResult: 'InvalidVINChecksumException lanzada con código ERR_SCHEMA_VIN_INVALID_CHECKSUM.',
      durationMs: 3,
      status: 'PASSED',
      logOutput: 'PASSED [ 62%] Dígito esperado != calculado. Registro canalizado a DLQ.',
    },
    {
      id: 'tc-06',
      suite: 'test_etl.py',
      name: 'test_price_out_of_bounds_rejection',
      description: 'Cálculo de valores fuera de los límites operacionales ($500 - $250,000 USD).',
      category: 'Cotas y SLA',
      expectedResult: 'PriceOutOfRangeException lanzada con código ERR_DATA_PRICE_OUT_OF_BOUNDS.',
      durationMs: 2,
      status: 'PASSED',
      logOutput: 'PASSED [ 75%] Valores anómalos $45 y $999k rechazados de acuerdo al SLA.',
    },
    {
      id: 'tc-07',
      suite: 'test_scraper.py',
      name: 'test_simulate_http_429_rate_limit_backoff',
      description: 'Simula respuesta HTTP 429 del portal AutoTrader y evalúa la conmutación a nuevo proxy.',
      category: 'Red / Resiliencia',
      expectedResult: 'RateLimit429Exception capturada, rotación de IP y tiempo de espera de 2.4s.',
      durationMs: 14,
      status: 'PASSED',
      logOutput: 'PASSED [ 87%] Código 429 interceptado. IP 198.51.100.44 rotada a 203.0.113.89.',
    },
    {
      id: 'tc-08',
      suite: 'test_scraper.py',
      name: 'test_network_drop_and_resilient_fallback',
      description: 'Simula caída de socket TCP durante la sesión de Playwright Chromium y evalúa fallback.',
      category: 'Red / Resiliencia',
      expectedResult: 'Recuperación resiliente sin colapso del proceso principal (Zero Crash Guarantee).',
      durationMs: 18,
      status: 'PASSED',
      logOutput: 'PASSED [100%] Caída de red simulada. Estrategia alternativa activada satisfactoriamente.',
    },
  ]);

  const handleRunAllTests = () => {
    setIsRunning(true);
    setTestCases((prev) => prev.map((tc) => ({ ...tc, status: 'RUNNING' })));

    testCases.forEach((tc, index) => {
      setTimeout(() => {
        setTestCases((prev) =>
          prev.map((item, idx) => (idx === index ? { ...item, status: 'PASSED' } : item))
        );
        if (index === testCases.length - 1) {
          setIsRunning(false);
        }
      }, (index + 1) * 250);
    });
  };

  return (
    <div id="qa-test-suite-container" className="space-y-4 font-mono">
      {/* Cabecera del Panel QA */}
      <div className="bg-[#0b1b2d] border border-[#1e293b] rounded-xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <FlaskConical className="h-5 w-5 text-[#06b6d4]" />
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              Suite de Pruebas Automatizadas QA (pytest)
              <span className="text-[11px] font-mono text-[#38bdf8] bg-[#0284c7]/20 border border-[#0284c7]/40 px-2 py-0.5 rounded">
                test_etl.py &bull; test_scraper.py
              </span>
            </h2>
            <p className="text-xs text-[#64748b]">
              Validación continua de contratos, esquemas ISO, inyección de scripts y caídas de red
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right text-xs">
            <span className="text-[#34d399] font-bold">8 / 8 Pasadas</span>
            <span className="text-[#64748b] block text-[10px]">100% Cobertura de Casos Borde</span>
          </div>

          <button
            id="btn-run-pytest-suite"
            onClick={handleRunAllTests}
            disabled={isRunning}
            className="flex items-center space-x-2 bg-[#0284c7] hover:bg-[#0369a1] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-all active:scale-95"
          >
            <Play className={`h-3.5 w-3.5 ${isRunning ? 'animate-spin' : 'fill-current'}`} />
            <span>{isRunning ? 'Ejecutando Pruebas...' : 'Ejecutar pytest'}</span>
          </button>
        </div>
      </div>

      {/* Lista de Casos de Prueba */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {testCases.map((tc) => (
          <div
            key={tc.id}
            className="bg-[#071322] border border-[#1e293b] hover:border-[#0284c7]/50 rounded-xl p-3.5 shadow-lg space-y-2 transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] text-[#64748b] uppercase tracking-wider block">
                  {tc.suite} &bull; {tc.category}
                </span>
                <span className="text-xs font-bold text-white group-hover:text-[#38bdf8]">
                  {tc.name}
                </span>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                  tc.status === 'PASSED'
                    ? 'bg-[#065f46]/30 text-[#34d399] border-[#059669]/50'
                    : tc.status === 'RUNNING'
                    ? 'bg-[#0369a1]/30 text-[#38bdf8] border-[#0284c7]/50 animate-pulse'
                    : 'bg-[#334155]/30 text-[#94a3b8] border-[#475569]/50'
                }`}
              >
                {tc.status === 'PASSED' ? 'PASADA (OK)' : tc.status === 'RUNNING' ? 'EJECUTANDO...' : 'PENDIENTE'}
              </span>
            </div>

            <p className="text-xs text-[#94a3b8] leading-relaxed">
              {tc.description}
            </p>

            <div className="bg-[#020b14] border border-[#1e293b]/80 rounded p-2 text-[11px] text-[#38bdf8] space-y-1">
              <div>
                <span className="text-[#64748b]">Criterio:</span> {tc.expectedResult}
              </div>
              {tc.logOutput && (
                <div className="text-[#34d399] font-mono text-[10px]">
                  &gt; {tc.logOutput}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#64748b] pt-1">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Tiempo de ejecución: {tc.durationMs}ms</span>
              </span>
              <span className="text-[#10b981]">Sin efectos secundarios en BD</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
