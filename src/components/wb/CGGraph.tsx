'use client';

import React from 'react';
import { WBSummary } from '../../types/efb';

interface CGGraphProps {
  summary: WBSummary;
}

export const CGGraph: React.FC<CGGraphProps> = ({ summary }) => {
  // SVG coordinates bounds
  // Arm range: 3000mm to 3500mm
  // Weight range: 1300kg to 2600kg
  const minArm = 3000;
  const maxArm = 3500;
  const minW = 1300;
  const maxW = 2600;

  const width = 450;
  const height = 300;
  const padding = 40;

  const toX = (arm: number) => padding + ((arm - minArm) / (maxArm - minArm)) * (width - padding * 2);
  const toY = (w: number) => height - padding - ((w - minW) / (maxW - minW)) * (height - padding * 2);

  // Envelope boundary per RFM Fig. 6-2 (CBS-4/CDN-BS-4 variants) — see FWD_CG_ENVELOPE_POINTS
  // / AFT_CG_ENVELOPE_POINTS in bo105-specs.ts (the source calculateWB checks against).
  // Forward limit curve: (3081,1140) -> (3038,1900) -> (3082,2500)
  // Aft limit curve: (3270,2500) -> (3395,2000) -> (3395,1140)
  const envPoly = `
    ${toX(3081)},${toY(1140)}
    ${toX(3038)},${toY(1900)}
    ${toX(3082)},${toY(2500)}
    ${toX(3270)},${toY(2500)}
    ${toX(3395)},${toY(2000)}
    ${toX(3395)},${toY(1140)}
  `;

  const takeoffX = toX(summary.cgLocationMm);
  const takeoffY = toY(summary.totalWeightKg);
  const zfwX = toX(summary.zeroFuelCgMm);
  const zfwY = toY(summary.zeroFuelWeightKg);

  return (
    <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-100 font-mono">Diagrama Envolvente CG (BO105 CBS4)</h3>
        <span className="text-[10px] text-slate-400 font-mono">Estación mm vs Peso kg</span>
      </div>

      <div className="relative w-full overflow-hidden flex justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-lg h-auto font-mono text-[10px]">
          {/* Background Grid */}
          <rect x={padding} y={padding} width={width - padding * 2} height={height - padding * 2} fill="#090d16" rx="4" />
          
          {/* Horizontal MTOW Line (2500kg) */}
          <line x1={padding} y1={toY(2500)} x2={width - padding} y2={toY(2500)} stroke="#ef4444" strokeDasharray="3 3" strokeWidth="1.5" />
          <text x={width - padding - 65} y={toY(2500) - 4} fill="#ef4444" fontSize="9">MTOW 2,500 kg</text>

          {/* Envelope Polygon */}
          <polygon points={envPoly} fill="rgba(6, 182, 212, 0.12)" stroke="#06b6d4" strokeWidth="2" />

          {/* Fuel Burn path line */}
          <line x1={takeoffX} y1={takeoffY} x2={zfwX} y2={zfwY} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" />

          {/* Zero Fuel Weight Point */}
          <circle cx={zfwX} cy={zfwY} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
          <text x={zfwX + 8} y={zfwY + 3} fill="#f59e0b" fontSize="9" fontWeight="bold">ZFW ({summary.zeroFuelWeightKg}kg)</text>

          {/* Takeoff Weight Point */}
          <circle cx={takeoffX} cy={takeoffY} r="6" fill={summary.isCgValid && summary.isWeightValid ? '#10b981' : '#ef4444'} stroke="#ffffff" strokeWidth="2" />
          <text x={takeoffX + 8} y={takeoffY - 4} fill={summary.isCgValid && summary.isWeightValid ? '#10b981' : '#ef4444'} fontSize="10" fontWeight="bold">
            TOW ({summary.totalWeightKg}kg)
          </text>

          {/* Axis Labels */}
          <text x={width / 2 - 20} y={height - 8} fill="#94a3b8" fontSize="10">Brazo CG (mm)</text>
          <text x="10" y={height / 2} fill="#94a3b8" fontSize="10" transform={`rotate(-90 10,${height / 2})`}>Peso (kg)</text>
        </svg>
      </div>

      <div className="flex justify-around items-center text-xs font-mono pt-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
          <span className="text-slate-300">Despegue (TOW)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
          <span className="text-slate-300">Sin Combustible (ZFW)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3.5 h-1 bg-amber-500 border-dashed border-amber-400 inline-block"></span>
          <span className="text-slate-300">Trayectoria Consumo</span>
        </div>
      </div>
    </div>
  );
};
