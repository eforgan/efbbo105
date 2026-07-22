'use client';

import React, { useState, useMemo } from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';

export default function PowerCurveComputer() {
  const [weight, setWeight] = useState(2000); // kg
  const [temp, setTemp] = useState(15); // Celsius
  const [altitude, setAltitude] = useState(0); // feet

  // Mathematical Model for Helicopter Power Curve
  // P_req = P_induced + P_profile + P_parasite
  // Simplified for educational visualization
  const data = useMemo(() => {
    const points = [];
    let minPower = Infinity;
    let maxEnduranceV = 0;
    
    let maxRangeRatio = Infinity;
    let maxRangeV = 0;

    // Power Available drops with Altitude and Temperature
    // Base power approx 850 HP (twin engine total for BO105)
    // We'll use a normalized scale 0-1000 for visualization
    const powerAvailable = 850 - (temp * 3) - (altitude / 100);

    for (let v = 10; v <= 140; v += 2) {
      // Induced power decreases with speed, increases with weight squared
      const p_induced = (Math.pow(weight, 2) * 0.005) / v;
      // Profile power is relatively constant but increases slightly with speed
      const p_profile = 100 + (v * 0.5);
      // Parasite drag increases with velocity cubed
      const p_parasite = 0.0003 * Math.pow(v, 3);
      
      const p_req = p_induced + p_profile + p_parasite;
      
      points.push({
        velocity: v,
        pReq: p_req,
        pAvail: powerAvailable
      });

      // Find Max Endurance (Lowest Point of Power Required)
      if (p_req < minPower) {
        minPower = p_req;
        maxEnduranceV = v;
      }

      // Find Max Range (Tangent from origin -> lowest P/V ratio)
      const ratio = p_req / v;
      if (ratio < maxRangeRatio) {
        maxRangeRatio = ratio;
        maxRangeV = v;
      }
    }

    return { points, minPower, maxEnduranceV, maxRangeV, powerAvailable };
  }, [weight, temp, altitude]);

  const maxRangePoint = data.points.find(p => p.velocity === data.maxRangeV);
  const maxEndurancePoint = data.points.find(p => p.velocity === data.maxEnduranceV);

  // Tangent line data for Max Range
  const tangentLine = data.points.map(p => ({
    velocity: p.velocity,
    tangent: p.velocity * (maxRangePoint ? maxRangePoint.pReq / maxRangePoint.velocity : 0)
  }));

  // Merge tangent data into main data
  const chartData = data.points.map((p, i) => ({
    ...p,
    tangent: tangentLine[i].tangent
  }));

  const isPowerExceeded = data.minPower > data.powerAvailable;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 my-4 sm:my-8">
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
        <svg className="w-6 h-6 mr-2 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        Computadora de Rendimiento (Curva de Potencia)
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Controls */}
        <div className="space-y-6 lg:col-span-1">
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-slate-700">Peso Bruto</label>
              <span className="text-sm text-slate-500">{weight} kg</span>
            </div>
            <input type="range" min="1300" max="2500" step="50" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600" />
            <p className="text-xs text-slate-400 mt-1">Más peso eleva la curva de potencia requerida.</p>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-slate-700">Temperatura Exterior (OAT)</label>
              <span className="text-sm text-slate-500">{temp} °C</span>
            </div>
            <input type="range" min="-20" max="50" value={temp} onChange={(e) => setTemp(Number(e.target.value))} className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600" />
            <p className="text-xs text-slate-400 mt-1">Mayor temperatura reduce la potencia disponible.</p>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-slate-700">Altitud de Presión (PA)</label>
              <span className="text-sm text-slate-500">{altitude} ft</span>
            </div>
            <input type="range" min="0" max="15000" step="500" value={altitude} onChange={(e) => setAltitude(Number(e.target.value))} className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600" />
            <p className="text-xs text-slate-400 mt-1">Mayor altitud reduce dramáticamente la potencia disponible.</p>
          </div>

          <div className={`p-4 rounded-lg border ${isPowerExceeded ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
            <h4 className={`font-semibold ${isPowerExceeded ? 'text-red-700' : 'text-blue-800'}`}>
              Análisis Aerodinámico
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex justify-between items-center">
                <span className="text-slate-600">Vel. Máxima Autonomía (Vy):</span>
                <span className="font-bold text-emerald-600">{data.maxEnduranceV} kts</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-slate-600">Vel. Máximo Alcance:</span>
                <span className="font-bold text-indigo-600">{data.maxRangeV} kts</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-slate-600">Margen de Potencia:</span>
                <span className={`font-bold ${isPowerExceeded ? 'text-red-600' : 'text-slate-800'}`}>
                  {(data.powerAvailable - data.minPower).toFixed(0)} hp
                </span>
              </li>
            </ul>
            {isPowerExceeded && (
              <p className="text-xs text-red-600 mt-3 font-medium">¡PELIGRO! La potencia requerida excede la potencia disponible del motor. Vuelo imposible en estas condiciones.</p>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="h-72 sm:h-96 w-full bg-slate-50 p-2 rounded-lg border border-slate-200 lg:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                type="number" 
                dataKey="velocity" 
                domain={[0, 140]} 
                name="Velocidad (KIAS)" 
                unit=" kts"
              />
              <YAxis 
                domain={[0, 1000]} 
                name="Potencia" 
                label={{ value: 'Potencia (HP)', angle: -90, position: 'insideLeft', offset: 15 }}
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value: any) => Number(value).toFixed(1)} />
              
              {/* Potencia Disponible */}
              <Line 
                type="monotone" 
                dataKey="pAvail" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={false}
                name="Potencia Disponible"
                isAnimationActive={false}
              />

              {/* Potencia Requerida */}
              <Line 
                type="monotone" 
                dataKey="pReq" 
                stroke="#0284c7" 
                strokeWidth={3}
                dot={false}
                name="Potencia Requerida"
                isAnimationActive={false}
              />

              {/* Tangente de Máximo Alcance */}
              <Line 
                type="linear" 
                dataKey="tangent" 
                stroke="#6366f1" 
                strokeDasharray="5 5"
                dot={false}
                name="Línea Tangente"
                isAnimationActive={false}
              />

              {/* Punto Máxima Autonomía */}
              {maxEndurancePoint && (
                <ReferenceDot 
                  x={maxEndurancePoint.velocity} 
                  y={maxEndurancePoint.pReq} 
                  r={6} 
                  fill="#10b981" 
                  stroke="white" 
                  strokeWidth={2}
                  label={{ value: 'Vy (Autonomía)', position: 'bottom', fill: '#10b981', fontWeight: 'bold' }}
                />
              )}

              {/* Punto Máximo Alcance */}
              {maxRangePoint && (
                <ReferenceDot 
                  x={maxRangePoint.velocity} 
                  y={maxRangePoint.pReq} 
                  r={6} 
                  fill="#6366f1" 
                  stroke="white" 
                  strokeWidth={2}
                  label={{ value: 'Alcance Máx', position: 'right', fill: '#6366f1', fontWeight: 'bold' }}
                />
              )}

            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
