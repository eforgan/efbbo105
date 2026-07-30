'use client';

import React from 'react';
import { RouteLeg, MissionType, Waypoint } from '../../types/efb';
import { MODENA_WAYPOINTS } from '../../lib/bo105-specs';
import { buildRouteLegs } from '../../lib/calculations';
import { useEfbData } from '../../context/EfbDataContext';
import { Navigation as NavIcon, AlertTriangle, ShieldCheck, CloudSun, MapPin, AreaChart as AreaChartIcon } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface FlightPlannerModuleProps {
  mission?: MissionType;
}

// Saved plans from "Planificación de Navegación" are picked out of the same dropdown as the
// 4 fixed Modena mission presets — prefixed so a plan id (client-generated, arbitrary string)
// can never collide with a MissionType key.
const SAVED_PLAN_PREFIX = 'plan:';

export const FlightPlannerModule: React.FC<FlightPlannerModuleProps> = ({ mission = 'hems-neuquen-vista' }) => {
  const { savedRoutePlans } = useEfbData();
  const [userSelectedKey, setUserSelectedKey] = React.useState<string | null>(null);
  const prevMissionRef = React.useRef(mission);

  // When the Header's mission selector changes, it should take priority again
  // over any manual selection made locally in this module's own dropdown.
  React.useEffect(() => {
    if (prevMissionRef.current !== mission) {
      prevMissionRef.current = mission;
      setUserSelectedKey(null);
    }
  }, [mission]);

  const activeMissionKey = userSelectedKey || (mission && MODENA_WAYPOINTS[mission] ? mission : 'hems-neuquen-vista');

  const selectedPlan = activeMissionKey.startsWith(SAVED_PLAN_PREFIX)
    ? savedRoutePlans.find(p => `${SAVED_PLAN_PREFIX}${p.id}` === activeMissionKey)
    : null;

  // Saved route points don't carry the terrain altitude / overwater / waypoint-type data the
  // 4 hardcoded mission presets do (those were hand-curated) — default them out rather than
  // guessing, so the altitude chart just reads flat instead of showing fabricated numbers.
  const currentWaypoints: Waypoint[] = selectedPlan
    ? selectedPlan.points.map(p => ({ id: p.id, name: `${p.code} - ${p.name}`, lat: p.lat, lon: p.lon, altFt: 0, isOverwater: false, type: 'airfield' as const }))
    : (MODENA_WAYPOINTS[activeMissionKey] || MODENA_WAYPOINTS['hems-neuquen-vista']);

  const legs: RouteLeg[] = React.useMemo(() => buildRouteLegs(currentWaypoints, 110, 180), [currentWaypoints]);

  const totalDistanceNm = React.useMemo(() => legs.reduce((sum, l) => sum + l.distanceNm, 0), [legs]);
  const totalFlightTimeMin = React.useMemo(() => legs.reduce((sum, l) => sum + l.flightTimeMin, 0), [legs]);
  const totalFuelKg = React.useMemo(() => legs.reduce((sum, l) => sum + l.fuelBurnKg, 0), [legs]);

  const overwaterTimeMin = React.useMemo(() => {
    return legs.filter(l => l.isOverwater).reduce((sum, l) => sum + l.flightTimeMin, 0);
  }, [legs]);

  const isOverwaterSafe = overwaterTimeMin < 5.0;

  const offshoreLeg = legs.find(l => l.isOverwater);
  const etpDistNm = offshoreLeg ? (offshoreLeg.distanceNm / 2).toFixed(1) : '1.9';

  // Generate chart profile data
  const routeChartData = React.useMemo(() => {
    let cumulativeDist = 0;
    let cumulativeFuel = 0;

    const points = [
      {
        wpt: currentWaypoints[0].name.split('-')[0].trim(),
        altitudeFt: currentWaypoints[0].altFt,
        cumDistanceNm: 0,
        cumFuelBurnKg: 0,
      }
    ];

    legs.forEach((leg) => {
      cumulativeDist += leg.distanceNm;
      cumulativeFuel += leg.fuelBurnKg;
      points.push({
        wpt: leg.to.name.split('-')[0].trim(),
        altitudeFt: leg.to.altFt,
        cumDistanceNm: Math.round(cumulativeDist),
        cumFuelBurnKg: Math.round(cumulativeFuel),
      });
    });

    return points;
  }, [currentWaypoints, legs]);

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Route Header Banner */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 font-mono">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <NavIcon className="w-5 h-5 text-cyan-400" /> Planificación de Ruta & Navegación Modena Air Service
          </h2>
          <p className="text-xs text-slate-400">
            MBB BO105 CBS-4 • {selectedPlan
              ? <>Plan Guardado: <span className="text-cyan-300 font-bold">{selectedPlan.name}</span></>
              : <>Misión Seleccionada: <span className="text-cyan-300 font-bold uppercase">{activeMissionKey.replace('hems-', '')}</span></>}
          </p>
        </div>

        {/* Mission Waypoint Selector */}
        <div className="flex items-center space-x-2">
          <select
            value={activeMissionKey}
            onChange={(e) => setUserSelectedKey(e.target.value)}
            className="bg-slate-900 text-xs font-mono text-cyan-300 rounded px-3 py-1.5 border border-slate-700 outline-none cursor-pointer truncate max-w-[200px] sm:max-w-none"
          >
            <optgroup label="Misiones Modena">
              <option value="hems-neuquen-vista">Ruta Neuquén / Vista (Vaca Muerta)</option>
              <option value="hems-rosario-utv">Ruta Rosario UTV (Río Paraná / Sanatorio Parque)</option>
              <option value="hems-same-ba">Ruta SAME AÉREO (Buenos Aires Urbano)</option>
              <option value="hems-ypf-vmos">Ruta YPF VMOS (Offshore / Golfo)</option>
            </optgroup>
            {savedRoutePlans.length > 0 && (
              <optgroup label="Planes Guardados (Planificación de Navegación)">
                {savedRoutePlans.map(plan => (
                  <option key={plan.id} value={`${SAVED_PLAN_PREFIX}${plan.id}`}>
                    {plan.name} ({plan.points.length} pts)
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </div>

      {selectedPlan && currentWaypoints.length < 2 && (
        <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-950/20 text-amber-300 flex items-center gap-2 text-xs font-mono">
          <AlertTriangle className="w-4 h-4 shrink-0" /> Este plan guardado tiene menos de 2 puntos — no hay tramos para calcular. Completalo en &ldquo;Planificación de Navegación&rdquo;.
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono">
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase">Distancia Total Ruta</p>
          <p className="text-2xl font-bold text-cyan-400">{totalDistanceNm.toFixed(1)} <span className="text-xs">NM</span></p>
          <p className="text-[10px] text-slate-400 mt-1">~{(totalDistanceNm * 1.852).toFixed(0)} km totales</p>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase">Tiempo Estimado Vuelo</p>
          <p className="text-2xl font-bold text-slate-100">{totalFlightTimeMin.toFixed(1)} <span className="text-xs">min</span></p>
          <p className="text-[10px] text-slate-400 mt-1">Crucero 110 KIAS</p>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase">Combustible Requerido</p>
          <p className="text-2xl font-bold text-amber-400">{totalFuelKg} <span className="text-xs">kg</span></p>
          <p className="text-[10px] text-slate-400 mt-1">+ Reserva VFR 20 min (60kg)</p>
        </div>

        <div className={`glass-card p-4 rounded-xl border ${
          isOverwaterSafe ? 'border-emerald-500/40 bg-emerald-950/20' : 'border-rose-500/40 bg-rose-950/20'
        }`}>
          <p className="text-[10px] text-slate-400 uppercase">Exposición Overwater</p>
          <p className={`text-2xl font-bold ${isOverwaterSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
            {overwaterTimeMin.toFixed(1)} <span className="text-xs">min</span>
          </p>
          <p className={`text-[10px] mt-1 flex items-center gap-1 ${isOverwaterSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isOverwaterSafe ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            {isOverwaterSafe ? 'Cumple Límite < 5 min' : 'EXCEDE LÍMITE 5 MIN'}
          </p>
        </div>
      </div>

      {/* Interactive Elevation Profile & Fuel Burn Chart */}
      <div className="glass-card p-5 rounded-xl border border-slate-800 font-mono space-y-3">
        <h3 className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
          <AreaChartIcon className="w-4 h-4 text-cyan-400" /> Perfil de Altitud Terreno (ft) & Consumo Acumulado de Combustible (kg)
        </h3>

        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={routeChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="wpt" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis yAxisId="left" domain={[0, 2500]} tick={{ fill: '#06b6d4', fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 400]} tick={{ fill: '#f59e0b', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: '#cbd5e1' }} />
              <Area yAxisId="left" type="monotone" dataKey="altitudeFt" name="Altitud Terreno (ft)" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
              <Area yAxisId="right" type="monotone" dataKey="cumFuelBurnKg" name="Combustible Consumido (kg)" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Navigation Leg Table */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-4 font-mono">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" /> Desglose de Tramos de Navegación Modena HEMS
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">Tramo</th>
                <th className="p-3">Origen ➔ Destino</th>
                <th className="p-3">Rumbo Mag (°)</th>
                <th className="p-3">Distancia (NM)</th>
                <th className="p-3">Tiempo (min)</th>
                <th className="p-3">Combustible (kg)</th>
                <th className="p-3">Condición Terreno</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {legs.map((leg, idx) => (
                <tr key={idx} className={leg.isOverwater ? 'bg-cyan-950/20' : 'hover:bg-slate-800/40'}>
                  <td className="p-3 font-bold text-cyan-400">Tramo {idx + 1}</td>
                  <td className="p-3 font-medium">
                    <span className="text-slate-100">{leg.from.name}</span> ➔ <span className="text-cyan-300">{leg.to.name}</span>
                  </td>
                  <td className="p-3">{leg.magneticHeadingDeg}° M</td>
                  <td className="p-3 font-bold">{leg.distanceNm} NM</td>
                  <td className="p-3">{leg.flightTimeMin} min</td>
                  <td className="p-3 text-amber-400">{leg.fuelBurnKg} kg</td>
                  <td className="p-3">
                    {leg.isOverwater ? (
                      <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] px-2 py-0.5 rounded font-bold">
                        Overwater ({leg.flightTimeMin} min)
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">Terrestre / Urbano</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ETP & METAR Info Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400">Punto de Igual Tiempo (ETP - Equal Time Point)</span>
            <p className="text-sm font-bold text-cyan-400">{etpDistNm} NM del punto de entrada</p>
            <p className="text-[10px] text-slate-500">Punto donde el tiempo de retorno a costa iguala el tiempo de avance al destino.</p>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400">Mínimos VFR HEMS Modena</span>
            <div className="flex items-center space-x-2 text-xs">
              <CloudSun className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-bold">VFR Diurno OK • Vis &gt; 5 km • Techo &gt; 1,000 ft</span>
            </div>
            <p className="text-[10px] text-slate-500">Mantenimiento de separación con terreno y obstáculos urbanos/fluviales.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
