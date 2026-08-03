'use client';

import React from 'react';
import { PerformanceResult } from '../../types/efb';
import { calculatePerformance, calculatePowerCurve } from '../../lib/calculations';
import { useEfbData } from '../../context/EfbDataContext';
import { Gauge, Thermometer, Wind, Mountain, AlertOctagon, CheckCircle2, BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts';

export const PerformanceCalcModule: React.FC = () => {
  const { performanceInput: input, setPerformanceInput: setInput } = useEfbData();

  const result: PerformanceResult = React.useMemo(() => calculatePerformance(input), [input]);

  // Generate chart data for HIGE vs HOGE across density altitudes
  const performanceCurveData = React.useMemo(() => {
    const altitudes = [0, 2000, 4000, 6000, 8000, 10000];
    return altitudes.map(alt => {
      const p = calculatePerformance({ ...input, pressureAltFt: alt });
      return {
        altitude: `${alt} ft`,
        higeMaxKg: p.higeMaxWeightKg,
        hogeMaxKg: p.hogeMaxWeightKg,
        actualTowKg: input.takeoffWeightKg,
      };
    });
  }, [input]);

  const powerCurve = React.useMemo(() => calculatePowerCurve(input), [input]);

  // The available-power reference line (~626kW) sits well above the induced+parasite curve
  // (no profile/tail-rotor power modeled) — without an explicit domain, Recharts auto-scales
  // to the curve's own max and the line falls outside the visible chart entirely.
  const powerChartMaxKw = React.useMemo(() => {
    const curveMax = Math.max(...powerCurve.points.map(p => p.totalPowerKw));
    return Math.ceil((Math.max(curveMax, powerCurve.availablePowerKw) * 1.1) / 50) * 50;
  }, [powerCurve]);

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Title & Info Banner */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 font-mono">
            <Gauge className="w-5 h-5 text-cyan-400" /> Performance & Potencia Estacionario HIGE / HOGE (BO105 CBS-4)
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Cálculos OGE (Out of Ground Effect) obligatorios para operaciones en helideck y tramos sobre agua (offshore).
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-slate-900 border border-slate-700 text-cyan-400 px-3 py-1.5 rounded-lg font-mono">
            Motores: 2x Allison 250-C20B
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Environmental Inputs */}
        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider border-b border-slate-800 pb-2">
            Condiciones Ambientales & Helideck
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400 flex items-center gap-1"><Mountain className="w-3.5 h-3.5" /> Altitud de Presión:</span>
                <span className="text-cyan-400 font-bold">{input.pressureAltFt} ft</span>
              </div>
              <input
                type="range"
                min={0}
                max={8000}
                step={100}
                value={input.pressureAltFt}
                onChange={(e) => setInput({ ...input, pressureAltFt: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400 flex items-center gap-1"><Thermometer className="w-3.5 h-3.5" /> Temperatura Exterior (OAT):</span>
                <span className="text-cyan-400 font-bold">{input.tempC} °C</span>
              </div>
              <input
                type="range"
                min={-10}
                max={45}
                value={input.tempC}
                onChange={(e) => setInput({ ...input, tempC: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Presión Altimétrica QNH:</span>
                <span className="text-cyan-400 font-bold">{input.qnhHpa} hPa</span>
              </div>
              <input
                type="range"
                min={980}
                max={1035}
                value={input.qnhHpa}
                onChange={(e) => setInput({ ...input, qnhHpa: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-slate-800">
              <div className="flex justify-between mb-1">
                <span className="text-slate-400 flex items-center gap-1"><Wind className="w-3.5 h-3.5" /> Viento Intensidad:</span>
                <span className="text-cyan-400 font-bold">{input.windSpeedKt} kt</span>
              </div>
              <input
                type="range"
                min={0}
                max={45}
                value={input.windSpeedKt}
                onChange={(e) => setInput({ ...input, windSpeedKt: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400">Dirección Viento (°)</label>
                <input
                  type="number"
                  value={input.windDirDeg}
                  onChange={(e) => setInput({ ...input, windDirDeg: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Rumbo Proa Helideck (°)</label>
                <input
                  type="number"
                  value={input.runwayHeadingDeg}
                  onChange={(e) => setInput({ ...input, runwayHeadingDeg: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs mt-1"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Peso Total Aeronave (TOW):</span>
                <span className="text-emerald-400 font-bold">{input.takeoffWeightKg} kg</span>
              </div>
              <input
                type="range"
                min={1800}
                max={2500}
                step={10}
                value={input.takeoffWeightKg}
                onChange={(e) => setInput({ ...input, takeoffWeightKg: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Middle & Right: Performance Results & Interactive Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
            <div className="glass-card p-4 rounded-xl border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase">Altitud Densidad</p>
              <p className="text-2xl font-bold text-cyan-400">{result.densityAltFt} <span className="text-xs">ft</span></p>
              <p className="text-[10px] text-slate-400 mt-1">Dev ISA: {result.isaDevC > 0 ? `+${result.isaDevC.toFixed(1)}` : result.isaDevC.toFixed(1)} °C</p>
            </div>

            <div className={`glass-card p-4 rounded-xl border ${
              result.canHoge ? 'border-emerald-500/40 bg-emerald-950/20' : 'border-rose-500/40 bg-rose-950/20'
            }`}>
              <p className="text-[10px] text-slate-400 uppercase">Techo Estacionario HOGE</p>
              <p className="text-2xl font-bold text-emerald-400">{result.hogeMaxWeightKg} <span className="text-xs">kg máx</span></p>
              <p className={`text-[10px] mt-1 flex items-center gap-1 ${result.canHoge ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.canHoge ? <CheckCircle2 className="w-3 h-3" /> : <AlertOctagon className="w-3 h-3" />}
                {result.canHoge ? 'Apto Despegue HOGE Helideck' : 'EXCEDE LÍMITE OGE'}
              </p>
            </div>

            <div className="glass-card p-4 rounded-xl border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase">Régimen Ascenso OEI (Monomotor)</p>
              <p className="text-2xl font-bold text-amber-400">+{result.oeiClimbRateFpm} <span className="text-xs">ft/min</span></p>
              <p className="text-[10px] text-slate-400 mt-1">Potencia Monomotor 420 SHP</p>
            </div>
          </div>

          {/* Interactive Recharts Performance Chart */}
          <div className="glass-card p-5 rounded-xl border border-slate-800 font-mono space-y-3">
            <h4 className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" /> Gráfico Comparativo HIGE vs HOGE vs Peso Actual ({input.takeoffWeightKg} kg)
            </h4>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceCurveData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="altitude" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis domain={[1500, 2600]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: '#cbd5e1' }} />
                  <ReferenceLine y={input.takeoffWeightKg} stroke="#ef4444" strokeDasharray="3 3" label={{ value: `TOW: ${input.takeoffWeightKg}kg`, fill: '#ef4444', fontSize: 10 }} />
                  <Bar dataKey="higeMaxKg" name="Límite HIGE (kg)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="hogeMaxKg" name="Límite HOGE (kg)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Power-Required Curve (Induced + Parasite Drag) */}
          <div className="glass-card p-5 rounded-xl border border-slate-800 font-mono space-y-3">
            <h4 className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
              <LineChartIcon className="w-4 h-4 text-cyan-400" /> Curva de Potencia Requerida (Resistencia Parásita e Inducida)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="glass-card p-3 rounded-lg border border-cyan-500/30 bg-cyan-950/10">
                <p className="text-[10px] text-slate-400 uppercase">Velocidad de Mínima Resistencia (Mín. Potencia)</p>
                <p className="text-xl font-bold text-cyan-400">{powerCurve.minPowerSpeedKt} <span className="text-xs">kt</span></p>
                <p className="text-[10px] text-slate-400 mt-1">{powerCurve.minPowerKw.toFixed(1)} kW requeridos — máxima autonomía</p>
              </div>
              <div className="glass-card p-3 rounded-lg border border-emerald-500/30 bg-emerald-950/10">
                <p className="text-[10px] text-slate-400 uppercase">Velocidad de Máximo Alcance</p>
                <p className="text-xl font-bold text-emerald-400">{powerCurve.bestRangeSpeedKt} <span className="text-xs">kt</span></p>
                <p className="text-[10px] text-slate-400 mt-1">{powerCurve.bestRangePowerKw.toFixed(1)} kW requeridos — tangente desde el origen</p>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={powerCurve.points} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="speedKt"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    label={{ value: 'Velocidad (kt)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }}
                  />
                  <YAxis
                    domain={[0, powerChartMaxKw]}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    label={{ value: 'Potencia Requerida (kW)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: '#cbd5e1' }} />
                  <ReferenceLine
                    y={powerCurve.availablePowerKw}
                    stroke="#f59e0b"
                    strokeDasharray="5 5"
                    label={{ value: `Pot. Disponible: ${powerCurve.availablePowerKw.toFixed(0)} kW`, fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }}
                  />
                  {/* Stacked at different heights (dy) rather than both at the chart top — on
                      a narrow screen, or whenever the two speeds land close together, same-row
                      labels overlap into unreadable text. */}
                  <ReferenceLine x={powerCurve.minPowerSpeedKt} stroke="#22d3ee" strokeDasharray="3 3" label={{ value: 'Mín. Resist.', fill: '#22d3ee', fontSize: 9, position: 'top', dy: 0 }} />
                  <ReferenceLine x={powerCurve.bestRangeSpeedKt} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Máx. Alcance', fill: '#10b981', fontSize: 9, position: 'top', dy: 12 }} />
                  <Line type="monotone" dataKey="inducedPowerKw" name="Potencia Inducida (kW)" stroke="#a78bfa" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="parasitePowerKw" name="Potencia Parásita (kW)" stroke="#f472b6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="totalPowerKw" name="Potencia Total Requerida (kW)" stroke="#06b6d4" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-500 border-t border-slate-800 pt-2">
              Modelo simplificado (potencia inducida + parásita únicamente; no incluye potencia de perfil, cola ni accesorios) — usa la Altitud de Presión, Temperatura y Peso configurados arriba. Aproximación de entrenamiento, no verificada contra el RFM.
            </p>
          </div>

          {/* Interactive Performance Table */}
          <div className="glass-card p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Tabla de Rendimiento Estacionario por Altitud
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                    <th className="py-2 px-2">Altitud Presión</th>
                    <th className="py-2 px-2">Límite HIGE (kg)</th>
                    <th className="py-2 px-2">Límite HOGE (kg)</th>
                    <th className="py-2 px-2">Margen HOGE</th>
                    <th className="py-2 px-2">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-[11px]">
                  {performanceCurveData.map((row, idx) => {
                    const margin = row.hogeMaxKg - input.takeoffWeightKg;
                    const isOk = margin >= 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="py-2 px-2 text-cyan-400 font-bold">{row.altitude}</td>
                        <td className="py-2 px-2 text-slate-200">{row.higeMaxKg} kg</td>
                        <td className="py-2 px-2 text-emerald-400 font-bold">{row.hogeMaxKg} kg</td>
                        <td className={`py-2 px-2 font-bold ${isOk ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {margin >= 0 ? `+${margin} kg` : `${margin} kg`}
                        </td>
                        <td className="py-2 px-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isOk ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {isOk ? 'APTO HOGE' : 'RESTRINGIDO'}
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
      </div>
    </div>
  );
};
