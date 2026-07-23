'use client';

import React from 'react';
import { Flame, ShieldAlert, AlertTriangle, ArrowUpRight, Gauge, Activity, BarChart3, Table } from 'lucide-react';
import { BO105_SPECS } from '../../lib/bo105-specs';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, LineChart, Line } from 'recharts';

export const OeiEmergencyPerfModule: React.FC = () => {
  const [takeoffWeightKg, setTakeoffWeightKg] = React.useState<number>(2350);
  const [pressureAltFt, setPressureAltFt] = React.useState<number>(1500);
  const [tempC, setTempC] = React.useState<number>(22);

  // OEI Performance Calculations
  const weightPenaltyFt = ((takeoffWeightKg - 2000) / 100) * 800;
  const tempPenaltyFt = (tempC - 15) * 120;
  const oeiCeilingFt = Math.max(0, Math.round(6500 - weightPenaltyFt - tempPenaltyFt));

  // OEI Climb Rate (fpm)
  const altitudePenaltyFpm = (pressureAltFt / 1000) * 80;
  const oeiClimbRateFpm = Math.round(350 - ((takeoffWeightKg - 2000) / 100) * 110 - altitudePenaltyFpm - (tempC - 15) * 12);

  const isLevelFlightPossible = pressureAltFt <= oeiCeilingFt;
  const bestVyKias = 65; // Best Rate of Climb OEI
  const bestAutorotationKias = 60; // Minimum Rate of Descent

  // Generate OEI Ceiling & Climb Rate Data across Weights (1800 kg to 2500 kg)
  const oeiWeightCurveData = React.useMemo(() => {
    const weights = [1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500];
    return weights.map(w => {
      const wPenFt = ((w - 2000) / 100) * 800;
      const ceiling = Math.max(0, Math.round(6500 - wPenFt - (tempC - 15) * 120));
      const climb = Math.round(350 - ((w - 2000) / 100) * 110 - (pressureAltFt / 1000) * 80 - (tempC - 15) * 12);
      return {
        weightKg: `${w} kg`,
        oeiCeilingFt: ceiling,
        oeiClimbFpm: climb,
        actualTow: takeoffWeightKg,
      };
    });
  }, [tempC, pressureAltFt, takeoffWeightKg]);

  // Generate Drift Down Descent Profile if current altitude > OEI ceiling
  const driftDownProfileData = React.useMemo(() => {
    // Level flight is sustainable OEI: no descent, altitude holds steady.
    if (pressureAltFt <= oeiCeilingFt) {
      return [
        { time: '0m', altitudeFt: pressureAltFt, targetCeiling: oeiCeilingFt },
        { time: '15m', altitudeFt: pressureAltFt, targetCeiling: oeiCeilingFt },
      ];
    }

    const points = [];
    const currentAlt = pressureAltFt;
    const sinkRateFpm = Math.abs(oeiClimbRateFpm < 0 ? oeiClimbRateFpm : -200);

    for (let min = 0; min <= 15; min += 2) {
      const alt = Math.max(oeiCeilingFt, Math.round(currentAlt - (min * sinkRateFpm)));
      points.push({
        time: `${min}m`,
        altitudeFt: alt,
        targetCeiling: oeiCeilingFt,
      });
      if (alt <= oeiCeilingFt) break;
    }
    return points;
  }, [pressureAltFt, oeiCeilingFt, oeiClimbRateFpm]);

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 font-mono">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500 animate-pulse" /> Computador & Gráficos de Desempeño de Emergencia OEI Monomotor
          </h2>
          <p className="text-xs text-slate-400">
            MBB Bölkow BO105 CBS-4 • Falla de 1 Motor Allison 250-C20B en Vuelo de Crucero / Drift Down
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs bg-rose-950/40 text-rose-300 border border-rose-500/40 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
            <ShieldAlert className="w-4 h-4 text-rose-400" /> Límite OEI Torque: 100% Cont. (108% 30 sec)
          </span>
        </div>
      </div>

      {/* Main Grid: Inputs + OEI Emergency Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono">
        {/* Controls Column (5 Cols) */}
        <div className="lg:col-span-5 glass-card p-4 rounded-xl border border-slate-800 space-y-4 text-xs">
          <h3 className="text-xs font-bold text-slate-100 uppercase border-b border-slate-800 pb-2 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-cyan-400" /> Parámetros Operativos
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Peso Total Helicóptero (kg):</span>
                <span className="text-amber-400 font-bold">{takeoffWeightKg} kg</span>
              </div>
              <input
                type="range"
                min={1800}
                max={2500}
                step={25}
                value={takeoffWeightKg}
                onChange={(e) => setTakeoffWeightKg(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded accent-amber-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">MTOW Máximo: {BO105_SPECS.mtowKg} kg</span>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Altitud de Presión Actual (ft):</span>
                <span className="text-cyan-400 font-bold">{pressureAltFt} ft</span>
              </div>
              <input
                type="range"
                min={0}
                max={8000}
                step={100}
                value={pressureAltFt}
                onChange={(e) => setPressureAltFt(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Temperatura Exterior (°C):</span>
                <span className="text-emerald-400 font-bold">{tempC}°C</span>
              </div>
              <input
                type="range"
                min={-10}
                max={45}
                value={tempC}
                onChange={(e) => setTempC(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Results Column (7 Cols) */}
        <div className="lg:col-span-7 glass-card p-5 rounded-xl border border-slate-800 space-y-4 text-xs">
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-400" /> Resultados de Desempeño OEI Monomotor
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400">Techo Máximo OEI (Level Flight)</span>
              <p className="text-xl font-bold text-cyan-300">{oeiCeilingFt} ft</p>
              <p className="text-[10px] text-slate-500">Mantenimiento de altitud en 1 motor</p>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400">Régimen Ascenso OEI (Climb Rate)</span>
              <p className={`text-xl font-bold ${oeiClimbRateFpm >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {oeiClimbRateFpm >= 0 ? `+${oeiClimbRateFpm} fpm` : `${oeiClimbRateFpm} fpm (Descenso)`}
              </p>
              <p className="text-[10px] text-slate-500">Con Vy = {bestVyKias} KIAS</p>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400">Velocidad Vy OEI (Mejor Ascenso)</span>
              <p className="text-xl font-bold text-amber-300">{bestVyKias} KIAS</p>
              <p className="text-[10px] text-slate-500">Ajustar paso colectivo para Vy</p>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400">Velocidad Mínimo Descenso</span>
              <p className="text-xl font-bold text-emerald-300">{bestAutorotationKias} KIAS</p>
              <p className="text-[10px] text-slate-500">Glide en Autorrotación</p>
            </div>
          </div>

          {/* OEI Status Alert Banner */}
          <div className={`p-4 rounded-xl border flex items-center space-x-3 ${
            isLevelFlightPossible
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}>
            {isLevelFlightPossible ? (
              <ArrowUpRight className="w-7 h-7 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-7 h-7 shrink-0 text-rose-400" />
            )}
            <div>
              <span className="font-bold uppercase text-sm block">
                {isLevelFlightPossible ? 'Capacidad de Vuelo Nivelado OEI Asegurada' : 'Drift Down Requerido (Pérdida Gradual de Altitud)'}
              </span>
              <p className="text-[11px] opacity-90 mt-0.5">
                {isLevelFlightPossible
                  ? `La altitud de presión actual (${pressureAltFt} ft) está por debajo del techo OEI (${oeiCeilingFt} ft). Mantenga ${bestVyKias} KIAS y busque aeródromo / helipuerto más cercano.`
                  : `Altitud actual por encima del techo monomotor (${oeiCeilingFt} ft). El helicóptero descenderá a ${oeiClimbRateFpm} fpm hasta estabilizar en ${oeiCeilingFt} ft.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Recharts Charts Grid for OEI Monomotor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
        {/* Chart 1: OEI Ceiling & Climb Rate vs Gross Weight */}
        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" /> Gráfica de Techo Operativo OEI (ft) vs Peso Total (kg)
          </h3>
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={oeiWeightCurveData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="weightKg" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[0, 8000]} tick={{ fill: '#06b6d4', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <ReferenceLine x={`${takeoffWeightKg} kg`} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `TOW ${takeoffWeightKg}kg`, fill: '#f59e0b', fontSize: 10 }} />
                <Area type="monotone" dataKey="oeiCeilingFt" name="Techo Monomotor (ft)" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.25} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Drift Down Profile */}
        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-400" /> Perfil de Descenso / Drift Down OEI en Emergencia
          </h3>
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={driftDownProfileData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[0, 8000]} tick={{ fill: '#f43f5e', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <ReferenceLine y={oeiCeilingFt} stroke="#10b981" strokeDasharray="3 3" label={{ value: `Techo OEI (${oeiCeilingFt}ft)`, fill: '#10b981', fontSize: 10 }} />
                <Line type="monotone" dataKey="altitudeFt" name="Altitud Helicóptero (ft)" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive Data Table for OEI Performance */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-3">
        <h3 className="font-bold text-slate-200 uppercase tracking-wider text-xs flex items-center gap-2">
          <Table className="w-4 h-4 text-cyan-400" /> Tabla de Referencia de Rendimiento Monomotor OEI por Peso
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                <th className="py-2 px-2">Peso Bruto (kg)</th>
                <th className="py-2 px-2">Techo Monomotor (ft)</th>
                <th className="py-2 px-2">Ascenso Monomotor @ Vy (fpm)</th>
                <th className="py-2 px-2">Velocidad Vy Optima</th>
                <th className="py-2 px-2">Capacidad Operativa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-[11px]">
              {oeiWeightCurveData.map((row, idx) => {
                const isSelected = row.weightKg === `${takeoffWeightKg} kg`;
                const canClimb = row.oeiClimbFpm > 0;
                return (
                  <tr key={idx} className={isSelected ? 'bg-cyan-950/40 font-bold' : 'hover:bg-slate-900/40'}>
                    <td className="py-2 px-2 text-amber-400">{row.weightKg}</td>
                    <td className="py-2 px-2 text-cyan-300 font-bold">{row.oeiCeilingFt} ft</td>
                    <td className={`py-2 px-2 font-bold ${canClimb ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {row.oeiClimbFpm > 0 ? `+${row.oeiClimbFpm} fpm` : `${row.oeiClimbFpm} fpm`}
                    </td>
                    <td className="py-2 px-2 text-slate-200">65 KIAS</td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        canClimb
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {canClimb ? 'ASCENSO OK' : 'DRIFT DOWN'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
