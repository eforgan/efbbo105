'use client';
import { useState, useMemo } from 'react';
import { Wind, Compass, Info } from 'lucide-react';

export default function VientoCruzadoPage() {
  const [runwayHeading, setRunwayHeading] = useState<number>(360);
  const [windDirection, setWindDirection] = useState<number>(45);
  const [windSpeed, setWindSpeed] = useState<number>(15);

  const { headwind, crosswind, isTailwind, side } = useMemo(() => {
    // Convert degrees to radians for JS Math functions
    const angleDiff = (windDirection - runwayHeading) * (Math.PI / 180);
    
    // Calculate components
    const head = windSpeed * Math.cos(angleDiff);
    const cross = windSpeed * Math.sin(angleDiff);
    
    return {
      headwind: Math.abs(Math.round(head)),
      crosswind: Math.abs(Math.round(cross)),
      isTailwind: head < 0,
      side: cross > 0 ? 'Derecha' : cross < 0 ? 'Izquierda' : 'Centro'
    };
  }, [runwayHeading, windDirection, windSpeed]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            <Wind className="text-sky-500" size={40} />
            Calculadora de Viento Cruzado
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
            Calcula instantáneamente los componentes de viento de frente y viento cruzado para tus despegues y aterrizajes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
              <Compass className="text-indigo-500" /> Parámetros
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Rumbo de Pista (Grados)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" min="1" max="360" 
                    value={runwayHeading} 
                    onChange={e => setRunwayHeading(Number(e.target.value))} 
                    className="w-full accent-sky-600"
                  />
                  <input 
                    type="number" min="1" max="360" 
                    value={runwayHeading} 
                    onChange={e => setRunwayHeading(Number(e.target.value))} 
                    className="w-24 p-2 text-center font-mono font-bold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Dirección del Viento (Grados)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" min="1" max="360" 
                    value={windDirection} 
                    onChange={e => setWindDirection(Number(e.target.value))} 
                    className="w-full accent-emerald-600"
                  />
                  <input 
                    type="number" min="1" max="360" 
                    value={windDirection} 
                    onChange={e => setWindDirection(Number(e.target.value))} 
                    className="w-24 p-2 text-center font-mono font-bold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Intensidad del Viento (Nudos)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" min="0" max="60" 
                    value={windSpeed} 
                    onChange={e => setWindSpeed(Number(e.target.value))} 
                    className="w-full accent-amber-600"
                  />
                  <input 
                    type="number" min="0" max="100" 
                    value={windSpeed} 
                    onChange={e => setWindSpeed(Number(e.target.value))} 
                    className="w-24 p-2 text-center font-mono font-bold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-700 text-white flex flex-col justify-center">
            <h2 className="text-xl font-bold text-slate-300 mb-8 text-center uppercase tracking-widest">Componentes Calculados</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-6 rounded-xl border-2 text-center transition-colors ${isTailwind ? 'bg-rose-900/40 border-rose-500/50' : 'bg-emerald-900/40 border-emerald-500/50'}`}>
                <p className="text-sm font-semibold uppercase tracking-wider mb-2 text-slate-300">Viento de {isTailwind ? 'Cola' : 'Frente'}</p>
                <p className={`text-5xl font-black font-mono ${isTailwind ? 'text-rose-400' : 'text-emerald-400'}`}>{headwind}</p>
                <p className="text-slate-400 font-bold mt-1">KTS</p>
              </div>

              <div className="p-6 rounded-xl border-2 bg-sky-900/40 border-sky-500/50 text-center">
                <p className="text-sm font-semibold uppercase tracking-wider mb-2 text-slate-300">Viento Cruzado</p>
                <p className="text-5xl font-black font-mono text-sky-400">{crosswind}</p>
                <p className="text-slate-400 font-bold mt-1">KTS</p>
                <p className="text-xs font-bold text-sky-300 mt-2 bg-sky-900/60 py-1 rounded inline-block px-2">Desde la {side}</p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-slate-800 rounded-lg flex gap-3 text-sm text-slate-300 border border-slate-700">
              <Info className="text-sky-400 flex-shrink-0" size={20} />
              <p>En el BO105, el límite demostrado de viento cruzado para despegue y aterrizaje suele ser de 17 nudos. Verifique el manual de vuelo (Sección 2) para limitaciones exactas.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
