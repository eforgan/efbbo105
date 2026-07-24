'use client';

import React from 'react';
import { Moon, Sun, Eye, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';
import { getSunTimesUtc, formatUtcHm, getMoonPhase, getNvgSuitability, NvgSuitability } from '../../lib/astronomy';

interface NvgBaseLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

const NVG_LOCATIONS: NvgBaseLocation[] = [
  { id: 'sazn', name: 'SAZN - Neuquén / Añelo (Vaca Muerta)', lat: -38.9489, lon: -68.1558 },
  { id: 'saar', name: 'SAAR - Rosario (Base HEMS UTV Fluvial)', lat: -32.9036, lon: -60.7844 },
  { id: 'sabe', name: 'SABE - Buenos Aires (SAME AÉREO / Santojanni)', lat: -34.5592, lon: -58.4156 },
  { id: 'pc', name: 'Punta Colorada / Boya 7 (YPF VMOS Offshore)', lat: -41.6967, lon: -65.0233 },
];

const NVG_BANNER: Record<NvgSuitability, { icon: React.ElementType; color: string; title: string; detail: string }> = {
  EXCELENTE: {
    icon: ShieldCheck,
    color: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300',
    title: 'Apto para Operación NVG HEMS',
    detail: 'Iluminación ambiental suficiente. Gafas AN/AVS-9 operativas con tubo fósforo verde/blanco sin asistencia adicional.',
  },
  MEDIO_REQUIERE_FARO: {
    icon: ShieldAlert,
    color: 'bg-amber-950/40 border-amber-500/40 text-amber-300',
    title: 'Apto con Precaución — Requiere Faro de Búsqueda',
    detail: 'Iluminación ambiental limitada. Mantenga faro de búsqueda LED preparado para aterrizaje en zona no iluminada y evalúe contraste de terreno.',
  },
  CRITICO_SIN_ILUMINACION: {
    icon: AlertTriangle,
    color: 'bg-rose-950/40 border-rose-500/40 text-rose-300',
    title: 'NO APTO — Iluminación Ambiental Insuficiente',
    detail: 'Por debajo del mínimo operativo (20%) para NVG sin iluminación artificial adicional. Evalúe abortar la fase nocturna o requerir superficie iluminada.',
  },
};

export const AstronomyNvgModule: React.FC = () => {
  const [selectedLocId, setSelectedLocId] = React.useState<string>('sazn');
  const [now, setNow] = React.useState<Date | null>(null);

  // Compute "today" only after mount so the SSR/first-paint HTML never
  // depends on the client's clock (avoids hydration mismatches).
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync of "today" on mount, not a render loop
    setNow(new Date());
  }, []);

  const loc = NVG_LOCATIONS.find(l => l.id === selectedLocId) || NVG_LOCATIONS[0];

  const astro = React.useMemo(() => {
    if (!now) return null;
    const sun = getSunTimesUtc(now, loc.lat, loc.lon);
    const moon = getMoonPhase(now);
    return {
      sunriseUtc: formatUtcHm(sun.sunriseUtc),
      sunsetUtc: formatUtcHm(sun.sunsetUtc),
      civilTwilightEndUtc: formatUtcHm(sun.civilTwilightEndUtc),
      moonPhase: moon.name,
      moonIlluminationPct: moon.illuminationPct,
      nvgSuitability: getNvgSuitability(moon.illuminationPct),
    };
  }, [now, loc]);

  if (!astro) {
    return (
      <div className="p-4 max-w-7xl mx-auto font-sans">
        <div className="glass-card p-8 rounded-xl border border-slate-800 text-center text-slate-500 text-xs font-mono">
          Calculando horarios astronómicos…
        </div>
      </div>
    );
  }

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
            className="bg-slate-900 text-xs font-mono text-cyan-300 rounded px-3 py-1.5 border border-slate-700 outline-none cursor-pointer truncate max-w-[200px] sm:max-w-none"
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
              <p className="text-base font-bold text-amber-300">{astro.sunriseUtc}</p>
              <p className="text-[10px] text-slate-500">Comienzo VFR Diurno</p>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400">Puesta del Sol (Sunset)</span>
              <p className="text-base font-bold text-amber-400">{astro.sunsetUtc}</p>
              <p className="text-[10px] text-slate-500">Fin VFR Solar</p>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 col-span-2">
              <span className="text-[10px] text-slate-400">Fin del Crepúsculo Civil (EENT)</span>
              <p className="text-lg font-bold text-cyan-300">{astro.civilTwilightEndUtc}</p>
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
              <p className="text-base font-bold text-slate-100">{astro.moonPhase}</p>
              <p className="text-[10px] text-slate-500">Calculada para hoy ({now?.toISOString().slice(0, 10)})</p>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400">% Iluminación Ambiental</span>
              <p className="text-xl font-bold text-emerald-400">{astro.moonIlluminationPct}%</p>
              <p className="text-[10px] text-slate-500">Mínimo para NVG: &gt; 20%</p>
            </div>
          </div>

          {/* NVG Status Banner */}
          {(() => {
            const banner = NVG_BANNER[astro.nvgSuitability];
            const BannerIcon = banner.icon;
            return (
              <div className={`p-4 rounded-xl border flex items-center space-x-3 ${banner.color}`}>
                <BannerIcon className="w-7 h-7 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold uppercase text-sm block">{banner.title}</span>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    Iluminación lunar estimada: {astro.moonIlluminationPct}%. {banner.detail}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
