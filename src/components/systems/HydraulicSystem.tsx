'use client';
import { useState } from 'react';

export default function HydraulicSystem() {
  const [sys1, setSys1] = useState(true);
  const [sys2, setSys2] = useState(true);

  return (
    <div className="bg-slate-900 rounded-xl p-8 max-w-4xl mx-auto shadow-2xl border border-slate-700">
      <h3 className="text-2xl font-bold text-white mb-6 text-center">Sistema Hidráulico Interactivo</h3>
      <p className="text-slate-400 mb-8 text-center text-sm">
        Haz clic en las bombas principales para simular una falla en el sistema hidráulico 1 o 2.
      </p>

      <div className="relative w-full aspect-[4/3] bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
        <svg viewBox="0 0 800 600" className="w-full h-full">
          <defs>
            <linearGradient id="hyd1Gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={sys1 ? "#ef4444" : "#475569"} stopOpacity="0.8" />
              <stop offset="100%" stopColor={sys1 ? "#991b1b" : "#1e293b"} stopOpacity="1" />
            </linearGradient>
            <linearGradient id="hyd2Gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={sys2 ? "#ef4444" : "#475569"} stopOpacity="0.8" />
              <stop offset="100%" stopColor={sys2 ? "#991b1b" : "#1e293b"} stopOpacity="1" />
            </linearGradient>
            <marker id="arrow1" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={sys1 ? "#ef4444" : "#475569"} />
            </marker>
            <marker id="arrow2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={sys2 ? "#ef4444" : "#475569"} />
            </marker>
          </defs>

          {/* Main Rotor Actuators */}
          <rect x="250" y="50" width="300" height="120" rx="10" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
          <text x="400" y="85" fill="white" textAnchor="middle" fontSize="18" fontWeight="bold">ACTUADORES ROTOR PRINCIPAL</text>
          
          <rect x="280" y="100" width="100" height="40" fill={sys1 ? "#ef4444" : "#475569"} rx="4" />
          <text x="330" y="125" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">SYS 1</text>
          
          <rect x="420" y="100" width="100" height="40" fill={sys2 ? "#ef4444" : "#475569"} rx="4" />
          <text x="470" y="125" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">SYS 2</text>

          {/* Tail Rotor Actuator */}
          <rect x="600" y="50" width="150" height="120" rx="10" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
          <text x="675" y="85" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">ROTOR COLA</text>
          <rect x="625" y="100" width="100" height="40" fill={sys2 ? "#ef4444" : "#475569"} rx="4" />
          <text x="675" y="125" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">SYS 2</text>

          {/* Lines */}
          {/* SYS 1 to Main Rotor */}
          <path d="M 330 350 L 330 140" stroke={sys1 ? "#ef4444" : "#475569"} strokeWidth="6" fill="none" markerEnd="url(#arrow1)" />
          {/* SYS 2 to Main Rotor */}
          <path d="M 470 350 L 470 140" stroke={sys2 ? "#ef4444" : "#475569"} strokeWidth="6" fill="none" markerEnd="url(#arrow2)" />
          {/* SYS 2 to Tail Rotor */}
          <path d="M 470 300 L 675 300 L 675 140" stroke={sys2 ? "#ef4444" : "#475569"} strokeWidth="6" fill="none" markerEnd="url(#arrow2)" />

          {/* Interactive Pumps */}
          <g transform="translate(330, 400)" onClick={() => setSys1(!sys1)} className="cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500" role="button" aria-label={`Alternar Bomba Hidráulica 1. Estado actual: ${sys1 ? '100 Bar' : '0 Bar'}`} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSys1(!sys1); } }}>
            <circle cx="0" cy="0" r="40" fill="url(#hyd1Gradient)" stroke="#fff" strokeWidth="3" />
            <text x="0" y="-5" fill="white" textAnchor="middle" fontSize="16" fontWeight="bold">BOMBA 1</text>
            <text x="0" y="15" fill="white" textAnchor="middle" fontSize="12">{sys1 ? "100 Bar" : "0 Bar"}</text>
            {sys1 ? (
              <circle cx="0" cy="0" r="45" stroke="#22c55e" strokeWidth="2" fill="none" className="animate-pulse" />
            ) : (
              <line x1="-30" y1="-30" x2="30" y2="30" stroke="#ef4444" strokeWidth="4" />
            )}
          </g>

          <g transform="translate(470, 400)" onClick={() => setSys2(!sys2)} className="cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500" role="button" aria-label={`Alternar Bomba Hidráulica 2. Estado actual: ${sys2 ? '100 Bar' : '0 Bar'}`} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSys2(!sys2); } }}>
            <circle cx="0" cy="0" r="40" fill="url(#hyd2Gradient)" stroke="#fff" strokeWidth="3" />
            <text x="0" y="-5" fill="white" textAnchor="middle" fontSize="16" fontWeight="bold">BOMBA 2</text>
            <text x="0" y="15" fill="white" textAnchor="middle" fontSize="12">{sys2 ? "100 Bar" : "0 Bar"}</text>
            {sys2 ? (
              <circle cx="0" cy="0" r="45" stroke="#22c55e" strokeWidth="2" fill="none" className="animate-pulse" />
            ) : (
              <line x1="-30" y1="-30" x2="30" y2="30" stroke="#ef4444" strokeWidth="4" />
            )}
          </g>

          {/* Transmission Box */}
          <rect x="250" y="480" width="300" height="80" rx="5" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
          <text x="400" y="525" fill="white" textAnchor="middle" fontSize="16" fontWeight="bold">TRANSMISIÓN PRINCIPAL</text>
          
          <path d="M 330 480 L 330 440" stroke="#94a3b8" strokeWidth="4" fill="none" strokeDasharray="5,5" />
          <path d="M 470 480 L 470 440" stroke="#94a3b8" strokeWidth="4" fill="none" strokeDasharray="5,5" />

        </svg>
      </div>
    </div>
  );
}
