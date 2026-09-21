import React, { useState } from 'react';
import { 
  FlaskConical, 
  X, 
  Play, 
  CheckCircle2, 
  ShieldAlert
} from 'lucide-react';

interface ETLSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSimulatedVehicle: (vehicle: any) => void;
}

export const ETLSimulatorModal: React.FC<ETLSimulatorModalProps> = ({
  isOpen,
  onClose,
  onAddSimulatedVehicle,
}) => {
  const [rawVin, setRawVin] = useState('5YJ3E1EB7NF193820');
  const [rawPrice, setRawPrice] = useState(' $ 42,950 CAD ');
  const [rawOdometer, setRawOdometer] = useState('38,200 km');
  const [rawTitle, setRawTitle] = useState('Tesla Model 3 Long-Range Dual Motor AWD');
  const [sourcePortal, setSourcePortal] = useState('Carvana');
  const [batteryHealth, setBatteryHealth] = useState('94.2%');
  const [dealerZip, setDealerZip] = useState('94016-012');

  const [output, setOutput] = useState<any>(null);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);

  if (!isOpen) return null;

  // Preset templates
  const applyPreset = (type: 'cad_tesla' | 'porsche_valid' | 'xss_attack' | 'bad_vin' | 'sql_inj') => {
    setError(null);
    setOutput(null);
    if (type === 'cad_tesla') {
      setRawVin('5YJ3E1EB7NF193820');
      setRawPrice(' $ 42,950 CAD ');
      setRawOdometer('38,200 km');
      setRawTitle('Tesla Model 3 Long-Range Dual Motor AWD');
      setSourcePortal('Carvana');
      setBatteryHealth('94.2%');
      setDealerZip('94016-012');
    } else if (type === 'porsche_valid') {
      setRawVin('WP0AB2A99NS249811');
      setRawPrice('$118,900 USD');
      setRawOdometer('18,450 mi');
      setRawTitle('Porsche 911 Carrera S Coupe 2021');
      setSourcePortal('AutoTrader');
      setBatteryHealth('');
      setDealerZip('94016');
    } else if (type === 'xss_attack') {
      setRawVin('WP0AB2A99NS249811');
      setRawPrice('$45,000');
      setRawOdometer('12,000 mi');
      setRawTitle("<script>alert('XSS_ATTACK_EXPLOIT');</script> Corvette Z06");
      setSourcePortal('AutoTrader');
      setBatteryHealth('');
      setDealerZip('94016');
    } else if (type === 'bad_vin') {
      setRawVin('WP0AB2A90NS249811'); // '0' in check pos instead of '9'
      setRawPrice('$118,900 USD');
      setRawOdometer('18,450 mi');
      setRawTitle('Porsche 911 Carrera S');
      setSourcePortal('AutoTrader');
      setBatteryHealth('');
      setDealerZip('94016');
    } else if (type === 'sql_inj') {
      setRawVin("' OR '1'='1'; DROP TABLE vehicles_clean; --");
      setRawPrice('$50,000 USD');
      setRawOdometer('5,000 mi');
      setRawTitle("Mustang GT ' UNION SELECT null, password FROM users --");
      setSourcePortal('Cars.com');
      setBatteryHealth('');
      setDealerZip('94016');
    }
  };

  const handleSimulateCleaning = () => {
    setError(null);
    setOutput(null);

    // 1. Check for malicious patterns
    const malicious = [
      /<\s*script[^>]*>/i,
      /javascript\s*:/i,
      /on\w+\s*=/i,
      /(--|#|\/\*|\*\/|;\s*drop|;\s*delete|;\s*update|union\s+select)/i,
      /('\s*or\s*'1'\s*=\s*'1|'\s*or\s*1\s*=\s*1)/i,
    ];

    for (const pat of malicious) {
      if (pat.test(rawVin) || pat.test(rawTitle) || pat.test(rawPrice)) {
        setError({
          code: 'SEC_ERR_INJECTION_DETECTED',
          message: `ALERTA DE SEGURIDAD: Se detectó un patrón malicioso sospechoso en la carga entrante. Contenido neutralizado. Se aborta la persistencia y se audita el incidente en pipeline_audit_logs.`,
        });
        return;
      }
    }

    // 2. Validate VIN ISO 3779 checksum
    const cleanVin = rawVin.trim().toUpperCase();
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
    if (!vinRegex.test(cleanVin)) {
      setError({
        code: 'ERR_SCHEMA_VIN_INVALID_FORMAT',
        message: `El VIN '${cleanVin}' no cumple con el formato estándar ISO de 17 caracteres alfanuméricos (letras I, O, Q prohibidas). Registro canalizado a DLQ.`,
      });
      return;
    }

    const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
    const charMap: Record<string, number> = {
      A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
      J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
      S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
      '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    };

    let total = 0;
    for (let i = 0; i < 17; i++) {
      if (i === 8) continue;
      total += (charMap[cleanVin[i]] || 0) * weights[i];
    }
    const rem = total % 11;
    const expectedCheck = rem === 10 ? 'X' : String(rem);
    if (expectedCheck !== cleanVin[8]) {
      setError({
        code: 'ERR_SCHEMA_VIN_INVALID_CHECKSUM',
        message: `El VIN '${cleanVin}' no superó la verificación de integridad ISO 3779 (Módulo-11). Dígito esperado en pos 9: '${expectedCheck}', recibido: '${cleanVin[8]}'. Registro enviado a DLQ.`,
      });
      return;
    }

    // 3. Currency & Price parsing
    let fxRate = 1.0;
    const pStr = rawPrice.toUpperCase();
    if (pStr.includes('CAD')) fxRate = 0.7338;
    else if (pStr.includes('EUR')) fxRate = 1.085;

    const cleanDigits = pStr.replace(/[^0-9.]/g, '');
    const baseVal = parseFloat(cleanDigits);
    if (isNaN(baseVal)) {
      setError({
        code: 'ERR_DATA_PRICE_OUT_OF_BOUNDS',
        message: 'No se pudo interpretar una cifra numérica válida para el precio.',
      });
      return;
    }

    const priceUsd = Math.round(baseVal * fxRate * 100) / 100;
    if (priceUsd < 500.0 || priceUsd > 250000.0) {
      setError({
        code: 'ERR_DATA_PRICE_OUT_OF_BOUNDS',
        message: `Precio extraído fuera de los límites permitidos: $${priceUsd.toLocaleString()} USD fuera del rango admisible [$500 - $250,000 USD].`,
      });
      return;
    }

    // 4. Odometer
    let isKm = rawOdometer.toLowerCase().includes('km');
    const odoDigits = parseInt(rawOdometer.replace(/[^0-9]/g, '') || '0', 10);
    const mileageMi = isKm ? Math.round(odoDigits * 0.621371) : odoDigits;

    // 5. Taxonomy & Brand deduction
    let brand = 'AutoData Canónico';
    let model = 'Estándar';
    let trim = 'Base';
    const textCorpus = (rawTitle + ' ' + sourcePortal).toLowerCase();
    if (textCorpus.includes('tesla') || textCorpus.includes('model 3')) {
      brand = 'Tesla';
      model = 'Model 3';
      trim = textCorpus.includes('long-range') ? 'Long Range AWD' : 'Performance';
    } else if (textCorpus.includes('porsche') || textCorpus.includes('911')) {
      brand = 'Porsche';
      model = '911 Carrera S';
      trim = 'Carrera S Coupe';
    } else if (textCorpus.includes('ford') || textCorpus.includes('f-150')) {
      brand = 'Ford';
      model = 'F-150 Lightning';
      trim = 'Lariat';
    }

    // 6. Depreciated value
    const depr = Math.round(priceUsd * 0.94 * 100) / 100;

    // Result entity
    const cleanEntity = {
      id: `sim-${Date.now()}`,
      vin: cleanVin,
      brand,
      model,
      year: 2022,
      mileage_mi: mileageMi,
      scraped_price_usd: priceUsd,
      est_depr_value_usd: depr,
      trim_tier: trim,
      battery_health_pct: batteryHealth ? parseFloat(batteryHealth) : undefined,
      postal_code: dealerZip.split('-')[0],
      source_portal: sourcePortal,
      status: 'Clean Valid',
      checksum_hash: `sha256_${cleanVin.slice(0, 8)}_${priceUsd}_${Date.now()}`,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      raw_payload: {
        raw_price: rawPrice,
        raw_odometer: rawOdometer,
        raw_title: rawTitle,
        detected_currency: fxRate !== 1.0 ? 'CAD -> USD' : 'USD',
      },
    };

    setOutput(cleanEntity);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-mono">
      <div className="bg-[#071322] border border-[#1e293b] rounded-xl max-w-3xl w-full p-5 shadow-2xl space-y-4 max-h-[95vh] overflow-y-auto">
        {/* Cabecera del Simulador */}
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
          <div className="flex items-center space-x-2">
            <FlaskConical className="h-5 w-5 text-[#06b6d4]" />
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Simulador Interactivo de Pipeline ETL (Domain Cleaner)
              </h3>
              <p className="text-xs text-[#64748b]">
                Prueba en tiempo real el motor de limpieza, detección de inyecciones y validación ISO 3779
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#64748b] hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Plantillas de Prueba Rápida */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-[#94a3b8] uppercase font-bold">Cargar Plantilla de Prueba:</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => applyPreset('cad_tesla')}
              className="bg-[#0f243a] hover:bg-[#13304d] text-[#38bdf8] border border-[#0284c7]/40 px-2.5 py-1 rounded text-xs transition-colors"
            >
              Tesla Model 3 ($ CAD sucio &bull; km)
            </button>
            <button
              onClick={() => applyPreset('porsche_valid')}
              className="bg-[#0f243a] hover:bg-[#13304d] text-[#34d399] border border-[#059669]/40 px-2.5 py-1 rounded text-xs transition-colors"
            >
              Porsche 911 (Válido Canónico)
            </button>
            <button
              onClick={() => applyPreset('xss_attack')}
              className="bg-[#450a0a] hover:bg-[#7f1d1d] text-[#fca5a5] border border-[#991b1b] px-2.5 py-1 rounded text-xs transition-colors"
            >
              Inyección XSS (&lt;script&gt;)
            </button>
            <button
              onClick={() => applyPreset('bad_vin')}
              className="bg-[#451a03] hover:bg-[#78350f] text-[#fcd34d] border border-[#b45309] px-2.5 py-1 rounded text-xs transition-colors"
            >
              VIN con Checksum Corrupto
            </button>
            <button
              onClick={() => applyPreset('sql_inj')}
              className="bg-[#450a0a] hover:bg-[#7f1d1d] text-[#fca5a5] border border-[#991b1b] px-2.5 py-1 rounded text-xs transition-colors"
            >
              Inyección SQL (DROP TABLE)
            </button>
          </div>
        </div>

        {/* Campos de Entrada Crudos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-[#94a3b8] block mb-1">VIN Crudo (17 Caracteres):</label>
            <input
              type="text"
              value={rawVin}
              onChange={(e) => setRawVin(e.target.value)}
              className="w-full bg-[#020b14] border border-[#1e293b] rounded-lg p-2 text-white font-mono focus:border-[#06b6d4] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[#94a3b8] block mb-1">Cadena de Precio Cruda (Símbolos / FX):</label>
            <input
              type="text"
              value={rawPrice}
              onChange={(e) => setRawPrice(e.target.value)}
              className="w-full bg-[#020b14] border border-[#1e293b] rounded-lg p-2 text-white font-mono focus:border-[#06b6d4] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[#94a3b8] block mb-1">Odómetro Crudo (mi / km):</label>
            <input
              type="text"
              value={rawOdometer}
              onChange={(e) => setRawOdometer(e.target.value)}
              className="w-full bg-[#020b14] border border-[#1e293b] rounded-lg p-2 text-white font-mono focus:border-[#06b6d4] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[#94a3b8] block mb-1">Portal Objetivo:</label>
            <select
              value={sourcePortal}
              onChange={(e) => setSourcePortal(e.target.value)}
              className="w-full bg-[#020b14] border border-[#1e293b] rounded-lg p-2 text-white font-mono focus:border-[#06b6d4] focus:outline-none"
            >
              <option value="AutoTrader">AutoTrader</option>
              <option value="Cars.com">Cars.com</option>
              <option value="Carvana">Carvana</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-[#94a3b8] block mb-1">Título / Meta Extraído del DOM:</label>
            <input
              type="text"
              value={rawTitle}
              onChange={(e) => setRawTitle(e.target.value)}
              className="w-full bg-[#020b14] border border-[#1e293b] rounded-lg p-2 text-white font-mono focus:border-[#06b6d4] focus:outline-none"
            />
          </div>
        </div>

        {/* Botón Ejecutar Simulación */}
        <div className="flex justify-end pt-1">
          <button
            id="btn-simulate-etl-exec"
            onClick={handleSimulateCleaning}
            className="flex items-center space-x-2 bg-gradient-to-r from-[#0284c7] to-[#06b6d4] hover:from-[#0369a1] hover:to-[#0284c7] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg transition-all active:scale-95"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Ejecutar Pipeline ETL</span>
          </button>
        </div>

        {/* Sección de Salida: Error o Registro Canónico */}
        {error && (
          <div className="bg-[#450a0a]/50 border border-[#ef4444] rounded-xl p-3.5 text-xs space-y-1.5 animate-in fade-in">
            <div className="flex items-center space-x-2 text-[#f87171] font-bold">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>[{error.code}] Error en Pipeline</span>
            </div>
            <p className="text-[#fecaca] leading-relaxed">{error.message}</p>
            <div className="pt-1 text-[11px] text-[#fca5a5]">
              &bull; Acción tomada: Registro canalizado a la tabla de cuarentena (DLQ) sin bloquear el búfer de ingesta.
            </div>
          </div>
        )}

        {output && (
          <div className="bg-[#052e16]/40 border border-[#10b981] rounded-xl p-4 text-xs space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#059669]/50 pb-2">
              <div className="flex items-center space-x-2 text-[#34d399] font-bold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Transformación Exitosa &bull; Estado: {output.status}</span>
              </div>
              <button
                onClick={() => {
                  onAddSimulatedVehicle(output);
                  onClose();
                }}
                className="bg-[#059669] hover:bg-[#047857] text-white px-3 py-1 rounded text-xs font-semibold transition-colors"
              >
                Inyectar al Búfer en Vivo
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="bg-[#020b14] p-2 rounded border border-[#1e293b]">
                <span className="text-[#64748b] block">VIN Verificado:</span>
                <span className="text-[#38bdf8] font-bold">{output.vin}</span>
              </div>
              <div className="bg-[#020b14] p-2 rounded border border-[#1e293b]">
                <span className="text-[#64748b] block">Precio USD:</span>
                <span className="text-[#34d399] font-bold">${output.scraped_price_usd.toLocaleString()}</span>
              </div>
              <div className="bg-[#020b14] p-2 rounded border border-[#1e293b]">
                <span className="text-[#64748b] block">Millaje:</span>
                <span className="text-white font-bold">{output.mileage_mi.toLocaleString()} mi</span>
              </div>
              <div className="bg-[#020b14] p-2 rounded border border-[#1e293b]">
                <span className="text-[#64748b] block">Valor Depr. Est.:</span>
                <span className="text-[#34d399] font-bold">${output.est_depr_value_usd.toLocaleString()}</span>
              </div>
            </div>

            <div className="text-[10px] text-[#64748b] break-all border-t border-[#059669]/30 pt-2">
              Firma SHA-256: {output.checksum_hash}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
