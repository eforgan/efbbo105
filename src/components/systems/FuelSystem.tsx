'use client';
import { useState } from 'react';

export default function FuelSystem() {
  const [pump1, setPump1] = useState(true);
  const [pump2, setPump2] = useState(true);
  const [transferL, setTransferL] = useState(true);
  const [transferR, setTransferR] = useState(true);
  const [crossfeed, setCrossfeed] = useState(false);

  return (
    <div className="bg-slate-900 rounded-xl p-8 max-w-4xl mx-auto shadow-2xl border border-slate-700">
      <h3 className="text-2xl font-bold text-white mb-6 text-center">Sistema de Combustible Interactivo</h3>
      <p className="text-slate-400 mb-8 text-center text-sm">
        Haz clic en las bombas y válvulas para simular fallas y ver el cambio en el flujo.
      </p>

      <div className="relative w-full aspect-[4/3] bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
        <svg viewBox="0 0 800 600" className="w-full h-full">
          <defs>
            <linearGradient id="fuelGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.8" />
            </linearGradient>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#0ea5e9" />
            </marker>
          </defs>

          {/* Main Tank */}
          <rect x="250" y="400" width="300" height="150" rx="10" fill="url(#fuelGradient)" stroke="#0284c7" strokeWidth="2" />
          <text x="400" y="475" fill="white" textAnchor="middle" fontSize="20" fontWeight="bold">TANQUE PRINCIPAL</text>

          {/* Supply Tanks */}
          <rect x="150" y="250" width="150" height="100" rx="5" fill="url(#fuelGradient)" stroke="#0284c7" strokeWidth="2" />
          <text x="225" y="305" fill="white" textAnchor="middle" fontSize="16" fontWeight="bold">SUMINISTRO 1</text>

          <rect x="500" y="250" width="150" height="100" rx="5" fill="url(#fuelGradient)" stroke="#0284c7" strokeWidth="2" />
          <text x="575" y="305" fill="white" textAnchor="middle" fontSize="16" fontWeight="bold">SUMINISTRO 2</text>

          {/* Engines */}
          <rect x="150" y="50" width="150" height="80" rx="5" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
          <text x="225" y="95" fill="white" textAnchor="middle" fontSize="18" fontWeight="bold">MOTOR 1</text>
          {pump1 ? (
             <circle cx="225" cy="50" r="10" fill="#22c55e" />
          ) : crossfeed && pump2 ? (
             <circle cx="225" cy="50" r="10" fill="#eab308" />
          ) : (
             <circle cx="225" cy="50" r="10" fill="#ef4444" />
          )}

          <rect x="500" y="50" width="150" height="80" rx="5" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
          <text x="575" y="95" fill="white" textAnchor="middle" fontSize="18" fontWeight="bold">MOTOR 2</text>
          {pump2 ? (
             <circle cx="575" cy="50" r="10" fill="#22c55e" />
          ) : crossfeed && pump1 ? (
             <circle cx="575" cy="50" r="10" fill="#eab308" />
          ) : (
             <circle cx="575" cy="50" r="10" fill="#ef4444" />
          )}

          {/* Lines */}
          {/* Transfer L */}
          <path d="M 300 400 L 300 350 L 225 350" stroke={transferL ? "#0ea5e9" : "#475569"} strokeWidth="4" fill="none" markerEnd={transferL ? "url(#arrow)" : ""} />
          {/* Transfer R */}
          <path d="M 500 400 L 500 350 L 575 350" stroke={transferR ? "#0ea5e9" : "#475569"} strokeWidth="4" fill="none" markerEnd={transferR ? "url(#arrow)" : ""} />
          
          {/* Main Feed 1 */}
          <path d="M 225 250 L 225 130" stroke={pump1 ? "#0ea5e9" : "#475569"} strokeWidth="6" fill="none" markerEnd={pump1 ? "url(#arrow)" : ""} />
          
          {/* Main Feed 2 */}
          <path d="M 575 250 L 575 130" stroke={pump2 ? "#0ea5e9" : "#475569"} strokeWidth="6" fill="none" markerEnd={pump2 ? "url(#arrow)" : ""} />

          {/* Crossfeed Line */}
          <path d="M 225 180 L 575 180" stroke={crossfeed ? "#0ea5e9" : "#475569"} strokeWidth="6" fill="none" strokeDasharray="10,10" />

          {/* Interactive Components */}

          {/* Transfer Pump L */}
          <g transform="translate(260, 365)" onClick={() => setTransferL(!transferL)} className="cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500" role="button" aria-label={`Alternar Bomba de Transferencia 1. Estado actual: ${transferL ? 'Encendida' : 'Apagada'}`} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTransferL(!transferL); } }}>
            <circle cx="0" cy="0" r="20" fill={transferL ? "#22c55e" : "#ef4444"} stroke="#fff" strokeWidth="2" />
            <text x="0" y="5" fill="white" textAnchor="middle" fontSize="12" fontWeight="bold">T1</text>
          </g>

          {/* Transfer Pump R */}
          <g transform="translate(540, 365)" onClick={() => setTransferR(!transferR)} className="cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500" role="button" aria-label={`Alternar Bomba de Transferencia 2. Estado actual: ${transferR ? 'Encendida' : 'Apagada'}`} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTransferR(!transferR); } }}>
            <circle cx="0" cy="0" r="20" fill={transferR ? "#22c55e" : "#ef4444"} stroke="#fff" strokeWidth="2" />
            <text x="0" y="5" fill="white" textAnchor="middle" fontSize="12" fontWeight="bold">T2</text>
          </g>

          {/* Booster Pump 1 */}
          <g transform="translate(225, 210)" onClick={() => setPump1(!pump1)} className="cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500" role="button" aria-label={`Alternar Bomba Reforzadora 1. Estado actual: ${pump1 ? 'Encendida' : 'Apagada'}`} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPump1(!pump1); } }}>
            <rect x="-20" y="-15" width="40" height="30" fill={pump1 ? "#22c55e" : "#ef4444"} stroke="#fff" strokeWidth="2" rx="4" />
            <text x="0" y="4" fill="white" textAnchor="middle" fontSize="12" fontWeight="bold">BP1</text>
          </g>

          {/* Booster Pump 2 */}
          <g transform="translate(575, 210)" onClick={() => setPump2(!pump2)} className="cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500" role="button" aria-label={`Alternar Bomba Reforzadora 2. Estado actual: ${pump2 ? 'Encendida' : 'Apagada'}`} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPump2(!pump2); } }}>
            <rect x="-20" y="-15" width="40" height="30" fill={pump2 ? "#22c55e" : "#ef4444"} stroke="#fff" strokeWidth="2" rx="4" />
            <text x="0" y="4" fill="white" textAnchor="middle" fontSize="12" fontWeight="bold">BP2</text>
          </g>

          {/* Crossfeed Valve */}
          <g transform="translate(400, 180)" onClick={() => setCrossfeed(!crossfeed)} className="cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500" role="button" aria-label={`Alternar Válvula de Alimentación Cruzada. Estado actual: ${crossfeed ? 'Abierta' : 'Cerrada'}`} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCrossfeed(!crossfeed); } }}>
            <circle cx="0" cy="0" r="25" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
            <rect x="-15" y="-5" width="30" height="10" fill={crossfeed ? "#22c55e" : "#ef4444"} transform={crossfeed ? "rotate(0)" : "rotate(90)"} style={{transition: 'transform 0.3s'}} />
            <text x="0" y="35" fill="white" textAnchor="middle" fontSize="10">X-FEED</text>
          </g>

        </svg>
      </div>
    </div>
  );
}
