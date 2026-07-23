'use client';

import React from 'react';
import { Fuel, BarChart3, Table } from 'lucide-react';
import { BO105_SPECS } from '../../lib/bo105-specs';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';

export const FuelRangeModule: React.FC = () => {
  const [fuelWeightKg, setFuelWeightKg] = React.useState<number>(350); // kg fuel
  const [tempC, setTempC] = React.useState<number>(20); // °C
  const [cruiseSpeedKt, setCruiseSpeedKt] = React.useState<number>(110); // KIAS
  const [fuelBurnRateKgH, setFuelBurnRateKgH] = React.useState<number>(180); // kg/h
  const [reserveTimeMin, setReserveTimeMin] = React.useState<number>(20); // VFR reserve

  // JET A-1 Density temperature correction (0.80 kg/L nominal @ 15°C)
  const jetA1DensityKgL = 0.80 - (tempC - 15) * 0.0007;
  const fuelLiters = Math.round(fuelWeightKg / jetA1DensityKgL);

  // Total Endurance
  const totalEnduranceHours = fuelWeightKg / fuelBurnRateKgH;
  const totalEnduranceMin = Math.round(totalEnduranceHours * 60);

  // Reserve Fuel
  const reserveFuelKg = Math.round((reserveTimeMin / 60) * fuelBurnRateKgH);
  const usableFuelKg = Math.max(0, fuelWeightKg - reserveFuelKg);
  const usableEnduranceMin = Math.round((usableFuelKg / fuelBurnRateKgH) * 60);

  // Max Range
  const usableRangeNm = Math.round((usableFuelKg / fuelBurnRateKgH) * cruiseSpeedKt);

  // Bingo Fuel (50% fuel mark for overwater / remote return)
  const bingoFuelKg = Math.round(usableFuelKg / 2 + reserveFuelKg);

  // Generate Fuel Depletion Data Points over Flight Time (every 15 min)
  const fuelDepletionData = React.useMemo(() => {
    const points = [];
    const stepMin = 15;
    for (let min = 0; min <= totalEnduranceMin + 15; min += stepMin) {
      const consumedKg = (min / 60) * fuelBurnRateKgH;
      const remainingKg = Math.max(0, Math.round(fuelWeightKg - consumedKg));
      const rangeNm = Math.round((min / 60) * cruiseSpeedKt);
      points.push({
        time: `${min}m`,
        remainingFuelKg: remainingKg,
        reserveKg: reserveFuelKg,
        distanceFlownNm: rangeNm,
      });
      if (remainingKg <= 0) break;
    }
    return points;
  }, [fuelWeightKg, fuelBurnRateKgH, cruiseSpeedKt, totalEnduranceMin, reserveFuelKg]);

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 font-mono">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Fuel className="w-5 h-5 text-amber-400" /> Computadora de Combustible JET A-1 & Autonomía Modena HEMS
          </h2>
          <p className="text-xs text-slate-400">
            MBB BO105 CBS-4 • Corrección por Temperatura de Densidad JET A-1 (Nominal 0.80 kg/L) & Punto Bingo
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-amber-950/40 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-lg font-bold">
            Consumo Nominal: {fuelBurnRateKgH} kg/h (~225 L/h)
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono">
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase">Carga Total Combustible</p>
          <p className="text-2xl font-bold text-amber-400">{fuelWeightKg} <span className="text-xs">kg</span></p>
          <p className="text-[10px] text-slate-400 mt-1">~{fuelLiters} Litros JET A-1 ({jetA1DensityKgL.toFixed(3)} kg/L)</p>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase">Autonomía Bruta Total</p>
          <p className="text-2xl font-bold text-slate-100">{totalEnduranceMin} <span className="text-xs">min</span></p>
          <p className="text-[10px] text-slate-400 mt-1">{(totalEnduranceMin / 60).toFixed(1)} Horas de Vuelo</p>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase">Autonomía Útil (Reserva {reserveTimeMin}m)</p>
          <p className="text-2xl font-bold text-cyan-400">{usableEnduranceMin} <span className="text-xs">min</span></p>
          <p className="text-[10px] text-emerald-400 mt-1">Alcance Útil: {usableRangeNm} NM ({Math.round(usableRangeNm * 1.852)} km)</p>
        </div>

        <div className="glass-card p-4 rounded-xl border border-rose-500/40 bg-rose-950/20">
          <p className="text-[10px] text-slate-400 uppercase">Combustible Bingo (Punto Retorno)</p>
          <p className="text-2xl font-bold text-rose-400">{bingoFuelKg} <span className="text-xs">kg</span></p>
          <p className="text-[10px] text-rose-300 mt-1">Retorno obligatorio si marca &le; {bingoFuelKg} kg</p>
        </div>
      </div>

      {/* Interactive Controls & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-2">
            Parámetros de Entrada Vuelo & Combustible
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Peso de Combustible en Tanques (kg):</span>
                <span className="text-amber-400 font-bold">{fuelWeightKg} kg / {BO105_SPECS.maxFuelKg} kg Máx</span>
              </div>
              <input
                type="range"
                min={100}
                max={BO105_SPECS.maxFuelKg}
                step={10}
                value={fuelWeightKg}
                onChange={(e) => setFuelWeightKg(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded accent-amber-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Temperatura Ambiente OAT (°C):</span>
                <span className="text-cyan-400 font-bold">{tempC} °C</span>
              </div>
              <input
                type="range"
                min={-20}
                max={45}
                value={tempC}
                onChange={(e) => setTempC(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Velocidad de Crucero (KIAS):</span>
                <span className="text-slate-200 font-bold">{cruiseSpeedKt} kts</span>
              </div>
              <input
                type="range"
                min={80}
                max={135}
                step={5}
                value={cruiseSpeedKt}
                onChange={(e) => setCruiseSpeedKt(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded accent-slate-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Consumo Específico Estimado (kg/h):</span>
                <span className="text-rose-400 font-bold">{fuelBurnRateKgH} kg/h</span>
              </div>
              <input
                type="range"
                min={150}
                max={220}
                step={5}
                value={fuelBurnRateKgH}
                onChange={(e) => setFuelBurnRateKgH(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded accent-rose-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Reserva de Seguridad Mínima VFR (min):</span>
                <span className="text-emerald-400 font-bold">{reserveTimeMin} min ({reserveFuelKg} kg)</span>
              </div>
              <input
                type="range"
                min={15}
                max={45}
                step={5}
                value={reserveTimeMin}
                onChange={(e) => setReserveTimeMin(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Interactive Fuel Depletion Recharts Chart */}
        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-400" /> Curva de Consumo & Agotamiento de Combustible en Vuelo
          </h3>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fuelDepletionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[0, BO105_SPECS.maxFuelKg]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <ReferenceLine y={reserveFuelKg} stroke="#ef4444" strokeDasharray="3 3" label={{ value: `Reserva VFR (${reserveFuelKg}kg)`, fill: '#ef4444', fontSize: 10 }} />
                <Area type="monotone" dataKey="remainingFuelKg" name="Combustible Restante (kg)" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive Fuel Table */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-3">
        <h3 className="font-bold text-slate-200 uppercase tracking-wider text-xs flex items-center gap-2">
          <Table className="w-4 h-4 text-amber-400" /> Tabla de Proyección de Combustible & Distancia en Vuelo
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                <th className="py-2 px-2">Tiempo Transcurrido</th>
                <th className="py-2 px-2">Combustible Restante</th>
                <th className="py-2 px-2">Distancia Recorrida</th>
                <th className="py-2 px-2">Estado de Combustible</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-[11px]">
              {fuelDepletionData.map((row, idx) => {
                const isReserve = row.remainingFuelKg <= reserveFuelKg;
                const isBingo = row.remainingFuelKg <= bingoFuelKg && !isReserve;
                return (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="py-2 px-2 font-bold text-cyan-400">{row.time}</td>
                    <td className="py-2 px-2 text-amber-400 font-bold">{row.remainingFuelKg} kg</td>
                    <td className="py-2 px-2 text-slate-200">{row.distanceFlownNm} NM (~{Math.round(row.distanceFlownNm * 1.852)} km)</td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isReserve
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : isBingo
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {isReserve ? 'RESERVA MÍNIMA' : isBingo ? 'BINGO FUEL' : 'OK VUELO'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
