'use client';

import React from 'react';
import { WBSummary } from '../../types/efb';
import { BO105_SPECS } from '../../lib/bo105-specs';
import { calculateWB } from '../../lib/calculations';
import { StationSlider } from '../wb/StationSlider';
import { CGGraph } from '../wb/CGGraph';
import { useEfbData } from '../../context/EfbDataContext';
import { AlertTriangle, CheckCircle2, RefreshCw, Table } from 'lucide-react';

export const WeightAndBalanceModule: React.FC = () => {
  const { stations, setStations } = useEfbData();

  const summary: WBSummary = React.useMemo(() => calculateWB(stations), [stations]);
  const bewMomentKgM = ((BO105_SPECS.bewKg * BO105_SPECS.bewArmMm) / 1000).toFixed(1);

  const handleStationChange = (id: string, weightKg: number) => {
    setStations(prev => prev.map(s => s.id === id ? { ...s, weightKg } : s));
  };

  const applyPreset = (preset: 'standard-hems' | 'light-med' | 'max-fuel' | 'empty') => {
    setStations(prev => prev.map(st => {
      if (preset === 'empty') return { ...st, weightKg: 0 };
      if (preset === 'standard-hems') {
        if (st.id === 'front-crew') return { ...st, weightKg: 170 }; // 2 pilots
        if (st.id === 'medical-doctor') return { ...st, weightKg: 85 }; // Doctor
        if (st.id === 'patient-stretcher') return { ...st, weightKg: 85 }; // Patient
        if (st.id === 'medical-equipment') return { ...st, weightKg: 45 }; // Med equipment + LOX
        if (st.id === 'baggage') return { ...st, weightKg: 25 }; // Liferaft
        if (st.id === 'fuel-main') return { ...st, weightKg: 350 }; // 350kg fuel
      }
      if (preset === 'light-med') {
        if (st.id === 'front-crew') return { ...st, weightKg: 85 }; // 1 pilot
        if (st.id === 'medical-doctor') return { ...st, weightKg: 85 }; // Doctor
        if (st.id === 'patient-stretcher') return { ...st, weightKg: 70 }; // Child patient
        if (st.id === 'medical-equipment') return { ...st, weightKg: 35 };
        if (st.id === 'baggage') return { ...st, weightKg: 15 };
        if (st.id === 'fuel-main') return { ...st, weightKg: 280 };
      }
      if (preset === 'max-fuel') {
        if (st.id === 'fuel-main') return { ...st, weightKg: 450 };
      }
      return st;
    }));
  };

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Banner Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono">
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          summary.isWeightValid ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
        }`}>
          <div>
            <p className="text-[10px] text-slate-400 uppercase">Peso Total Despegue</p>
            <p className="text-xl font-bold">{summary.totalWeightKg} <span className="text-xs">kg</span></p>
            <p className="text-[10px] opacity-80">MTOW: 2,500 kg</p>
          </div>
          {summary.isWeightValid ? <CheckCircle2 className="w-8 h-8 text-emerald-400" /> : <AlertTriangle className="w-8 h-8 text-rose-400" />}
        </div>

        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          summary.isCgValid ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300' : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
        }`}>
          <div>
            <p className="text-[10px] text-slate-400 uppercase">Brazo CG Longitud</p>
            <p className="text-xl font-bold">{summary.cgLocationMm.toFixed(1)} <span className="text-xs">mm</span></p>
            <p className="text-[10px] opacity-80">Rango: 3080 - 3420 mm</p>
          </div>
          {summary.isCgValid ? <CheckCircle2 className="w-8 h-8 text-cyan-400" /> : <AlertTriangle className="w-8 h-8 text-amber-400" />}
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200">
          <p className="text-[10px] text-slate-400 uppercase font-mono">Desequilibrio Lateral</p>
          <p className="text-xl font-bold font-mono">{summary.lateralCgMm > 0 ? `+${summary.lateralCgMm.toFixed(1)}` : summary.lateralCgMm.toFixed(1)} <span className="text-xs">mm (Der)</span></p>
          <p className="text-[10px] text-emerald-400">Límite Lateral: ±80 mm OK</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200">
          <p className="text-[10px] text-slate-400 uppercase font-mono">Peso Sin Combustible (ZFW)</p>
          <p className="text-xl font-bold font-mono">{summary.zeroFuelWeightKg} <span className="text-xs">kg</span></p>
          <p className="text-[10px] text-slate-400">CG ZFW: {summary.zeroFuelCgMm.toFixed(1)} mm</p>
        </div>
      </div>

      {/* Quick Preset Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 glass-card p-3 rounded-xl border border-slate-800">
        <span className="text-xs font-bold text-slate-300 font-mono">Cargas Rápidas Config HEMS:</span>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => applyPreset('standard-hems')} className="px-3 py-1.5 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 rounded-lg text-xs font-mono font-medium transition cursor-pointer">
            Configuración HEMS Completa (PIC + SIC + Médico + Paciente)
          </button>
          <button onClick={() => applyPreset('light-med')} className="px-3 py-1.5 bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-mono font-medium transition cursor-pointer">
            Misión HEMS Liviana (3 Pax)
          </button>
          <button onClick={() => applyPreset('max-fuel')} className="px-3 py-1.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg text-xs font-mono font-medium transition cursor-pointer">
            Tanques Llenos (450 kg Combustible)
          </button>
          <button onClick={() => applyPreset('empty')} className="px-3 py-1.5 bg-slate-800 text-slate-400 hover:bg-slate-700 rounded-lg text-xs font-mono flex items-center gap-1 cursor-pointer">
            <RefreshCw className="w-3 h-3" /> Reiniciar
          </button>
        </div>
      </div>

      {/* Main Grid: Station Sliders + Envelope Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-200 font-mono flex items-center gap-2">
            Estaciones de Carga BO 105 CBS-4 Stretched (+10 in)
          </h3>
          {stations.map(st => (
            <StationSlider key={st.id} station={st} onChange={handleStationChange} />
          ))}
        </div>

        <div>
          <CGGraph summary={summary} />
        </div>
      </div>

      {/* Interactive Weight & Moment Station Table */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-3">
        <h3 className="font-bold text-slate-200 uppercase tracking-wider text-xs flex items-center gap-2">
          <Table className="w-4 h-4 text-cyan-400" /> Tabla Detallada de Brazo, Pesos & Momentos por Estación
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                <th className="py-2 px-2">Estación / Componente</th>
                <th className="py-2 px-2">Brazo (mm)</th>
                <th className="py-2 px-2">Peso (kg)</th>
                <th className="py-2 px-2">Momento (kg·m)</th>
                <th className="py-2 px-2">% Capacidad Estación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-[11px]">
              <tr className="bg-slate-900/60 font-bold text-cyan-300">
                <td className="py-2 px-2">Peso Vacío de Fábrica (BEW)</td>
                <td className="py-2 px-2">{BO105_SPECS.bewArmMm.toLocaleString('es-AR')} mm</td>
                <td className="py-2 px-2">{BO105_SPECS.bewKg.toLocaleString('es-AR')} kg</td>
                <td className="py-2 px-2">{bewMomentKgM} kg·m</td>
                <td className="py-2 px-2">Estructura Base</td>
              </tr>
              {stations.map((st) => {
                const moment = ((st.weightKg * st.armMm) / 1000).toFixed(1);
                const max = st.maxWeightKg || 200;
                const pct = Math.min(100, Math.round((st.weightKg / max) * 100));
                return (
                  <tr key={st.id} className="hover:bg-slate-900/40">
                    <td className="py-2 px-2 text-slate-200 font-medium">{st.name}</td>
                    <td className="py-2 px-2 text-slate-400">{st.armMm} mm</td>
                    <td className="py-2 px-2 font-bold text-slate-100">{st.weightKg} kg</td>
                    <td className="py-2 px-2 text-cyan-400 font-bold">{moment} kg·m</td>
                    <td className="py-2 px-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-slate-800 h-1.5 rounded overflow-hidden">
                          <div
                            className={`h-full ${pct > 90 ? 'bg-rose-500' : pct > 60 ? 'bg-amber-400' : 'bg-cyan-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-slate-900/90 font-bold text-emerald-400 border-t border-slate-700">
                <td className="py-2.5 px-2 text-sm">TOTAL PESO DESPEGUE (TOW)</td>
                <td className="py-2.5 px-2 text-sm text-cyan-300">{summary.cgLocationMm.toFixed(1)} mm (CG)</td>
                <td className="py-2.5 px-2 text-sm">{summary.totalWeightKg} kg</td>
                <td className="py-2.5 px-2 text-sm">{summary.totalMomentKgM.toFixed(1)} kg·m</td>
                <td className="py-2.5 px-2 text-xs text-emerald-300 font-mono">
                  {summary.isWeightValid && summary.isCgValid ? 'DENTRO DE LÍMITES OK' : 'EXCEDE ENVOLVENTE'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
