'use client';

import React from 'react';
import { OxygenCalculation } from '../../types/efb';
import { calculateOxygen } from '../../lib/calculations';
import { HeartPulse, Activity, CheckCircle2, AlertTriangle, Timer, BarChart3, Table } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export const HemsMedicalModule: React.FC = () => {
  const [cylinderVolumeL, setCylinderVolumeL] = React.useState<number>(10); // 10 Liter cylinder
  const [pressureBar, setPressureBar] = React.useState<number>(180); // 180 Bar
  const [flowRateLpm, setFlowRateLpm] = React.useState<number>(12); // 12 L/min flow rate

  const [news2Score, setNews2Score] = React.useState<number>(3); // Low-Moderate risk
  const [isStretcherLocked, setIsStretcherLocked] = React.useState<boolean>(true);
  const [isLoxActive, setIsLoxActive] = React.useState<boolean>(true);
  const [isMedicalPower28vOk, setIsMedicalPower28vOk] = React.useState<boolean>(true);

  const o2Calc: OxygenCalculation = React.useMemo(() => {
    return calculateOxygen(cylinderVolumeL, pressureBar, flowRateLpm);
  }, [cylinderVolumeL, pressureBar, flowRateLpm]);

  // Generate Oxygen duration curve across flow rates (2 to 20 L/min)
  const o2CurveData = React.useMemo(() => {
    const flows = [2, 4, 6, 8, 10, 12, 15, 20];
    return flows.map(f => {
      const calc = calculateOxygen(cylinderVolumeL, pressureBar, f);
      return {
        flowLpm: `${f} L/min`,
        usableMin: calc.usableDurationMinutes,
        totalMin: calc.durationMinutes,
      };
    });
  }, [cylinderVolumeL, pressureBar]);

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Title & Info Banner */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 font-mono">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-400 animate-pulse" /> Soporte Médico & Autonomía de Oxígeno HEMS
          </h2>
          <p className="text-xs text-slate-400">
            MBB BO105 CBS-4 Cabina HEMS Stretched (+10 in) • Anclaje Longitudinal de Camilla
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-rose-950/40 text-rose-300 border border-rose-500/40 px-3 py-1.5 rounded-lg font-bold">
            Equipamiento Médico HEMS Activo
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
        {/* Left Column: Oxygen Endurance Calculator */}
        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
            <Timer className="w-4 h-4 text-cyan-400" /> Calculadora de Autonomía de Oxígeno Médico (LOX / Gas)
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Volumen del Cilindro (Litros):</span>
                <span className="text-cyan-400 font-bold">{cylinderVolumeL} L</span>
              </div>
              <input
                type="range"
                min={2}
                max={20}
                value={cylinderVolumeL}
                onChange={(e) => setCylinderVolumeL(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Presión Manométrica (Bar):</span>
                <span className="text-cyan-400 font-bold">{pressureBar} bar ({Math.round(pressureBar * 14.5038)} PSI)</span>
              </div>
              <input
                type="range"
                min={30}
                max={220}
                step={5}
                value={pressureBar}
                onChange={(e) => setPressureBar(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Flujo Requerido Paciente (L/min):</span>
                <span className="text-rose-400 font-bold">{flowRateLpm} L/min</span>
              </div>
              <input
                type="range"
                min={1}
                max={25}
                value={flowRateLpm}
                onChange={(e) => setFlowRateLpm(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded accent-rose-400 cursor-pointer"
              />
            </div>

            {/* Results */}
            <div className="pt-3 grid grid-cols-2 gap-3">
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400">Autonomía Bruta O2</span>
                <p className="text-xl font-bold text-slate-100">{o2Calc.durationMinutes} <span className="text-xs">min</span></p>
                <p className="text-[10px] text-slate-500">{(o2Calc.cylinderVolumeL * o2Calc.pressureBar)} L Totales</p>
              </div>

              <div className="bg-cyan-950/30 p-3 rounded-lg border border-cyan-500/30">
                <span className="text-[10px] text-slate-400">Autonomía Útil (Reserva 20%)</span>
                <p className="text-xl font-bold text-cyan-400">{o2Calc.usableDurationMinutes} <span className="text-xs">min</span></p>
                <p className="text-[10px] text-emerald-400">Suficiente para tramo HEMS</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Patient & Cabin Safety Checklist */}
        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" /> Estado Clínico & Seguridad Cabina HEMS
          </h3>

          <div className="space-y-4 text-xs">
            {/* NEWS2 Score slider */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Puntaje Clínico NEWS2 (Riesgo Paciente):</span>
                <span className={`font-bold ${news2Score > 4 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {news2Score} pts ({news2Score <= 4 ? 'Riesgo Bajo-Moderado' : 'PACIENTE CRÍTICO / ALTO RIESGO'})
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={12}
                value={news2Score}
                onChange={(e) => setNews2Score(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded accent-emerald-400 cursor-pointer"
              />
            </div>

            {/* Checklist toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800 cursor-pointer">
                <span className="text-slate-300">Anclaje Camilla de 4 Puntos Bloqueado</span>
                <input
                  type="checkbox"
                  checked={isStretcherLocked}
                  onChange={(e) => setIsStretcherLocked(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800 cursor-pointer">
                <span className="text-slate-300">Cilindro LOX / O2 Asegurado y Válvula Abierta</span>
                <input
                  type="checkbox"
                  checked={isLoxActive}
                  onChange={(e) => setIsLoxActive(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800 cursor-pointer">
                <span className="text-slate-300">Alimentación Eléctrica Médica 28V DC / Inversor 220V OK</span>
                <input
                  type="checkbox"
                  checked={isMedicalPower28vOk}
                  onChange={(e) => setIsMedicalPower28vOk(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 rounded"
                />
              </label>
            </div>

            {/* Verification Status */}
            <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
              isStretcherLocked && isLoxActive && isMedicalPower28vOk
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
            }`}>
              {isStretcherLocked && isLoxActive && isMedicalPower28vOk ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Cabina Médica HEMS Verificada y Lista para Vuelo / Embarque Hot Loading.</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span>PRECAUCIÓN: Verifique anclajes de camilla y oxígeno antes de solicitar Green Deck.</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Oxygen Duration Chart & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" /> Curva de Autonomía de Oxígeno vs Flujo Requerido
          </h3>
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={o2CurveData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="flowLpm" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="usableMin" name="Autonomía Útil (min)" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="totalMin" name="Autonomía Total (min)" stroke="#94a3b8" strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
          <h3 className="font-bold text-slate-200 uppercase tracking-wider text-xs flex items-center gap-2">
            <Table className="w-4 h-4 text-cyan-400" /> Tabla de Tiempos de Oxígeno según Flujo Clínico
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                  <th className="py-2 px-2">Flujo (L/min)</th>
                  <th className="py-2 px-2">Autonomía Bruta</th>
                  <th className="py-2 px-2">Autonomía Útil (-20%)</th>
                  <th className="py-2 px-2">Indicación Clínica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-[11px]">
                {o2CurveData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="py-2 px-2 font-bold text-cyan-400">{row.flowLpm}</td>
                    <td className="py-2 px-2 text-slate-200">{row.totalMin} min</td>
                    <td className="py-2 px-2 font-bold text-emerald-400">{row.usableMin} min</td>
                    <td className="py-2 px-2 text-slate-400 text-[10px]">
                      {parseInt(row.flowLpm) <= 4 ? 'Cánula Nasal' : parseInt(row.flowLpm) <= 10 ? 'Máscara Reservorio' : 'Ventilador Mecánico'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
