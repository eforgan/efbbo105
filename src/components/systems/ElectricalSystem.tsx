'use client';
import { useState } from 'react';

export default function ElectricalSystem() {
  const [bat, setBat] = useState(true);
  const [gen1, setGen1] = useState(true);
  const [gen2, setGen2] = useState(true);

  const mainBus1 = gen1 || bat;
  const mainBus2 = gen2 || (gen1 && bat); // simplified logic

  return (
    <div className="bg-slate-900 rounded-xl p-8 max-w-4xl mx-auto shadow-2xl border border-slate-700">
      <h3 className="text-2xl font-bold text-white mb-6 text-center">Sistema Eléctrico (DC)</h3>
      <p className="text-slate-400 mb-8 text-center text-sm">
        Haz clic en las baterías y generadores para simular fallas eléctricas.
      </p>

      <div className="relative w-full aspect-[4/3] bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
        <svg viewBox="0 0 800 600" className="w-full h-full">
          
          {/* Main Buses */}
          <rect x="150" y="250" width="200" height="40" fill={mainBus1 ? "#eab308" : "#475569"} rx="5" />
          <text x="250" y="275" fill="black" textAnchor="middle" fontSize="14" fontWeight="bold">MAIN BUS 1</text>

          <rect x="450" y="250" width="200" height="40" fill={mainBus2 ? "#eab308" : "#475569"} rx="5" />
          <text x="550" y="275" fill="black" textAnchor="middle" fontSize="14" fontWeight="bold">MAIN BUS 2</text>

          {/* Tie Bus / Connectors */}
          <path d="M 350 270 L 450 270" stroke={mainBus1 && mainBus2 ? "#eab308" : "#475569"} strokeWidth="6" />
          
          {/* Battery */}
          <g transform="translate(350, 450)" onClick={() => setBat(!bat)} className="cursor-pointer" role="button" aria-label={`Alternar Batería. Estado actual: ${bat ? 'Encendida' : 'Apagada'}`} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setBat(!bat); } }}>
            <rect x="0" y="0" width="100" height="80" fill={bat ? "#22c55e" : "#ef4444"} rx="10" stroke="#fff" strokeWidth="2" />
            <text x="50" y="35" fill="white" textAnchor="middle" fontSize="16" fontWeight="bold">BAT 24V</text>
            <text x="50" y="60" fill="white" textAnchor="middle" fontSize="12">{bat ? "ON" : "OFF"}</text>
          </g>

          {/* Bat Line */}
          <path d="M 400 450 L 400 350 L 250 350 L 250 290" stroke={bat ? "#22c55e" : "#475569"} strokeWidth="6" fill="none" />

          {/* Generator 1 */}
          <g transform="translate(150, 100)" onClick={() => setGen1(!gen1)} className="cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500" role="button" aria-label={`Alternar Generador 1. Estado actual: ${gen1 ? 'Encendido' : 'Fallado'}`} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setGen1(!gen1); } }}>
            <circle cx="50" cy="50" r="40" fill={gen1 ? "#3b82f6" : "#ef4444"} stroke="#fff" strokeWidth="2" />
            <text x="50" y="45" fill="white" textAnchor="middle" fontSize="16" fontWeight="bold">GEN 1</text>
            <text x="50" y="65" fill="white" textAnchor="middle" fontSize="12">{gen1 ? "ON" : "FAIL"}</text>
          </g>

          {/* Gen 1 Line */}
          <path d="M 200 140 L 200 250" stroke={gen1 ? "#3b82f6" : "#475569"} strokeWidth="6" />

          {/* Generator 2 */}
          <g transform="translate(500, 100)" onClick={() => setGen2(!gen2)} className="cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500" role="button" aria-label={`Alternar Generador 2. Estado actual: ${gen2 ? 'Encendido' : 'Fallado'}`} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setGen2(!gen2); } }}>
            <circle cx="50" cy="50" r="40" fill={gen2 ? "#3b82f6" : "#ef4444"} stroke="#fff" strokeWidth="2" />
            <text x="50" y="45" fill="white" textAnchor="middle" fontSize="16" fontWeight="bold">GEN 2</text>
            <text x="50" y="65" fill="white" textAnchor="middle" fontSize="12">{gen2 ? "ON" : "FAIL"}</text>
          </g>

          {/* Gen 2 Line */}
          <path d="M 550 140 L 550 250" stroke={gen2 ? "#3b82f6" : "#475569"} strokeWidth="6" />

        </svg>
      </div>
    </div>
  );
}
