'use client';

import React from 'react';
import { CloudSun, Wind, Radio, CheckCircle2, AlertTriangle, Waves, Anchor, Thermometer, RefreshCw, WifiOff } from 'lucide-react';
import { INITIAL_METAR_STATIONS, PUNTA_COLORADA_SEA_STATE } from '../../lib/bo105-specs';
import { MetarStationInfo } from '../../types/efb';
import type { TafSummary } from '../../app/api/weather/route';

type FetchStatus = 'loading' | 'live' | 'offline';

export const WeatherDecoderModule: React.FC = () => {
  const [stations, setStations] = React.useState<MetarStationInfo[]>(INITIAL_METAR_STATIONS);
  const [tafs, setTafs] = React.useState<TafSummary[]>([]);
  const [status, setStatus] = React.useState<FetchStatus>('loading');
  const [fetchedAtUtc, setFetchedAtUtc] = React.useState<string | null>(null);
  const [selectedIcao, setSelectedIcao] = React.useState<string>('SAZN');
  const [rwHeadingDeg, setRwHeadingDeg] = React.useState<number>(270);

  const loadWeather = React.useCallback(async () => {
    setStatus('loading');
    try {
      const res = await fetch('/api/weather', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data.metars?.length) throw new Error('empty response');
      setStations(data.metars);
      setTafs(data.tafs ?? []);
      setFetchedAtUtc(data.fetchedAtUtc ?? new Date().toISOString());
      setStatus('live');
    } catch {
      // Keep whatever we already had (seed data on first load, last-known-good afterwards).
      setStatus('offline');
    }
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount, this is the documented async-effect pattern
    loadWeather();
  }, [loadWeather]);

  // Backgrounding the PWA (switching apps on a tablet, locking the screen) and returning to
  // it does NOT unmount/remount this component — the mount-effect above only covers switching
  // between EFB tabs. Re-fetch on the browser's own visibilitychange event so METAR/TAF is
  // current every time the crew actually looks at this section again, not just the first time.
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') loadWeather();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadWeather]);

  const activeStation = stations.find(s => s.icao === selectedIcao) || stations[0];
  const activeTaf = tafs.find(t => t.icao === selectedIcao) || null;

  // Wind component calculations
  const angleRad = ((activeStation.windDirDeg - rwHeadingDeg) * Math.PI) / 180;
  const headwindKt = Math.round(activeStation.windSpeedKt * Math.cos(angleRad));
  const crosswindKt = Math.round(Math.abs(activeStation.windSpeedKt * Math.sin(angleRad)));
  const isCrosswindSafe = crosswindKt <= 25;

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 font-mono">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-cyan-400" /> Decodificador METAR / TAF & Estado del Mar (Offshore Modena)
          </h2>
          <p className="text-xs text-slate-400">
            Estaciones de Control: Neuquén (SAZN), Rosario (SAAR), Aeroparque (SABE), San Fernando (SADF) y Punta Colorada (YPF VMOS Mar)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {status === 'live' && (
            <span className="text-xs bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              {fetchedAtUtc ? `METAR/TAF en vivo • ${new Date(fetchedAtUtc).toUTCString().slice(17, 22)} UTC` : 'METAR/TAF en vivo'}
            </span>
          )}
          {status === 'offline' && (
            <span className="text-xs bg-amber-950/40 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
              <WifiOff className="w-3.5 h-3.5" /> Sin conexión — mostrando datos de referencia
            </span>
          )}
          {status === 'loading' && (
            <span className="text-xs bg-slate-900 text-slate-400 border border-slate-700 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Consultando NOAA AWC…
            </span>
          )}
          <button
            onClick={loadWeather}
            disabled={status === 'loading'}
            title="Actualizar METAR/TAF"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Station Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        {stations.map(st => {
          const isSel = st.icao === selectedIcao;
          return (
            <div
              key={st.icao}
              onClick={() => setSelectedIcao(st.icao)}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                isSel
                  ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-sm text-slate-100">{st.icao}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  st.flightCategory === 'VFR' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {st.flightCategory}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">{st.name}</p>
              <div className="mt-2 text-[10px] text-slate-500 flex justify-between">
                <span>Viento: {st.windDirDeg}° / {st.windSpeedKt}kt</span>
                <span>Temp: {st.tempC}°C</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Weather Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
        {/* Raw METAR & Decoded Parameters */}
        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-2">
            METAR Decodificado - Estación {activeStation.icao} ({activeStation.name})
          </h3>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-cyan-300 font-bold text-xs">
            <code>{activeStation.rawMetar}</code>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400">Temperatura / Punto Rocío</span>
              <p className="text-base font-bold text-slate-100">{activeStation.tempC}°C / {activeStation.dewPointC}°C</p>
              <p className="text-[10px] text-slate-500">Humedad Relativa ~{Math.round(100 - (activeStation.tempC - activeStation.dewPointC) * 5)}%</p>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400">Presión Altimétrica (QNH)</span>
              <p className="text-base font-bold text-slate-100">{activeStation.qnhHpa} hPa</p>
              <p className="text-[10px] text-slate-500">{(activeStation.qnhHpa * 0.02953).toFixed(2)} inHg</p>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400">Visibilidad Horizontal</span>
              <p className="text-base font-bold text-emerald-400">{activeStation.visibilityKm} km</p>
              <p className="text-[10px] text-emerald-400">Cumple Mínimo VFR HEMS (&gt; 5 km)</p>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400">Nubosidad & Techo</span>
              <p className="text-base font-bold text-cyan-400">{activeStation.cloudCover}</p>
              <p className="text-[10px] text-slate-500">Base en cientos de pies (ej. 019 = 1,900 ft)</p>
            </div>
          </div>
        </div>

        {/* Wind Component Computer */}
        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
            <Wind className="w-4 h-4 text-cyan-400" /> Calculadora de Componentes de Viento
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Rumbo de Aproximación / Pista (°):</span>
                <span className="text-cyan-400 font-bold">{rwHeadingDeg}° M</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={10}
                value={rwHeadingDeg}
                onChange={(e) => setRwHeadingDeg(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400">Viento de Frente / Cola</span>
                <p className={`text-xl font-bold ${headwindKt >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {headwindKt >= 0 ? `+${headwindKt} kt (Frente)` : `${headwindKt} kt (Cola)`}
                </p>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400">Viento Cruzado (Crosswind)</span>
                <p className={`text-xl font-bold ${isCrosswindSafe ? 'text-cyan-400' : 'text-rose-400'}`}>
                  {crosswindKt} kt
                </p>
                <p className="text-[10px] text-slate-500">Límite Máx BO105: 25 kt</p>
              </div>
            </div>

            <div className={`p-3 rounded-lg border flex items-center gap-2 ${
              isCrosswindSafe ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}>
              {isCrosswindSafe ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
              <span>
                {isCrosswindSafe
                  ? 'Componente de viento cruzado dentro de límites seguros de operación del rotor rígido.'
                  : 'PRECAUCIÓN: Viento cruzado cercano o superior a 25 kt. Alinee el helicóptero con el viento relativo.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TAF Forecast Panel */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-4 font-mono">
        <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-2">
          TAF Pronóstico - Estación {activeStation.icao}
        </h3>

        {activeTaf ? (
          <>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-amber-300 font-bold text-xs whitespace-pre-wrap break-words">
              <code>{activeTaf.rawTaf}</code>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-900/80 text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-2">Periodo (UTC)</th>
                    <th className="p-2">Cambio</th>
                    <th className="p-2">Viento</th>
                    <th className="p-2">Visibilidad</th>
                    <th className="p-2">Nubosidad</th>
                    <th className="p-2">Fenómeno</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {activeTaf.periods.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="p-2 whitespace-nowrap">
                        {p.fromUtc.slice(11, 16)}–{p.toUtc.slice(11, 16)}
                      </td>
                      <td className="p-2">
                        {p.change || 'BASE'}{p.probability ? ` ${p.probability}%` : ''}
                      </td>
                      <td className="p-2">
                        {p.windDirDeg ?? '—'}° / {p.windSpeedKt ?? '—'}kt{p.windGustKt ? ` G${p.windGustKt}kt` : ''}
                      </td>
                      <td className="p-2">{p.visibilityKm} km</td>
                      <td className="p-2">{p.cloudCover}</td>
                      <td className="p-2">{p.weather || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-xs text-slate-500">
            {status === 'loading' ? 'Consultando pronóstico TAF…' : 'TAF no disponible para esta estación en este momento.'}
          </p>
        )}
      </div>

      {/* Sea State Panel for Punta Colorada Offshore (YPF VMOS) */}
      <div className="glass-card p-5 rounded-xl border border-cyan-500/30 font-mono space-y-4 bg-cyan-950/20">
        <div className="flex flex-wrap justify-between items-center border-b border-cyan-500/30 pb-3 gap-2">
          <div className="flex items-center space-x-2">
            <Waves className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h3 className="text-sm font-bold text-cyan-200 uppercase tracking-wider">
              Estado del Mar • Punta Colorada / Golfo San Matías (YPF VMOS Offshore)
            </h3>
          </div>
          <span className="text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-3 py-1 rounded-full font-bold">
            {PUNTA_COLORADA_SEA_STATE.douglasName}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 flex items-center space-x-3">
            <Anchor className="w-6 h-6 text-cyan-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Altura Significativa de Ola</span>
              <p className="text-lg font-bold text-slate-100">{PUNTA_COLORADA_SEA_STATE.waveHeightM} metros</p>
              <p className="text-[10px] text-cyan-400">Escala Douglas 3 (0.5m - 1.25m)</p>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 flex items-center space-x-3">
            <Wind className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Período de Marejada (Swell)</span>
              <p className="text-lg font-bold text-amber-300">{PUNTA_COLORADA_SEA_STATE.swellPeriodSec} segundos</p>
              <p className="text-[10px] text-slate-400">Dirección SSW en Golfo</p>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 flex items-center space-x-3">
            <Thermometer className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Temperatura del Agua</span>
              <p className="text-lg font-bold text-rose-300">{PUNTA_COLORADA_SEA_STATE.waterTempC}°C</p>
              <p className="text-[10px] text-rose-400 font-bold">Traje Seco Obligatorio (&lt; 15°C)</p>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Condición Ditching & Flotadores</span>
              <p className="text-lg font-bold text-emerald-400">APTO AMARIZAJE</p>
              <p className="text-[10px] text-slate-400">Balsa 6 pax armada + EBS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
