import React, { useState } from 'react';
import { 
  Layers, 
  FolderTree, 
  Code2, 
  Database, 
  Globe, 
  Cpu
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [activeCodeFile, setActiveCodeFile] = useState<string>('cleaner.py');

  const filesContent: Record<string, { lang: string; path: string; desc: string; code: string }> = {
    'cleaner.py': {
      lang: 'python',
      path: '/backend/app/domain/cleaner.py',
      desc: 'Domain Core: Servicio de limpieza, validación ISO 3779 (mod-11), deducción NLP y anti-inyección.',
      code: `"""Módulo de Limpieza y Estandarización ETL (Domain Core)
Implementa el motor de normalización ISO-VIN-2024.B, validación de checksum ISO 3779,
conversión de divisas, sanitización estricta anti-inyección y deducción algorítmica.
"""

import re
import hashlib
from typing import Dict, Any, List, Optional
import pandas as pd

from app.core.entities import VehicleRaw, VehicleClean, VehicleStatus
from app.core.exceptions import (
    InvalidVINChecksumException,
    PriceOutOfRangeException,
    SQLInjectionAttemptException,
    NullFieldThresholdExceededException,
)
from app.core.ports import VehicleCleanerPort


class VehicleCleanerService(VehicleCleanerPort):
    """Implementación de producción de la capa de transformación y sanitización del dominio."""

    VIN_REGEX = re.compile(r"^[A-HJ-NPR-Z0-9]{17}$")
    VIN_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2]
    VIN_CHAR_MAP = { ... }

    def validate_vin_checksum(self, vin: str) -> bool:
        """Calcula y valida el dígito verificador ISO 3779 (Módulo 11) en la posición 9 del VIN."""
        vin = vin.strip().upper()
        if not self.VIN_REGEX.match(vin):
            return False

        total = sum(self.VIN_CHAR_MAP.get(char, 0) * self.VIN_WEIGHTS[i] 
                    for i, char in enumerate(vin) if i != 8)
        remainder = total % 11
        expected_check = "X" if remainder == 10 else str(remainder)
        
        if expected_check != vin[8]:
            raise InvalidVINChecksumException(vin, expected_check, vin[8])
        return True

    def parse_price(self, raw_price: Optional[str]) -> float:
        """Limpia símbolos de moneda, aplica conversión FX a USD y valida cotas numéricas."""
        # Convierte $42,950 CAD -> ~$31,516.71 USD y valida rango $500 - $250k
        ...`,
    },
    'playwright_scraper.py': {
      lang: 'python',
      path: '/backend/app/adapters/scrapers/playwright_scraper.py',
      desc: 'Driving Adapter: Flota de navegadores Playwright con curvas Bézier, rotación y backoff 429.',
      code: `"""Adapter de Web Scraping de Producción con Playwright y Pandas
Ejecuta sesiones de navegación headless sigilosas con emulación de curvas Bézier,
rotación de túneles proxy, control de tasa 429 y extracción de atributos para la tabla canónica.
"""

from playwright.async_api import async_playwright, Browser, BrowserContext, Page
import pandas as pd

class PlaywrightCrawlerFleet:
    """Orquestador de navegadores Playwright para extracción masiva y limpia."""

    async def _simulate_human_mouse_movement(self, page: Page) -> None:
        """Simula interpolación de curvas Bézier con jitter y aceleración realista."""
        steps = random.randint(5, 12)
        ...

    async def scrape_portal_to_dataframe(
        self, portal_name: str, target_url: str, proxy_url: str = None
    ) -> pd.DataFrame:
        """Ejecuta navegación, captura 429 para rotación de IPs y retorna DataFrame limpio."""
        ...`,
    },
    '02_plsql_procedures.sql': {
      lang: 'sql',
      path: '/backend/database/02_plsql_procedures.sql',
      desc: 'Driven Adapter: Procedimientos almacenados PL/pgSQL para upsert idempotente y telemetría.',
      code: `-- Procedimiento de Ingesta Masiva por Lotes (Batch Merge)
-- Emula el comportamiento observado en la consola:
-- EXEC PKG_VEHICLE_INGEST.MERGE_BATCH(p_batch_size=>128, p_checksum_mode=>'SHA256');

CREATE OR REPLACE FUNCTION proc_merge_batch(
    p_batch_json JSONB,
    p_worker_pod VARCHAR(50) DEFAULT 'worker-pod-01'
) RETURNS TABLE(inserted_count INT, failed_count INT) AS $$
DECLARE
    v_item RECORD;
    v_success INT := 0;
    v_fail INT := 0;
BEGIN
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_batch_json) AS x(...) LOOP
        PERFORM proc_merge_vehicle(v_item.vin, v_item.brand, ...);
        v_success := v_success + 1;
    END LOOP;

    INSERT INTO pipeline_audit_logs (...) 
    VALUES (p_worker_pod, 'PL/SQL', 'DB_SINK', 
            FORMAT('EXEC PKG_VEHICLE_INGEST.MERGE_BATCH: %s filas afectadas.', v_success));
            
    RETURN QUERY SELECT v_success, v_fail;
END;
$$ LANGUAGE plpgsql;`,
    },
    'test_etl.py': {
      lang: 'python',
      path: '/backend/tests/test_etl.py',
      desc: 'Suite de pruebas QA con pytest: Schemas ISO-VIN-2024.B, inyecciones XSS y SQL, y cotas.',
      code: `class TestVehicleETLCleaner:
    """Conjunto de pruebas de validación de reglas de negocio y calidad de datos."""

    def test_clean_valid_vehicle_success(self, cleaner_service, valid_porsche_raw):
        clean_item = cleaner_service.clean_record(valid_porsche_raw)
        assert clean_item.vin == "WP0AB2A99NS249811"
        assert clean_item.status == VehicleStatus.CLEAN_VALID

    def test_script_injection_sanitization_and_neutralization(self, cleaner_service):
        """Caso Borde: Neutralización de ataques de inyección de script."""
        with pytest.raises(SQLInjectionAttemptException) as exc_info:
            cleaner_service.clean_record(malicious_script_payload)
        assert "ALERTA DE SEGURIDAD" in exc_info.value.message`,
    },
  };

  return (
    <div id="architecture-view-container" className="space-y-4">
      {/* Tarjeta de Diagrama Hexagonal Ports & Adapters */}
      <div className="bg-[#0b1b2d] border border-[#1e293b] rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <Layers className="h-5 w-5 text-[#06b6d4]" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Arquitectura Limpia Modular (Clean Data Pipeline / Ports &amp; Adapters)
              </h2>
              <p className="text-xs text-[#64748b]">
                Separación estricta entre Dominio Central, Puertos Abstractos y Adaptadores de Entrada/Salida
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#10b981] bg-[#065f46]/30 border border-[#059669]/50 px-2.5 py-1 rounded">
            Patrón Hexagonal + Strategy + Repository
          </span>
        </div>

        {/* Diagrama Visual de Capas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          {/* Capa 1: Adaptadores de Entrada (Driving / Inbound) */}
          <div className="bg-[#040f1a] border border-[#0284c7]/40 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center space-x-2 text-[#38bdf8] font-bold pb-1 border-b border-[#1e293b]">
              <Globe className="h-4 w-4" />
              <span>1. Adaptadores de Entrada (Driving)</span>
            </div>
            <p className="text-[11px] text-[#64748b]">
              Capturan datos del entorno externo o reciben comandos:
            </p>
            <div className="space-y-1.5">
              <div className="bg-[#0b1b2d] p-2 rounded border border-[#1e293b]">
                <span className="text-[#38bdf8] font-semibold block">Playwright Crawler Fleet</span>
                <span className="text-[10px] text-[#94a3b8]">32 Workers, Curvas Bézier, Bypass Antibot</span>
              </div>
              <div className="bg-[#0b1b2d] p-2 rounded border border-[#1e293b]">
                <span className="text-[#38bdf8] font-semibold block">FastAPI Ingest Endpoints</span>
                <span className="text-[10px] text-[#94a3b8]">/api/v1/pipeline, /api/v1/metrics</span>
              </div>
              <div className="bg-[#0b1b2d] p-2 rounded border border-[#1e293b]">
                <span className="text-[#38bdf8] font-semibold block">Strategy Pattern Portals</span>
                <span className="text-[10px] text-[#94a3b8]">AutoTraderStrategy, CarsComStrategy</span>
              </div>
            </div>
          </div>

          {/* Capa 2: Núcleo de Dominio & Puertos (Domain Core) */}
          <div className="bg-[#040f1a] border border-[#10b981]/50 rounded-xl p-3.5 space-y-2 relative">
            <div className="flex items-center space-x-2 text-[#34d399] font-bold pb-1 border-b border-[#1e293b]">
              <Cpu className="h-4 w-4" />
              <span>2. Núcleo de Dominio (Domain Core)</span>
            </div>
            <p className="text-[11px] text-[#64748b]">
              Lógica pura de negocio independiente de frameworks externos:
            </p>
            <div className="space-y-1.5">
              <div className="bg-[#0b1b2d] p-2 rounded border border-[#10b981]/30">
                <span className="text-[#34d399] font-semibold block">VehicleCleanerService</span>
                <span className="text-[10px] text-[#94a3b8]">ISO-VIN-2024.B, Módulo-11, Normalización</span>
              </div>
              <div className="bg-[#0b1b2d] p-2 rounded border border-[#10b981]/30">
                <span className="text-[#34d399] font-semibold block">Sanitización Anti-Inyección</span>
                <span className="text-[10px] text-[#94a3b8]">Filtros Regex XSS &amp; SQLi Estrictos</span>
              </div>
              <div className="bg-[#0b1b2d] p-2 rounded border border-[#10b981]/30">
                <span className="text-[#34d399] font-semibold block">Deducción de Taxonomía NLP</span>
                <span className="text-[10px] text-[#94a3b8]">Resolución Trim, Matriz de Depreciación</span>
              </div>
            </div>
          </div>

          {/* Capa 3: Adaptadores de Salida y Persistencia (Driven / Outbound) */}
          <div className="bg-[#040f1a] border border-[#a855f7]/50 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center space-x-2 text-[#c084fc] font-bold pb-1 border-b border-[#1e293b]">
              <Database className="h-4 w-4" />
              <span>3. Persistencia y Salida (Driven)</span>
            </div>
            <p className="text-[11px] text-[#64748b]">
              Almacenan datos y emiten eventos a infraestructura:
            </p>
            <div className="space-y-1.5">
              <div className="bg-[#0b1b2d] p-2 rounded border border-[#1e293b]">
                <span className="text-[#c084fc] font-semibold block">PostgreSQL / PL-SQL Procedures</span>
                <span className="text-[10px] text-[#94a3b8]">proc_merge_batch, proc_merge_vehicle</span>
              </div>
              <div className="bg-[#0b1b2d] p-2 rounded border border-[#1e293b]">
                <span className="text-[#c084fc] font-semibold block">Dead-Letter Queue (DLQ)</span>
                <span className="text-[10px] text-[#94a3b8]">Cuarentena para colisiones de unicidad</span>
              </div>
              <div className="bg-[#0b1b2d] p-2 rounded border border-[#1e293b]">
                <span className="text-[#c084fc] font-semibold block">Auditoría &amp; Telemetría</span>
                <span className="text-[10px] text-[#94a3b8]">Buffer de eventos y métricas de clúster</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explorador de Árbol de Proyecto e Inspector de Código Fuente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Árbol de Carpetas del Proyecto */}
        <div className="bg-[#0b1b2d] border border-[#1e293b] rounded-xl p-4 shadow-lg">
          <div className="flex items-center space-x-2 border-b border-[#1e293b] pb-2.5 mb-3">
            <FolderTree className="h-4 w-4 text-[#06b6d4]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Estructura Modular del Proyecto
            </h3>
          </div>

          <div className="text-xs font-mono space-y-1 text-[#cbd5e1] leading-relaxed select-none">
            <div className="text-[#38bdf8] font-bold">/backend</div>
            <div className="pl-3">├── Dockerfile <span className="text-[#64748b]">(Multistage)</span></div>
            <div className="pl-3">├── docker-compose.yml <span className="text-[#64748b]">(Postgres + API + Worker)</span></div>
            <div className="pl-3">├── requirements.txt</div>
            <div className="pl-3">├── .env.example</div>
            <div className="pl-3 text-[#38bdf8] font-semibold">├── app/</div>
            <div className="pl-6">├── main.py <span className="text-[#64748b]">(FastAPI)</span></div>
            <div className="pl-6 text-[#10b981] font-semibold">├── core/</div>
            <div className="pl-9 text-[#94a3b8]">├── config.py, entities.py, ports.py, exceptions.py</div>
            <div className="pl-6 text-[#10b981] font-semibold">├── domain/</div>
            <div className="pl-9 text-[#94a3b8]">├── cleaner.py <span className="text-[#38bdf8] font-bold">(ETL Core)</span></div>
            <div className="pl-9 text-[#94a3b8]">└── strategies/ <span className="text-[#f59e0b]">(Strategy Pattern)</span></div>
            <div className="pl-6 text-[#a855f7] font-semibold">├── adapters/</div>
            <div className="pl-9 text-[#94a3b8]">├── scrapers/playwright_scraper.py</div>
            <div className="pl-9 text-[#94a3b8]">└── persistence/postgres_repository.py</div>
            <div className="pl-6 text-[#38bdf8] font-semibold">└── api/routes/</div>
            <div className="pl-9 text-[#94a3b8]">└── metrics.py, pipeline.py, data_preview.py</div>
            <div className="pl-3 text-[#f59e0b] font-semibold">├── database/</div>
            <div className="pl-6 text-[#94a3b8]">├── 01_schema.sql <span className="text-[#64748b]">(DDL)</span></div>
            <div className="pl-6 text-[#94a3b8]">└── 02_plsql_procedures.sql <span className="text-[#64748b]">(PL/pgSQL)</span></div>
            <div className="pl-3 text-[#ec4899] font-semibold">└── tests/</div>
            <div className="pl-6 text-[#94a3b8]">├── test_etl.py &bull; test_scraper.py</div>
          </div>
        </div>

        {/* Visor de Código Fuente */}
        <div className="lg:col-span-2 bg-[#050f1d] border border-[#1e293b] rounded-xl overflow-hidden shadow-xl flex flex-col font-mono">
          <div className="bg-[#091728] border-b border-[#1e293b] px-4 py-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Code2 className="h-4 w-4 text-[#06b6d4]" />
              <span className="text-xs font-semibold text-white">
                {filesContent[activeCodeFile].path}
              </span>
            </div>

            <div className="flex items-center space-x-1">
              {Object.keys(filesContent).map((fileName) => (
                <button
                  key={fileName}
                  onClick={() => setActiveCodeFile(fileName)}
                  className={`px-2 py-0.5 text-[11px] rounded transition-all ${
                    activeCodeFile === fileName
                      ? 'bg-[#0284c7] text-white font-bold'
                      : 'text-[#94a3b8] hover:text-white hover:bg-[#1e293b]'
                  }`}
                >
                  {fileName}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#040a12] px-4 py-2 border-b border-[#1e293b]/60 text-[11px] text-[#38bdf8]">
            {filesContent[activeCodeFile].desc}
          </div>

          <div className="flex-1 p-4 overflow-x-auto text-xs leading-relaxed text-[#d1d5db] bg-[#02070f] max-h-[360px] overflow-y-auto">
            <pre>
              <code>{filesContent[activeCodeFile].code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
