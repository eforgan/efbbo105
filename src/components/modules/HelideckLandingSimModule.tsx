'use client';

import React from 'react';
import { Compass, Wind, CheckCircle2, ShieldAlert } from 'lucide-react';

type HelipadId = 'seminole' | 'sanatorio-parque' | 'anelo' | 'santojanni';

const HELIPAD_LABELS: Record<HelipadId, string> = {
  seminole: 'DLV Seminole (Buque Helideck YPF)',
  'sanatorio-parque': 'Sanatorio Parque (UTV Rosario)',
  anelo: 'Añelo (Vaca Muerta Vista)',
  santojanni: 'Hospital Santojanni (SAME Buenos Aires)',
};

export const HelideckLandingSimModule: React.FC = () => {
  const [helipadType, setHelipadType] = React.useState<HelipadId>('seminole');
  const [windDirDeg, setWindDirDeg] = React.useState<number>(310);
  const [windSpeedKt, setWindSpeedKt] = React.useState<number>(18);
  const [approachHeadingDeg, setApproachHeadingDeg] = React.useState<number>(320);

  // Compute relative wind angle (-180 to +180)
  let relWindAngle = windDirDeg - approachHeadingDeg;
  while (relWindAngle > 180) relWindAngle -= 360;
  while (relWindAngle < -180) relWindAngle += 360;

  const headwindKt = Math.round(windSpeedKt * Math.cos((relWindAngle * Math.PI) / 180));
  const crosswindKt = Math.round(Math.abs(windSpeedKt * Math.sin((relWindAngle * Math.PI) / 180)));

  // Relative Wind Category
  const isCrosswindLimit = crosswindKt > 20;
  const isTailwindDangerous = Math.abs(relWindAngle) > 135;

  let windStatusText = 'Aproximación con viento relativo de proa óptimo.';
  let windStatusColor = 'emerald';
  if (isTailwindDangerous) {
    windStatusText = 'ALERTA: Viento de cola (Tailwind). Riesgo de anular efecto suelo e inestabilidad de rotor.';
    windStatusColor = 'rose';
  } else if (isCrosswindLimit) {
    windStatusText = 'PRECAUCIÓN: Viento cruzado elevado. Ajuste pedal izquierdo/derecho y torque dual.';
    windStatusColor = 'amber';
  }

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 font-mono">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" /> Simulador de Viento & Patrón de Aproximación a Helipuerto
          </h2>
          <p className="text-xs text-slate-400">
            MBB BO105 CBS-4 • Cálculo Gráfico de Vector de Viento Relativo & Cono de Turbulencia por Helideck
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={helipadType}
            onChange={(e) => setHelipadType(e.target.value as HelipadId)}
            className="bg-slate-900 text-xs font-mono text-cyan-300 rounded px-3 py-1.5 border border-slate-700 outline-none cursor-pointer"
          >
            <option value="seminole">DLV Seminole (Buque Helideck YPF)</option>
            <option value="sanatorio-parque">Sanatorio Parque (UTV Rosario)</option>
            <option value="anelo">Añelo (Vaca Muerta Vista)</option>
            <option value="santojanni">Hospital Santojanni (SAME Buenos Aires)</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Controls + Interactive Graphic */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono">
        {/* Controls Column (5 Cols) */}
        <div className="lg:col-span-5 glass-card p-4 rounded-xl border border-slate-800 space-y-4 text-xs">
          <h3 className="text-xs font-bold text-slate-100 uppercase border-b border-slate-800 pb-2 flex items-center gap-2">
            <Wind className="w-4 h-4 text-cyan-400" /> Parámetros de Viento & Proa
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Dirección del Viento Meteorológico (°):</span>
                <span className="text-cyan-400 font-bold">{windDirDeg}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={5}
                value={windDirDeg}
                onChange={(e) => setWindDirDeg(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Intensidad del Viento (kt):</span>
                <span className="text-amber-400 font-bold">{windSpeedKt} kt</span>
              </div>
              <input
                type="range"
                min={0}
                max={45}
                value={windSpeedKt}
                onChange={(e) => setWindSpeedKt(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded accent-amber-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Rumbo Aproximación / Proa (°):</span>
                <span className="text-emerald-400 font-bold">{approachHeadingDeg}° M</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={5}
                value={approachHeadingDeg}
                onChange={(e) => setApproachHeadingDeg(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400">Componente Frente / Cola</span>
              <p className={`text-base font-bold ${headwindKt >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {headwindKt >= 0 ? `+${headwindKt} kt (Frente)` : `${headwindKt} kt (Cola)`}
              </p>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400">Viento Cruzado (Crosswind)</span>
              <p className={`text-base font-bold ${crosswindKt <= 20 ? 'text-cyan-400' : 'text-rose-400'}`}>
                {crosswindKt} kt
              </p>
            </div>
          </div>

          <div className={`p-3 rounded-lg border flex items-center gap-2 ${
            windStatusColor === 'emerald' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' :
            windStatusColor === 'amber' ? 'bg-amber-950/40 border-amber-500/40 text-amber-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}>
            {windStatusColor === 'emerald' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />}
            <span>{windStatusText}</span>
          </div>
        </div>

        {/* Graphical Landing Vector Diagram (7 Cols) */}
        <div className="lg:col-span-7 glass-card p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Diagrama Vectorial Viento Relativo & Proa Helicóptero
            </h3>
            <span className="inline-block text-[10px] font-bold text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded">
              Helipuerto Activo: {HELIPAD_LABELS[helipadType]}
            </span>
          </div>

          <div className="relative w-72 h-72 rounded-full border-2 border-slate-700 bg-slate-950 flex items-center justify-center shadow-inner">
            {/* North Indicator */}
            <span className="absolute top-2 text-[10px] font-bold text-cyan-400">N (000°)</span>
            <span className="absolute bottom-2 text-[10px] font-bold text-slate-500">S (180°)</span>
            <span className="absolute left-2 text-[10px] font-bold text-slate-500">W (270°)</span>
            <span className="absolute right-2 text-[10px] font-bold text-slate-500">E (090°)</span>

            {/* Compass Rings */}
            <div className="w-48 h-48 rounded-full border border-slate-800/80 border-dashed"></div>

            {/* Helicopter Heading Arrow */}
            <div
              className="absolute w-1 h-32 bg-emerald-500/40 origin-bottom rounded transition-all duration-300"
              style={{ transform: `rotate(${approachHeadingDeg}deg) translateY(-16px)` }}
            >
              <div className="w-3 h-3 bg-emerald-400 rotate-45 transform -translate-x-1 -translate-y-1"></div>
            </div>

            {/* Wind Vector Arrow */}
            <div
              className="absolute w-1 h-28 bg-amber-500/60 origin-bottom rounded transition-all duration-300"
              style={{ transform: `rotate(${windDirDeg}deg) translateY(-14px)` }}
            >
              <div className="w-4 h-4 text-amber-400 font-bold -mt-2 -ml-1">↓</div>
            </div>

            {/* Center Helipad Circle */}
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center z-10 font-bold text-cyan-300 text-sm shadow-lg shadow-cyan-500/20">
              H
            </div>
          </div>

          <div className="flex items-center space-x-6 text-[10px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-3 h-3 bg-emerald-500 inline-block rounded-full"></span> Proa Helicóptero ({approachHeadingDeg}°)
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-3 h-3 bg-amber-500 inline-block rounded-full"></span> Viento Met ({windDirDeg}° / {windSpeedKt}kt)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
