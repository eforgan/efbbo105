'use client';

import React, { useState, useMemo } from 'react';
import { Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';

// Approximate BO105 CBS4 Data
const BEW = 1350;
const bew_arm = 3250; // typical empty weight arm

const arms = {
  crew: 1850,
  pax: 2800,
  fuel: 3300,
  baggage: 4100
};

const maxGrossWeight = 2500;

export default function WeightBalanceComputer() {
  const [crew, setCrew] = useState(160); // 2 pilots
  const [pax, setPax] = useState(0);
  const [fuel, setFuel] = useState(300); // kg
  const [baggage, setBaggage] = useState(0);

  const results = useMemo(() => {
    const totalWeight = BEW + crew + pax + fuel + baggage;
    
    const totalMoment = (BEW * bew_arm) 
                      + (crew * arms.crew) 
                      + (pax * arms.pax) 
                      + (fuel * arms.fuel) 
                      + (baggage * arms.baggage);
                      
    const cg = totalMoment / totalWeight;
    
    // Accurate envelope limits for BO105 CBS-4
    const isOverweight = totalWeight > maxGrossWeight;
    
    // Forward Limit
    let fwdLimit = 3080;
    if (totalWeight < 1900) {
      // 1500kg to 1900kg -> 3080 to 3038
      fwdLimit = 3080 - Math.max(0, totalWeight - 1500) * (42 / 400);
    } else {
      // 1900kg to 2500kg -> 3038 to 3082
      fwdLimit = 3038 + (totalWeight - 1900) * (44 / 600);
    }

    // Aft Limit
    let aftLimit = 3395;
    if (totalWeight > 2000) {
      // 2000kg to 2500kg -> 3395 to 3270
      aftLimit = 3395 - (totalWeight - 2000) * (125 / 500);
    }
    
    const isOutOfCG = cg < fwdLimit || cg > aftLimit;
    
    return {
      weight: totalWeight,
      cg: cg,
      isOverweight,
      isOutOfCG,
      fwdLimit,
      aftLimit
    };
  }, [crew, pax, fuel, baggage]);

  // Envelope definition for drawing
  const envelopeData = [
    { cg: 3080, weight: 1500 },
    { cg: 3038, weight: 1900 },
    { cg: 3082, weight: 2500 },
    { cg: 3270, weight: 2500 },
    { cg: 3395, weight: 2000 },
    { cg: 3395, weight: 1500 },
    { cg: 3080, weight: 1500 }
  ];

  const currentPoint = [{ cg: results.cg, weight: results.weight }];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 my-4 sm:my-8">
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
        <svg className="w-6 h-6 mr-2 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
        Computadora de Peso y Balanceo (W&B)
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Controls */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-slate-700">Pilotos (Tripulación)</label>
              <span className="text-sm text-slate-500">{crew} kg</span>
            </div>
            <input type="range" min="0" max="250" value={crew} onChange={(e) => setCrew(Number(e.target.value))} className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600" />
            <p className="text-xs text-slate-400 mt-1">Brazo: {arms.crew} mm</p>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-slate-700">Pasajeros</label>
              <span className="text-sm text-slate-500">{pax} kg</span>
            </div>
            <input type="range" min="0" max="400" value={pax} onChange={(e) => setPax(Number(e.target.value))} className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600" />
            <p className="text-xs text-slate-400 mt-1">Brazo: {arms.pax} mm</p>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-slate-700">Combustible</label>
              <span className="text-sm text-slate-500">{fuel} kg</span>
            </div>
            <input type="range" min="0" max="460" value={fuel} onChange={(e) => setFuel(Number(e.target.value))} className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600" />
            <p className="text-xs text-slate-400 mt-1">Brazo: {arms.fuel} mm</p>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-slate-700">Equipaje</label>
              <span className="text-sm text-slate-500">{baggage} kg</span>
            </div>
            <input type="range" min="0" max="150" value={baggage} onChange={(e) => setBaggage(Number(e.target.value))} className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600" />
            <p className="text-xs text-slate-400 mt-1">Brazo: {arms.baggage} mm</p>
          </div>

          <div className={`p-4 rounded-lg border ${results.isOverweight || results.isOutOfCG ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <h4 className={`font-semibold ${results.isOverweight || results.isOutOfCG ? 'text-red-700' : 'text-green-700'}`}>
              Resultados del Cálculo
            </h4>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Peso Bruto:</span>
                <span className={`text-sm font-bold ${results.isOverweight ? 'text-red-600' : 'text-slate-800'}`}>{results.weight.toFixed(0)} kg (Máx 2500)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Posición CG:</span>
                <span className={`text-sm font-bold ${results.isOutOfCG ? 'text-red-600' : 'text-slate-800'}`}>{results.cg.toFixed(1)} mm</span>
              </div>
            </div>
            {(results.isOverweight || results.isOutOfCG) && (
              <p className="text-xs text-red-600 mt-2 font-medium">¡ADVERTENCIA! Helicóptero fuera de los límites operativos.</p>
            )}
            {!results.isOverweight && !results.isOutOfCG && (
              <p className="text-xs text-green-600 mt-2 font-medium">Dentro de los límites operativos.</p>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="h-64 sm:h-80 w-full bg-slate-50 p-2 rounded-lg border border-slate-200">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                type="number" 
                dataKey="cg" 
                domain={[3000, 3500]} 
                name="Centro de Gravedad" 
                unit=" mm"
                label={{ value: 'Centro de Gravedad (mm)', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                type="number" 
                dataKey="weight" 
                domain={[1200, 2600]} 
                name="Peso Bruto" 
                unit=" kg"
                label={{ value: 'Peso Bruto (kg)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              
              <Line 
                data={envelopeData} 
                type="linear" 
                dataKey="weight" 
                stroke="#0284c7" 
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              
              <Scatter 
                name="Helicóptero Actual" 
                data={currentPoint} 
                fill={results.isOverweight || results.isOutOfCG ? "#ef4444" : "#22c55e"} 
                shape="circle"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
