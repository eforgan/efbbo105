'use client';

import React from 'react';
import { RiskFactor } from '../../types/efb';
import { OACI_RISK_FACTORS } from '../../lib/bo105-specs';
import { ShieldAlert, Activity, CheckCircle2, AlertOctagon, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export const RiskAssessmentModule: React.FC = () => {
  const [factors, setFactors] = React.useState<RiskFactor[]>(OACI_RISK_FACTORS);

  // OACI 5x5 Risk Index calculation: Score = Severity * Probability
  const getRiskLevel = (sev: number, prob: number) => {
    const score = sev * prob;
    if (score >= 15) return { label: 'INTOLERABLE', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', bg: 'bg-rose-600' };
    if (score >= 7) return { label: 'TOLERABLE', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', bg: 'bg-amber-500' };
    return { label: 'ACEPTABLE', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', bg: 'bg-emerald-500' };
  };

  const updateProbability = (id: string, prob: number) => {
    setFactors(prev => prev.map(f => f.id === id ? { ...f, probability: prob as RiskFactor['probability'] } : f));
  };

  const hasIntolerableRisk = factors.some(f => (f.severity * f.probability) >= 15);

  // Risk Distribution Chart Data
  const riskChartData = React.useMemo(() => {
    let low = 0;
    let med = 0;
    let high = 0;

    factors.forEach(f => {
      const score = f.severity * f.probability;
      if (score >= 15) high++;
      else if (score >= 7) med++;
      else low++;
    });

    return [
      { category: 'Aceptable (Bajo)', count: low, fill: '#10b981' },
      { category: 'Tolerable (Medio)', count: med, fill: '#f59e0b' },
      { category: 'Intolerable (Alto)', count: high, fill: '#ef4444' },
    ];
  }, [factors]);

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Banner */}
      <div className={`p-4 rounded-xl border font-mono flex items-center justify-between ${
        hasIntolerableRisk ? 'bg-rose-950/40 border-rose-500/40 text-rose-300' : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
      }`}>
        <div className="flex items-center space-x-3">
          {hasIntolerableRisk ? <AlertOctagon className="w-8 h-8 text-rose-400 animate-bounce" /> : <CheckCircle2 className="w-8 h-8 text-emerald-400" />}
          <div>
            <h2 className="text-base font-bold">EVALUACIÓN SMS & MATRIZ DE RIESGO OACI (DOC 9859)</h2>
            <p className="text-xs opacity-90">
              {hasIntolerableRisk
                ? 'RIESGO INTOLERABLE DETECTADO • APLIQUE BARRERAS MITIGADORAS ANTES DEL DESPACHO'
                : 'MATRIZ SMS EN NIVEL ACEPTO / TOLERABLE • OPERACIÓN HEMS AUTORIZADA'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
        {/* Left Column: Interactive Risk Factors */}
        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400" /> Evaluación Dinámica de Amenazas Operativas
          </h3>

          <div className="space-y-3">
            {factors.map((f) => {
              const level = getRiskLevel(f.severity, f.probability);
              return (
                <div key={f.id} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-slate-200">{f.name}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${level.color}`}>
                      {level.label} ({f.severity}x{f.probability})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                    <div>
                      <span>Severidad OACI: </span>
                      <span className="text-slate-200 font-bold">{f.severity} / 5</span>
                    </div>
                    <div>
                      <span>Probabilidad: </span>
                      <select
                        value={f.probability}
                        onChange={(e) => updateProbability(f.id, Number(e.target.value))}
                        className="bg-slate-800 text-cyan-300 rounded px-1 py-0.5 border border-slate-700 outline-none cursor-pointer"
                      >
                        <option value={1}>1 - Improbable</option>
                        <option value={2}>2 - Remoto</option>
                        <option value={3}>3 - Ocasional</option>
                        <option value={4}>4 - Frecuente</option>
                        <option value={5}>5 - Constante</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-2 rounded text-[10px] text-cyan-300 border border-slate-800/80">
                    <span className="font-bold text-slate-400">Barrera Mitigadora: </span>
                    {f.mitigation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Swiss Cheese Model + OACI 5x5 Matrix Heatmap */}
        <div className="space-y-6">
          {/* Recharts Distribution Chart */}
          <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" /> Distribución Actual de Niveles de Riesgo
            </h3>
            <div className="h-48 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                  <Bar dataKey="count" name="Número de Amenazas" radius={[4, 4, 0, 0]} fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Swiss Cheese Defenses */}
          <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Defensas en Capa (Modelo Queso Suizo de Reason)
            </h3>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px]">1</span>
                  <span>Capa 1: Mantenimiento Preventivo Bimotor</span>
                </div>
                <p className="text-[10px] text-slate-400">Inspección rigurosa RAAC 135 de Allison 250-C20B y cubo de titanio rígido.</p>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px]">2</span>
                  <span>Capa 2: Límite Geográfico (&lt; 8 km / &lt; 5 min overwater)</span>
                </div>
                <p className="text-[10px] text-slate-400">Minimiza drásticamente la exposición sobre el agua.</p>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">3</span>
                  <span>Capa 3: Reglas VFR Diurna &amp; Posado Helideck</span>
                </div>
                <p className="text-[10px] text-slate-400">Prohibición de izaje/winche y VFR estricto para evitar IIMC.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
