"use client";

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, Label, Legend, ReferenceArea } from 'recharts';

export default function HoverCeilingComputer() {
  const [weight, setWeight] = useState(2400); // kg
  const [temp, setTemp] = useState(15); // C
  const [altitude, setAltitude] = useState(2000); // ft

  // Modelo Matemático Lineal extraído de las Figuras 5-7 (IGE) y 5-9 (OGE)
  const getHoverCeiling = (m: number, oat: number, type: 'IGE' | 'OGE') => {
    // Alt_OGE = 2000 + (2450 - M) * 13.33 - (OAT - 15) * 133.3
    // Alt_IGE = 6000 + (2350 - M) * 13.33 - (OAT - 15) * 133.3
    let alt = 0;
    if (type === 'OGE') {
      alt = 2000 + (2450 - m) * 13.33 - (oat - 15) * 133.3;
    } else {
      alt = 6000 + (2350 - m) * 13.33 - (oat - 15) * 133.3;
    }
    return Math.max(0, alt);
  };

  const currentIGE = getHoverCeiling(weight, temp, 'IGE');
  const currentOGE = getHoverCeiling(weight, temp, 'OGE');

  // Evaluar estado actual
  let status = 'INSEGURO (Sin Hover)';
  let statusColor = 'bg-red-100 text-red-700 border-red-300';
  
  if (altitude <= currentOGE) {
    status = 'SEGURO (Hover OGE e IGE)';
    statusColor = 'bg-green-100 text-green-700 border-green-300';
  } else if (altitude <= currentIGE) {
    status = 'MARGINAL (Solo Hover IGE)';
    statusColor = 'bg-yellow-100 text-yellow-700 border-yellow-300';
  }

  // Generar datos para el gráfico: Eje X es Peso Bruto, Eje Y es Altitud.
  const data = [];
  for (let m = 1400; m <= 2500; m += 20) {
    data.push({
      weight: m,
      IGE: getHoverCeiling(m, temp, 'IGE'),
      OGE: getHoverCeiling(m, temp, 'OGE'),
    });
  }

  return (
    <div className="space-y-8 mt-16 pt-16 border-t border-slate-200">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Techo de Vuelo Estacionario (Hover Ceiling)</h2>
        <p className="text-slate-600 mt-2">Curvas de capacidad IGE y OGE basadas en la temperatura seleccionada.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Temperatura Exterior (OAT): {temp}°C
          </label>
          <input
            type="range"
            min="-40"
            max="55"
            step="1"
            value={temp}
            onChange={(e) => setTemp(Number(e.target.value))}
            className="w-full h-3 bg-slate-300 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        <div className="bg-sky-50 p-4 rounded-xl border border-sky-200">
          <label className="block text-sm font-semibold text-sky-800 mb-2">
            Peso Actual (kg): {weight}
          </label>
          <input
            type="range"
            min="1400"
            max="2500"
            step="10"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full h-3 bg-sky-300 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="bg-sky-50 p-4 rounded-xl border border-sky-200">
          <label className="block text-sm font-semibold text-sky-800 mb-2">
            Altitud Actual (ft): {altitude}
          </label>
          <input
            type="range"
            min="0"
            max="16000"
            step="500"
            value={altitude}
            onChange={(e) => setAltitude(Number(e.target.value))}
            className="w-full h-3 bg-sky-300 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <div className={`p-4 rounded-lg font-bold text-center border ${statusColor}`}>
        Estado de Operación: {status}
      </div>

      <div className="h-96 w-full border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="weight" type="number" domain={[1400, 2500]} tickCount={12}>
              <Label value="Peso Bruto (kg)" offset={-10} position="insideBottom" />
            </XAxis>
            <YAxis domain={[0, 16000]} tickCount={9}>
              <Label value="Altitud de Presión (ft)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
            </YAxis>
            <Tooltip formatter={(value: any) => [`${Math.round(Number(value))} ft`, '']} labelFormatter={(label) => `Peso: ${label} kg`} />
            <Legend verticalAlign="top" height={36} />
            
            <Line 
              type="monotone" 
              dataKey="IGE" 
              stroke="#0284c7" 
              strokeWidth={3}
              name="Límite IGE (Efecto Suelo)" 
              dot={false}
            />
            
            <Line 
              type="monotone" 
              dataKey="OGE" 
              stroke="#f59e0b" 
              strokeWidth={3}
              name="Límite OGE (Fuera de Efecto Suelo)" 
              dot={false}
            />

            <ReferenceDot 
              x={weight} 
              y={altitude} 
              r={7} 
              fill={altitude <= currentOGE ? "#22c55e" : (altitude <= currentIGE ? "#eab308" : "#ef4444")} 
              stroke="white"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-slate-500 mt-4 text-center">
          * Basado en gráficos RFM Fig 5-7 y 5-9 (Motores Allison 250-C20B). El punto representa su situación actual. Todo el área por debajo de las curvas es segura para el tipo de Hover correspondiente.
        </p>
      </div>
    </div>
  );
}
