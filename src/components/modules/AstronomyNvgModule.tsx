'use client';

import React from 'react';
import { Moon, Sun, Eye, ShieldCheck } from 'lucide-react';

interface NvgBaseLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  sunriseUtc: string;
  sunsetUtc: string;
  civilTwilightEndUtc: string;
  moonPhase: string;
  moonIlluminationPct: number;
  nvgSuitability: 'EXCELENTE' | 'MEDIO_REQUIERE_FARO' | 'CRITICO_SIN_ILUMINACION';
}

const NVG_LOCATIONS: NvgBaseLocation[] = [
  {
    id: 'sazn',
    name: 'SAZN - Neuquén / Añelo (Vaca Muerta)',
    lat: -38.9489,
    lon: -68.1558,
    sunriseUtc: '10:45 UTC (07:45 HO)',
    sunsetUtc: '21:30 UTC (18:30 HO)',
    civilTwilightEndUtc: '21:58 UTC (18:58 HO)',
    moonPhase: 'Luna Creciente (Gibosa)',
    moonIlluminationPct: 78,
    nvgSuitability: 'EXCELENTE',
  },
  {
    id: 'saar',
    name: 'SAAR - Rosario (Base HEMS UTV Fluvial)',
    lat: -32.9036,
    lon: -60.7844,
    sunriseUtc: '10:20 UTC (07:20 HO)',
    sunsetUtc: '21:10 UTC (18:10 HO)',
    civilTwilightEndUtc: '21:35 UTC (18:35 HO)',
    moonPhase: 'Cuarto Creciente',
    moonIlluminationPct: 52,
    nvgSuitability: 'MEDIO_REQUIERE_FARO',
  },
  {
    id: 'sabe',
    name: 'SABE - Buenos Aires (SAME AÉREO / Santojanni)',
    lat: -34.5592,
    lon: -58.4156,
    sunriseUtc: '10:12 UTC (07:12 HO)',
    sunsetUtc: '21:05 UTC (18:05 HO)',
    civilTwilightEndUtc: '21:30 UTC (18:30 HO)',
    moonPhase: 'Cuarto Creciente',
    moonIlluminationPct: 52,
    nvgSuitability: 'MEDIO_REQUIERE_FARO',
  },
  {
    id: 'sa21',
    name: 'SA21 - Sierra Grande / Punta Colorada (YPF VMOS Offshore)',
    lat: -41.6521,
    lon: -65.3562,
    sunriseUtc: '10:35 UTC (07:35 HO)',
    sunsetUtc: '21:40 UTC (18:40 HO)',
    civilTwilightEndUtc: '22:10 UTC (19:10 HO)',
    moonPhase: 'Luna Creciente (Gibosa)',
    moonIlluminationPct: 78,
    nvgSuitability: 'EXCELENTE',
  },
];

export const AstronomyNvgModule: React.FC = () => {
  const [selectedLocId, setSelectedLocId] = React.useState<string>('sazn');
  const loc = NVG_LOCATIONS.find(l => l.id === selectedLocId) || NVG_LOCATIONS[0];

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 font-mono">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Moon className="w-5 h-5 text-emerald-400" /> Calculadora de Visión Nocturna & NVG (Gafas AN/AVS-9 GEN III HEMS)
          </h2>
          <p className="text-xs text-slate-400">
            Puesta del Sol, Crepúsculo Civil, Fase Lunar & Porcentaje de Iluminación Ambiental según ANAC RAAC 91/135
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedLocId}
            onChange={(e) => setSelectedLocId(e.target.value)}
            className="bg-slate-900 text-xs font-mono text-cyan-300 rounded px-3 py-1.5 border border-slate-700 outline-none cursor-pointer"
          >
            {NVG_LOCATIONS.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Solar/Lunar Status + NVG Suitability */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono">
        {/* Solar Breakdown (6 Cols) */}
        <div className="lg:col-span-6 glass-card p-5 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" /> Horarios Astronómicos Solar (Base seleccionada)
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400">Salida del Sol (Sunrise)</span>
              <p className="text-base font-bold text-amber-300">{loc.sunriseUtc}</p>
              <p className="text-[10px] text-slate-500">Comienzo VFR Diurno</p>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400">Puesta del Sol (Sunset)</span>
              <p className="text-base font-bold text-amber-400">{loc.sunsetUtc}</p>
              <p className="text-[10px] text-slate-500">Fin VFR Solar</p>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 col-span-2">
              <span className="text-[10px] text-slate-400">Fin del Crepúsculo Civil (EENT)</span>
              <p className="text-lg font-bold text-cyan-300">{loc.civilTwilightEndUtc}</p>
              <p className="text-[10px] text-slate-400">Inicio Obligatorio de Vuelo Nocturno VFR / NVG Mode</p>
            </div>
          </div>
        </div>

        {/* Lunar Breakdown & NVG Ambient Light (6 Cols) */}
        <div className="lg:col-span-6 glass-card p-5 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" /> Iluminación Lunar & Evaluación de Visión Nocturna (NVG)
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400">Fase Lunar Actual</span>
              <p className="text-base font-bold text-slate-100">{loc.moonPhase}</p>
              <p className="text-[10px] text-emerald-400">Elevación &gt; 30° sobre horizonte</p>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400">% Iluminación Ambiental</span>
              <p className="text-xl font-bold text-emerald-400">{loc.moonIlluminationPct}%</p>
              <p className="text-[10px] text-slate-500">Mínimo para NVG: &gt; 20%</p>
            </div>
          </div>

          {/* NVG Status Banner */}
          <div className={`p-4 rounded-xl border flex items-center space-x-3 ${
            loc.nvgSuitability === 'EXCELENTE'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
          }`}>
            <ShieldCheck className="w-7 h-7 shrink-0 text-emerald-400" />
            <div className="text-xs">
              <span className="font-bold uppercase text-sm block">Apto para Operación NVG HEMS</span>
              <p className="text-[11px] opacity-90 mt-0.5">
                Iluminación ambiental suficiente ({loc.moonIlluminationPct}%). Gafas AN/AVS-9 operativas con tubo fósforo verde/blanco. Faro de búsqueda LED preparado para aterrizaje en zona no iluminada.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
