"use client";

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, Label } from 'recharts';

export default function HVCurveComputer() {
  const [weight, setWeight] = useState(2400); // kg
  const [temp, setTemp] = useState(15); // C
  const [altitude, setAltitude] = useState(0); // ft
  const [speed, setSpeed] = useState(80); // kts
  const [height, setHeight] = useState(200); // ft
  const [failureType, setFailureType] = useState<'SINGLE' | 'DOUBLE'>('DOUBLE'); // DOUBLE por defecto para mostrar ambas zonas

  // Calcula la Altitud de Densidad (DA) para afectar el gráfico
  const isaTemp = 15 - 2 * (altitude / 1000);
  const densityAltitude = altitude + 120 * (temp - isaTemp);
  const effectiveAlt = Math.max(0, densityAltitude);

  const getCurveParams = (w: number, alt: number, type: string) => {
    // En el manual y en la teoría (Módulo 5), la zona de "vuelo rasante a alta velocidad"
    // se representa siempre con un límite inferior constante para evitar vuelo de riesgo.
    const groundAvoid = 15; // ft

    if (type === 'DOUBLE') {
      const hMax = Math.min(Math.max(1000 + (w - 2100) * 0.75 + alt * 0.02, 800), 1200);
      
      const vKnee = 65 + (w - 2100) * 0.05 + alt * 0.002;
      const hKnee = 100 + Math.max(0, (w - 2300) * 0.5);
      
      return { hMax, vKnee, hKnee, vTail: 0, hMin: 0, isDouble: true, groundAvoid };
    } else {
      // Single Engine Failure (OEI) - La curva cae y termina en el suelo
      const hMax = Math.max(0, 100 + (w - 2300) * 0.8 + alt * 0.02);
      
      const vTail = Math.max(10, 25 + (w - 2300) * 0.1 + alt * 0.002);
      
      const hMin = Math.max(0, (w - 2300) * 0.02 + alt * 0.001);
      
      return { hMax, vKnee: 0, hKnee: 0, vTail, hMin, isDouble: false, groundAvoid };
    }
  };

  const params = getCurveParams(weight, effectiveAlt, failureType);

  const isUnsafe = (v: number, h: number) => {
    // Zona roja de alta velocidad y baja altura
    if (h <= params.groundAvoid) return true;
    
    // Área principal de la curva (Rodilla o Bucle)
    if (params.isDouble) {
      if (v <= params.vKnee) {
        const progress = v / params.vKnee;
        const upperLimit = params.hKnee + (params.hMax - params.hKnee) * Math.pow(1 - progress, 1.5);
        const lowerLimit = 20 + (params.hKnee - 20) * Math.pow(progress, 1.5);
        if (h >= lowerLimit && h <= upperLimit) return true;
      }
    } else {
      if (v <= params.vTail) {
        const progress = v / params.vTail;
        const upperLimit = params.hMax * Math.pow(1 - progress, 1.5);
        const peakHeight = params.hMin * 3 + effectiveAlt * 0.002;
        const lowerLimit = params.hMin * (1 - progress) + peakHeight * Math.sin(progress * Math.PI);
        if (h >= lowerLimit && h <= upperLimit) return true;
      }
    }
    
    return false;
  };

  const currentUnsafe = isUnsafe(speed, height);

  const data = [];
  const maxSpeed = 120; // Extendido para mostrar claramente la zona de alta velocidad
  const yAxisMax = failureType === 'DOUBLE' ? 1200 : 400;

  for (let v = 0; v <= maxSpeed; v += 1) {
    let mainAvoid: [number, number] | null = null;
    
    if (params.isDouble) {
      if (v <= params.vKnee) {
        const progress = v / params.vKnee;
        const upperLimit = params.hKnee + (params.hMax - params.hKnee) * Math.pow(1 - progress, 1.5);
        const lowerLimit = Math.max(params.groundAvoid, 20 + (params.hKnee - 20) * Math.pow(progress, 1.5));
        mainAvoid = [lowerLimit, upperLimit];
      }
    } else {
      if (v <= params.vTail) {
        const progress = v / params.vTail;
        const upperLimit = params.hMax * Math.pow(1 - progress, 1.5);
        const peakHeight = params.hMin * 3 + effectiveAlt * 0.002;
        let lowerLimit = params.hMin * (1 - progress) + peakHeight * Math.sin(progress * Math.PI);
        
        lowerLimit = Math.max(params.groundAvoid, lowerLimit);
        
        if (upperLimit > lowerLimit) {
          mainAvoid = [lowerLimit, upperLimit];
        }
      }
    }

    data.push({
      speed: v,
      mainAvoid,
      groundAvoid: params.groundAvoid,
    });
  }

  return (
    <div className="space-y-8">
      
      {/* Selector de Tipo de Falla */}
      <div className="flex justify-center mb-4">
        <div className="bg-slate-900/80 border border-slate-800 p-1 rounded-xl flex flex-wrap gap-1 justify-center">
          <button
            onClick={() => setFailureType('SINGLE')}
            className={`px-4 sm:px-6 py-2 rounded-lg font-bold text-sm transition-colors cursor-pointer ${failureType === 'SINGLE' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Falla Motor Único (OEI)
          </button>
          <button
            onClick={() => setFailureType('DOUBLE')}
            className={`px-4 sm:px-6 py-2 rounded-lg font-bold text-sm transition-colors cursor-pointer ${failureType === 'DOUBLE' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Doble Falla (Autorrotación)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <label className="block text-sm font-semibold text-slate-400 mb-2">
            Peso Bruto (kg): <span className="text-slate-100">{weight}</span>
          </label>
          <input
            type="range"
            min="2000"
            max="2500"
            step="10"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-300"
          />
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <label className="block text-sm font-semibold text-slate-400 mb-2">
            Temperatura (°C): <span className="text-slate-100">{temp}</span>
          </label>
          <input
            type="range"
            min="-30"
            max="50"
            step="1"
            value={temp}
            onChange={(e) => setTemp(Number(e.target.value))}
            className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-300"
          />
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <label className="block text-sm font-semibold text-slate-400 mb-2">
            Altitud de Presión (ft): <span className="text-slate-100">{altitude}</span>
          </label>
          <input
            type="range"
            min="0"
            max="10000"
            step="500"
            value={altitude}
            onChange={(e) => setAltitude(Number(e.target.value))}
            className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-300"
          />
        </div>

        <div className="bg-cyan-950/30 p-4 rounded-xl border border-cyan-500/30">
          <label className="block text-sm font-semibold text-cyan-300 mb-2">
            Velocidad (KIAS): <span className="text-cyan-200">{speed}</span>
          </label>
          <input
            type="range"
            min="0"
            max="120"
            step="5"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full h-3 bg-cyan-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        <div className="bg-cyan-950/30 p-4 rounded-xl border border-cyan-500/30">
          <label className="block text-sm font-semibold text-cyan-300 mb-2">
            Altura (ft AGL): <span className="text-cyan-200">{height}</span>
          </label>
          <input
            type="range"
            min="0"
            max={yAxisMax}
            step="10"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="w-full h-3 bg-cyan-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
      </div>

      <div className={`p-4 rounded-lg font-bold text-center border ${currentUnsafe ? 'bg-rose-950/40 text-rose-300 border-rose-500/40' : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'}`}>
        Estado de Operación: {currentUnsafe ? 'ÁREA A EVITAR (INSEGURA)' : 'OPERACIÓN SEGURA'}
      </div>

      <div className="h-72 sm:h-96 w-full border border-slate-800 rounded-xl p-4 bg-slate-900/80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="speed" type="number" domain={[0, maxSpeed]} tickCount={13} tick={{ fill: '#94a3b8', fontSize: 11 }}>
              <Label value="Velocidad (KIAS)" offset={-10} position="insideBottom" fill="#94a3b8" />
            </XAxis>
            <YAxis domain={[0, yAxisMax]} tickCount={8} tick={{ fill: '#94a3b8', fontSize: 11 }}>
              <Label value="Altura (ft AGL)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#94a3b8' }} />
            </YAxis>
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
            
            {/* Área a Evitar Principal */}
            <Area 
              type="monotone" 
              dataKey="mainAvoid" 
              stroke="#ef4444" 
              fill="url(#diagonalHatch)" 
              fillOpacity={0.8}
              name="Zona a Evitar (Baja Velocidad)"
              connectNulls={false}
            />
            
            {/* Banda inferior (Zona roja de alta velocidad y baja altura) */}
            <Area 
              type="step" 
              dataKey="groundAvoid" 
              stroke="#ef4444" 
              fill="url(#diagonalHatch)" 
              fillOpacity={0.8}
              name="Zona a Evitar (Baja Altura)"
            />
            
            {/* Patrón de sombreado cruzado para imitar el manual */}
            <defs>
              <pattern id="diagonalHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="8" stroke="#fecaca" strokeWidth="4" />
              </pattern>
            </defs>

            {/* Current Position Dot */}
            <ReferenceDot 
              x={speed} 
              y={height} 
              r={6} 
              fill={currentUnsafe ? "#ef4444" : "#22c55e"} 
              stroke="white"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
        <p className="text-xs text-slate-500 mt-4 text-center leading-relaxed">
          * Gráfico matemático de forma estilizada con fines de estudio — no es una transcripción del RFM. <br/>
          <strong>Nota:</strong> Incluye la zona prohibitiva a ras de piso para altas velocidades, y el bucle cerrado que permite operaciones rasantes y Hover IGE.
          Para la curva limitante oficial consulte el RFM (Fig. 5-5 / Fig. 5-6) en Biblioteca ANAC &amp; RFM.
        </p>
      </div>
    </div>
  );
}
