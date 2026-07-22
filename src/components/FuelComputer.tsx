"use client";

import { useState } from 'react';
import { Gauge, Clock, Ruler, Flame, AlertTriangle } from 'lucide-react';

export default function FuelComputer() {
  const [mass, setMass] = useState(2100);
  const [altitude, setAltitude] = useState(0);
  const [temperature, setTemperature] = useState(15);
  const [speed, setSpeed] = useState(90);
  const [fuel, setFuel] = useState(300);

  const MAX_FUEL_KG = 456; // Capacidad estándar BO105
  const RESERVE_FUEL_KG = 30; // Reserva VFR aprox 15-20 min

  // Cálculos derivados directos durante el renderizado (React best practice vs useEffect)
  const baseFF = 135; // kg/h
  const weightFactor = mass / 2100;
  const altFactor = 1 + (altitude / 40000);
  const tempFactor = 1 + (temperature - 15) * 0.0015;
  const speedRatio = (speed - 65) / 65;
  const dragFactor = 1 + Math.pow(speedRatio, 2) * 0.45;

  const fuelFlow = baseFF * weightFactor * altFactor * tempFactor * dragFactor;
  const tas = speed * (1 + 0.02 * (altitude / 1000));
  
  const usableFuel = Math.max(0, fuel - RESERVE_FUEL_KG);
  const endurance = usableFuel / fuelFlow; // en horas
  const range = endurance * tas; // en MN

  const formatHours = (decimalHours: number) => {
    if (decimalHours <= 0) return "0h 0m";
    const h = Math.floor(decimalHours);
    const m = Math.round((decimalHours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
      <div className="bg-slate-800 p-4 sm:p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Flame className="text-orange-400" />
          Computadora de Combustible y Alcance
        </h2>
        <p className="text-slate-400 mt-1">Cálculo de consumo horario, autonomía y alcance basado en parámetros de vuelo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* PARÁMETROS DE ENTRADA */}
        <div className="p-4 sm:p-6 bg-slate-50 border-r border-slate-200 space-y-6">
          <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wider mb-4 border-b pb-2">Condiciones de Vuelo</h3>
          
          <div>
            <div className="flex justify-between mb-1">
              <label className="font-semibold text-slate-700">Masa Bruta (Gross Weight)</label>
              <span className="font-mono text-slate-900 bg-white px-2 py-0.5 rounded shadow-sm border">{mass} kg</span>
            </div>
            <input 
              type="range" min="1500" max="2500" step="10" 
              value={mass} onChange={(e) => setMass(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1"><span>1500 kg (Vacío)</span><span>2500 kg (MTOW)</span></div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="font-semibold text-slate-700">Altitud de Presión</label>
              <span className="font-mono text-slate-900 bg-white px-2 py-0.5 rounded shadow-sm border">{altitude} ft</span>
            </div>
            <input 
              type="range" min="0" max="15000" step="500" 
              value={altitude} onChange={(e) => setAltitude(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="font-semibold text-slate-700">Temperatura Exterior (OAT)</label>
              <span className="font-mono text-slate-900 bg-white px-2 py-0.5 rounded shadow-sm border">{temperature} °C</span>
            </div>
            <input 
              type="range" min="-20" max="50" step="1" 
              value={temperature} onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="font-semibold text-slate-700">Velocidad Aérea (KIAS)</label>
              <span className="font-mono text-slate-900 bg-white px-2 py-0.5 rounded shadow-sm border">{speed} kt</span>
            </div>
            <input 
              type="range" min="0" max="130" step="5" 
              value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <div className="text-xs text-sky-600 mt-1 text-right italic font-medium">TAS Estimada: {Math.round(tas)} kt</div>
          </div>

          <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl mt-8">
            <div className="flex justify-between mb-1">
              <label className="font-bold text-orange-900">Combustible a Bordo</label>
              <span className="font-mono font-bold text-orange-700 bg-white px-2 py-0.5 rounded shadow-sm border border-orange-300">{fuel} kg</span>
            </div>
            <input 
              type="range" min="0" max={MAX_FUEL_KG} step="5" 
              value={fuel} onChange={(e) => setFuel(Number(e.target.value))}
              className="w-full h-3 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-600 my-2"
            />
            <div className="flex justify-between text-xs text-orange-600 mt-1 font-medium">
              <span>0 kg</span>
              <span>Lleno ({MAX_FUEL_KG} kg)</span>
            </div>
            {fuel <= RESERVE_FUEL_KG && (
              <div className="mt-3 flex items-center gap-2 text-red-600 text-sm font-bold bg-red-100 p-2 rounded">
                <AlertTriangle size={16} />
                ¡Advertencia! Combustible en nivel de reserva o inferior.
              </div>
            )}
          </div>
        </div>

        {/* PANEL DE RESULTADOS */}
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col justify-center space-y-8 bg-slate-800 text-white relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute -right-20 -top-20 opacity-5 rotate-12">
            <Gauge size={300} />
          </div>

          <h3 className="text-lg font-bold text-sky-400 uppercase tracking-widest z-10 border-b border-slate-700 pb-2">Resultados Estimados</h3>

          <div className="grid grid-cols-1 gap-6 z-10">
            {/* Consumo */}
            <div className="bg-slate-700/50 p-6 rounded-xl border border-slate-600 flex items-center gap-6">
              <div className="p-4 bg-slate-800 rounded-full text-orange-400 shadow-inner">
                <Flame size={32} />
              </div>
              <div>
                <p className="text-slate-300 font-medium mb-1">Flujo de Combustible (Fuel Flow)</p>
                <div className="flex items-baseline gap-1 sm:gap-2">
                  <span className="text-3xl sm:text-4xl font-black">{Math.round(fuelFlow)}</span>
                  <span className="text-xl text-slate-400">kg/h</span>
                </div>
              </div>
            </div>

            {/* Autonomía */}
            <div className="bg-slate-700/50 p-6 rounded-xl border border-slate-600 flex items-center gap-6">
              <div className="p-4 bg-slate-800 rounded-full text-green-400 shadow-inner">
                <Clock size={32} />
              </div>
              <div>
                <p className="text-slate-300 font-medium mb-1">Autonomía (Endurance)</p>
                <div className="flex items-baseline gap-1 sm:gap-2">
                  <span className="text-3xl sm:text-4xl font-black">{formatHours(endurance)}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Excluye reserva de {RESERVE_FUEL_KG} kg</p>
              </div>
            </div>

            {/* Alcance */}
            <div className="bg-slate-700/50 p-6 rounded-xl border border-slate-600 flex items-center gap-6">
              <div className="p-4 bg-slate-800 rounded-full text-sky-400 shadow-inner">
                <Ruler size={32} />
              </div>
              <div>
                <p className="text-slate-300 font-medium mb-1">Alcance Estimado (Range)</p>
                <div className="flex items-baseline gap-1 sm:gap-2">
                  <span className="text-3xl sm:text-4xl font-black">{Math.round(range)}</span>
                  <span className="text-xl text-slate-400">MN</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Vuelo sin viento (Nil Wind)</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
