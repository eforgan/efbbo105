'use client';

import React from 'react';
import {
  Route, Search, Plus, Trash2, ArrowUp, ArrowDown, MapPinned, CloudSun, Fuel, Clock,
  AlertTriangle, CheckCircle2, RefreshCw, WifiOff, HeartPulse, Waves, ShieldAlert,
  ClipboardCheck, Save, FolderOpen, Wind, History, Compass
} from 'lucide-react';
import { AerodromeRecord, MetarStationInfo, RoutePoint } from '../../types/efb';
import { searchAerodromes, dmsToDecimal, findNearbyAerodromes, DmsInput } from '../../lib/aerodromeSearch';
import { calculateDistanceNm, calculateHeadingDeg, calculateWB } from '../../lib/calculations';
import { BO105_SPECS, OACI_RISK_FACTORS } from '../../lib/bo105-specs';
import { useEfbData } from '../../context/EfbDataContext';
import { RouteMap } from '../nav/RouteMap';
import type { TafSummary } from '../../app/api/weather/route';

const OXYGEN_RESERVE_MIN = 30;
const OVERWATER_LIMIT_MIN = 5;
const CROSSWIND_LIMIT_KT = 25;
const NEARBY_ALTERNATE_RADIUS_NM = 60;
const MIN_GROUNDSPEED_KT = 20;

const CRUISE_SPEED_KT = 100;

// Maps each Modena mission to keywords used to pull the relevant OACI risk
// factors (from bo105-specs.ts) into this route's GO/NO-GO analysis.
const MISSION_RISK_KEYWORDS: Record<string, string[]> = {
  'hems-neuquen-vista': ['vaca muerta', 'añelo', 'patagónico', 'polvo'],
  'hems-rosario-utv': ['paraná', 'utv'],
  'hems-same-ba': ['same'],
  'hems-ypf-vmos': ['ypf', 'offshore', 'punta colorada'],
};

interface LegGeometry {
  key: string;
  from: RoutePoint;
  to: RoutePoint;
  distanceNm: number;
  headingDeg: number;
}

interface Leg extends LegGeometry {
  timeMin: number;
  groundSpeedKt: number;
  windCorrected: boolean;
}

function buildLegGeometry(points: RoutePoint[]): LegGeometry[] {
  const legs: LegGeometry[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const from = points[i];
    const to = points[i + 1];
    const distanceNm = calculateDistanceNm(from, to);
    const headingDeg = calculateHeadingDeg(from, to);
    legs.push({ key: `${from.id}->${to.id}`, from, to, distanceNm, headingDeg });
  }
  return legs;
}

const emptyDms = (hemisphere: DmsInput['hemisphere']): DmsInput => ({ deg: 0, min: 0, sec: 0, hemisphere });

export const NavigationPlanningModule: React.FC = () => {
  const { stations, mission, routePoints: points, setRoutePoints: setPoints, savedRoutePlans, setSavedRoutePlans, addRiskLogEntry, riskLog } = useEfbData();
  const [patientLegKeys, setPatientLegKeys] = React.useState<Set<string>>(new Set());
  const [overwaterLegKeys, setOverwaterLegKeys] = React.useState<Set<string>>(new Set());
  const [query, setQuery] = React.useState('');
  const results = React.useMemo(() => (query.trim() ? searchAerodromes(query) : []), [query]);
  const [showManualEntry, setShowManualEntry] = React.useState(false);

  const [manualName, setManualName] = React.useState('');
  const [manualLatDms, setManualLatDms] = React.useState<DmsInput>(emptyDms('S'));
  const [manualLonDms, setManualLonDms] = React.useState<DmsInput>(emptyDms('W'));

  const [fuelBurnKgH, setFuelBurnKgH] = React.useState(180);
  const [reserveMin, setReserveMin] = React.useState(30);

  const [metars, setMetars] = React.useState<MetarStationInfo[]>([]);
  const [tafs, setTafs] = React.useState<TafSummary[]>([]);
  const [wxStatus, setWxStatus] = React.useState<'idle' | 'loading' | 'live' | 'offline'>('idle');

  const [planName, setPlanName] = React.useState('');
  const [saveFlash, setSaveFlash] = React.useState(false);
  const [logFlash, setLogFlash] = React.useState(false);

  const addPoint = (rec: AerodromeRecord) => {
    setPoints(prev => [...prev, {
      id: `${rec.icao || rec.localCode || rec.name}-${Date.now()}`,
      code: rec.icao || rec.localCode || '—',
      name: rec.name,
      lat: rec.lat,
      lon: rec.lon,
      isAlternate: false,
      isManual: false,
    }]);
    setQuery('');
  };

  const addManualPoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;
    const lat = dmsToDecimal(manualLatDms);
    const lon = dmsToDecimal(manualLonDms);
    setPoints(prev => [...prev, {
      id: `manual-${Date.now()}`,
      code: 'S/C',
      name: manualName.trim(),
      lat,
      lon,
      isAlternate: false,
      isManual: true,
    }]);
    setManualName('');
    setManualLatDms(emptyDms('S'));
    setManualLonDms(emptyDms('W'));
    setShowManualEntry(false);
  };

  const removePoint = (id: string) => setPoints(prev => prev.filter(p => p.id !== id));
  const toggleAlternate = (id: string) => setPoints(prev => prev.map(p => p.id === id ? { ...p, isAlternate: !p.isAlternate } : p));
  const movePoint = (id: string, dir: -1 | 1) => {
    setPoints(prev => {
      const idx = prev.findIndex(p => p.id === id);
      const newIdx = idx + dir;
      if (idx < 0 || newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  };

  const routePoints = React.useMemo(() => points.filter(p => !p.isAlternate), [points]);
  const alternatePoints = React.useMemo(() => points.filter(p => p.isAlternate), [points]);
  const legGeometry = React.useMemo(() => buildLegGeometry(routePoints), [routePoints]);

  const togglePatientLeg = (key: string) => {
    setPatientLegKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleOverwaterLeg = (key: string) => {
    setOverwaterLegKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Wind-corrected leg time: use whichever endpoint's live METAR is available (departure
  // preferred) to compute the headwind/tailwind component along the leg's heading, and
  // adjust effective groundspeed from the fixed 100kt cruise TAS accordingly.
  const legs: Leg[] = React.useMemo(() => {
    return legGeometry.map(g => {
      const metar = metars.find(m => m.icao === g.from.code) ?? metars.find(m => m.icao === g.to.code);
      let groundSpeedKt = CRUISE_SPEED_KT;
      let windCorrected = false;
      if (metar) {
        const angleRad = ((metar.windDirDeg - g.headingDeg) * Math.PI) / 180;
        const headwindKt = metar.windSpeedKt * Math.cos(angleRad);
        groundSpeedKt = Math.max(MIN_GROUNDSPEED_KT, CRUISE_SPEED_KT - headwindKt);
        windCorrected = true;
      }
      const timeMin = (g.distanceNm / groundSpeedKt) * 60;
      return { ...g, timeMin, groundSpeedKt, windCorrected };
    });
  }, [legGeometry, metars]);

  // Estimated weight per leg: base loading (crew, médico, equipo, bodega, combustible
  // real cargado en Peso & Balanceo) minus fuel already burned on prior legs, plus the
  // patient/stretcher weight only on the leg(s) marked "Paciente a Bordo".
  const patientStation = stations.find(s => s.id === 'patient-stretcher');
  const patientWeightKg = patientStation?.weightKg ?? 0;
  const baseWithoutPatientKg = calculateWB(stations.filter(s => s.id !== 'patient-stretcher')).totalWeightKg;

  const legWeights = React.useMemo(() => {
    const { rows } = legs.reduce<{ rows: { key: string; hasPatient: boolean; weightAtStartKg: number }[]; fuelBurnedKg: number }>(
      (acc, leg) => {
        const hasPatient = patientLegKeys.has(leg.key);
        const weightAtStartKg = baseWithoutPatientKg - acc.fuelBurnedKg + (hasPatient ? patientWeightKg : 0);
        return {
          rows: [...acc.rows, { key: leg.key, hasPatient, weightAtStartKg }],
          fuelBurnedKg: acc.fuelBurnedKg + (leg.timeMin / 60) * fuelBurnKgH,
        };
      },
      { rows: [], fuelBurnedKg: 0 }
    );
    return rows;
  }, [legs, patientLegKeys, baseWithoutPatientKg, patientWeightKg, fuelBurnKgH]);

  const patientLegTimeMin = legs.filter(l => patientLegKeys.has(l.key)).reduce((sum, l) => sum + l.timeMin, 0);
  const requiredO2Min = patientLegTimeMin > 0 ? patientLegTimeMin + OXYGEN_RESERVE_MIN : 0;
  const anyLegOverMtow = legWeights.some(w => w.weightAtStartKg > BO105_SPECS.mtowKg);

  const overwaterTimeMin = legs.filter(l => overwaterLegKeys.has(l.key)).reduce((sum, l) => sum + l.timeMin, 0);
  const isOverwaterSafe = overwaterTimeMin <= OVERWATER_LIMIT_MIN;

  const totalDistanceNm = legs.reduce((sum, l) => sum + l.distanceNm, 0);
  const totalTimeMin = legs.reduce((sum, l) => sum + l.timeMin, 0);
  const anyLegWindCorrected = legs.some(l => l.windCorrected);
  const destination = routePoints[routePoints.length - 1] || null;

  const alternateLegs = React.useMemo(() => {
    if (!destination) return [];
    return alternatePoints.map(alt => {
      const distanceNm = calculateDistanceNm(destination, alt);
      const timeMin = (distanceNm / CRUISE_SPEED_KT) * 60;
      return { point: alt, distanceNm, timeMin };
    });
  }, [destination, alternatePoints]);

  const farthestAlternate = alternateLegs.reduce<typeof alternateLegs[number] | null>((max, cur) => (!max || cur.distanceNm > max.distanceNm) ? cur : max, null);

  const nearbyAlternateSuggestions = React.useMemo(() => {
    if (!destination) return [];
    const alreadyAdded = new Set(points.map(p => p.code));
    return findNearbyAerodromes({ lat: destination.lat, lon: destination.lon }, NEARBY_ALTERNATE_RADIUS_NM)
      .filter(a => !alreadyAdded.has(a.icao || a.localCode || ''));
  }, [destination, points]);

  const addNearbyAsAlternate = (rec: AerodromeRecord & { distanceNm: number }) => {
    setPoints(prev => [...prev, {
      id: `${rec.icao || rec.localCode || rec.name}-${Date.now()}`,
      code: rec.icao || rec.localCode || '—',
      name: rec.name,
      lat: rec.lat,
      lon: rec.lon,
      isAlternate: true,
      isManual: false,
    }]);
  };

  const tripFuelKg = (totalTimeMin / 60) * fuelBurnKgH;
  const alternateFuelKg = farthestAlternate ? (farthestAlternate.timeMin / 60) * fuelBurnKgH : 0;
  const reserveFuelKg = (reserveMin / 60) * fuelBurnKgH;
  const totalFuelRequiredKg = tripFuelKg + alternateFuelKg + reserveFuelKg;
  const exceedsCapacity = totalFuelRequiredKg > BO105_SPECS.maxFuelKg;

  const routeIcaoCodes = React.useMemo(
    () => points.filter(p => !p.isManual && /^[A-Z]{4}$/.test(p.code)).map(p => p.code),
    [points]
  );

  const loadWeather = React.useCallback(async () => {
    if (routeIcaoCodes.length === 0) { setMetars([]); setTafs([]); setWxStatus('idle'); return; }
    setWxStatus('loading');
    try {
      const res = await fetch(`/api/weather?ids=${routeIcaoCodes.join(',')}`);
      const data = await res.json();
      if (!res.ok || !data.metars?.length) throw new Error('empty');
      setMetars(data.metars);
      setTafs(data.tafs ?? []);
      setWxStatus('live');
    } catch {
      setWxStatus('offline');
    }
  }, [routeIcaoCodes]);

  // Destination crosswind: cross-check the last leg's inbound heading against the
  // destination station's live wind (when its METAR was fetched).
  const destinationMetar = destination ? metars.find(m => m.icao === destination.code) : undefined;
  const lastLeg = legs[legs.length - 1];
  const destinationCrosswindKt = destinationMetar && lastLeg
    ? Math.round(Math.abs(destinationMetar.windSpeedKt * Math.sin(((destinationMetar.windDirDeg - lastLeg.headingDeg) * Math.PI) / 180)))
    : null;
  const isCrosswindSafe = destinationCrosswindKt === null || destinationCrosswindKt <= CROSSWIND_LIMIT_KT;

  // Worst flight category reported among the route's live METARs.
  const worstFlightCategory = metars.reduce<MetarStationInfo['flightCategory'] | null>((worst, m) => {
    const rank: Record<MetarStationInfo['flightCategory'], number> = { VFR: 0, MVFR: 1, IFR: 2, LIFR: 3 };
    if (!worst || rank[m.flightCategory] > rank[worst]) return m.flightCategory;
    return worst;
  }, null);

  // Risk factors relevant to the active mission (OACI 5x5 matrix from bo105-specs.ts),
  // plus the patient-transfer risk whenever a leg carries a patient.
  const applicableRiskFactors = React.useMemo(() => {
    const keywords = MISSION_RISK_KEYWORDS[mission] || [];
    return OACI_RISK_FACTORS.filter(f => {
      const nameLower = f.name.toLowerCase();
      if (f.category === 'patient') return patientLegTimeMin > 0;
      return keywords.some(k => nameLower.includes(k));
    });
  }, [mission, patientLegTimeMin]);

  const worstRiskScore = applicableRiskFactors.reduce((max, f) => Math.max(max, f.severity * f.probability), 0);
  const hasIntolerableRisk = worstRiskScore >= 15;
  const hasTolerableRisk = worstRiskScore >= 7 && worstRiskScore < 15;

  const goNoGoBlockers: string[] = [];
  if (legs.length === 0) goNoGoBlockers.push('Cargá al menos un tramo de ruta para evaluar el despacho.');
  if (exceedsCapacity) goNoGoBlockers.push('Combustible programado excede la capacidad utilizable.');
  if (anyLegOverMtow) goNoGoBlockers.push('Al menos un tramo excede el MTOW con la carga actual.');
  if (!isOverwaterSafe) goNoGoBlockers.push(`Exposición overwater (${overwaterTimeMin.toFixed(0)} min) excede el límite de ${OVERWATER_LIMIT_MIN} min.`);
  if (worstFlightCategory === 'IFR' || worstFlightCategory === 'LIFR') goNoGoBlockers.push(`Meteorología ${worstFlightCategory} reportada en la ruta — por debajo de mínimos VFR HEMS.`);
  if (!isCrosswindSafe) goNoGoBlockers.push(`Viento cruzado en destino (${destinationCrosswindKt} kt) excede el límite de ${CROSSWIND_LIMIT_KT} kt.`);
  if (hasIntolerableRisk) goNoGoBlockers.push('Al menos un factor de riesgo OACI en nivel INTOLERABLE.');

  const goNoGoCautions: string[] = [];
  if (worstFlightCategory === 'MVFR') goNoGoCautions.push('Meteorología MVFR reportada en algún punto de la ruta.');
  if (hasTolerableRisk) goNoGoCautions.push('Hay factores de riesgo OACI en nivel TOLERABLE — aplicar barreras mitigadoras.');
  if (patientLegTimeMin > 0) goNoGoCautions.push('Verificar autonomía real de oxígeno contra el requerimiento calculado.');

  const goNoGoVerdict: 'GO' | 'PRECAUCION' | 'NO-GO' | 'SIN-DATOS' =
    legs.length === 0 ? 'SIN-DATOS' : goNoGoBlockers.length > 0 ? 'NO-GO' : goNoGoCautions.length > 0 ? 'PRECAUCION' : 'GO';

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch triggered by route composition changing, not a render loop
    loadWeather();
  }, [loadWeather]);

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim() || points.length === 0) return;
    setSavedRoutePlans(prev => [{ id: `plan-${Date.now()}`, name: planName.trim(), savedAtIso: new Date().toISOString(), points }, ...prev].slice(0, 30));
    setPlanName('');
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 2000);
  };

  const loadPlan = (planId: string) => {
    const plan = savedRoutePlans.find(p => p.id === planId);
    if (plan) setPoints(plan.points);
  };

  const deletePlan = (planId: string) => setSavedRoutePlans(prev => prev.filter(p => p.id !== planId));

  const handleLogRiskAssessment = () => {
    addRiskLogEntry({
      mission,
      routeSummary: points.length > 0 ? points.map(p => p.code).join(' - ') : 'Sin ruta',
      verdict: goNoGoVerdict === 'SIN-DATOS' ? 'NO-GO' : goNoGoVerdict,
      blockers: goNoGoBlockers,
      cautions: goNoGoCautions,
    });
    setLogFlash(true);
    setTimeout(() => setLogFlash(false), 2000);
  };

  return (
    <div className="p-4 space-y-6 max-w-6xl mx-auto font-sans">
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 font-mono">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Route className="w-5 h-5 text-cyan-400" /> Planificación de Navegación
          </h2>
          <p className="text-xs text-slate-400">
            Preparación de vuelo por tramos contra el listado de aeródromos, aeropuertos y helipuertos de Argentina — crucero fijo {CRUISE_SPEED_KT} kt TAS.
          </p>
        </div>
      </div>

      {/* Add waypoint */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
        <h3 className="text-xs font-bold text-slate-100 uppercase border-b border-slate-800 pb-2 flex items-center gap-2">
          <MapPinned className="w-4 h-4 text-cyan-400" /> Agregar Punto de Navegación
        </h3>

        <div className="relative">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Código OACI (SAZN), código de 3 letras (NQN) o localidad..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
            />
          </div>
          {results.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
              {results.map((r, idx) => (
                <button
                  key={idx}
                  onClick={() => addPoint(r)}
                  className="w-full text-left px-3 py-2 hover:bg-slate-800 border-b border-slate-800 last:border-0 flex items-center justify-between gap-2 cursor-pointer"
                >
                  <div>
                    <span className="text-cyan-300 font-bold">{r.icao || r.localCode}</span>
                    <span className="text-slate-300 ml-2">{r.name}</span>
                    <span className="text-slate-500 ml-1">— {r.municipality}</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase shrink-0">{r.kind}</span>
                </button>
              ))}
            </div>
          )}
          {query.trim() && results.length === 0 && (
            <p className="text-[10px] text-amber-400 mt-1">
              No se encontró en el listado. Podés cargarlo manualmente con nombre y coordenadas.
            </p>
          )}
        </div>

        <button
          onClick={() => setShowManualEntry(!showManualEntry)}
          className="text-[10px] text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
        >
          {showManualEntry ? 'Cancelar carga manual' : '+ Cargar punto no registrado (nombre y coordenadas)'}
        </button>

        {showManualEntry && (
          <form onSubmit={addManualPoint} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-3">
            <div>
              <label className="text-slate-400 block mb-1">Nombre del Punto / Lugar</label>
              <input
                type="text"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                placeholder="Ej: Estancia La Esperanza"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Latitud (GMS)</label>
                <div className="flex gap-1">
                  <input type="number" value={manualLatDms.deg} onChange={(e) => setManualLatDms({ ...manualLatDms, deg: Number(e.target.value) })} placeholder="°" className="w-1/4 bg-slate-900 border border-slate-700 rounded px-1.5 py-1.5 text-slate-200" />
                  <input type="number" value={manualLatDms.min} onChange={(e) => setManualLatDms({ ...manualLatDms, min: Number(e.target.value) })} placeholder="'" className="w-1/4 bg-slate-900 border border-slate-700 rounded px-1.5 py-1.5 text-slate-200" />
                  <input type="number" value={manualLatDms.sec} onChange={(e) => setManualLatDms({ ...manualLatDms, sec: Number(e.target.value) })} placeholder='"' className="w-1/4 bg-slate-900 border border-slate-700 rounded px-1.5 py-1.5 text-slate-200" />
                  <select value={manualLatDms.hemisphere} onChange={(e) => setManualLatDms({ ...manualLatDms, hemisphere: e.target.value as DmsInput['hemisphere'] })} className="w-1/4 bg-slate-900 border border-slate-700 rounded px-1 py-1.5 text-slate-200">
                    <option value="S">S</option>
                    <option value="N">N</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Longitud (GMS)</label>
                <div className="flex gap-1">
                  <input type="number" value={manualLonDms.deg} onChange={(e) => setManualLonDms({ ...manualLonDms, deg: Number(e.target.value) })} placeholder="°" className="w-1/4 bg-slate-900 border border-slate-700 rounded px-1.5 py-1.5 text-slate-200" />
                  <input type="number" value={manualLonDms.min} onChange={(e) => setManualLonDms({ ...manualLonDms, min: Number(e.target.value) })} placeholder="'" className="w-1/4 bg-slate-900 border border-slate-700 rounded px-1.5 py-1.5 text-slate-200" />
                  <input type="number" value={manualLonDms.sec} onChange={(e) => setManualLonDms({ ...manualLonDms, sec: Number(e.target.value) })} placeholder='"' className="w-1/4 bg-slate-900 border border-slate-700 rounded px-1.5 py-1.5 text-slate-200" />
                  <select value={manualLonDms.hemisphere} onChange={(e) => setManualLonDms({ ...manualLonDms, hemisphere: e.target.value as DmsInput['hemisphere'] })} className="w-1/4 bg-slate-900 border border-slate-700 rounded px-1 py-1.5 text-slate-200">
                    <option value="W">W</option>
                    <option value="E">E</option>
                  </select>
                </div>
              </div>
            </div>
            <button type="submit" className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Agregar Punto Manual
            </button>
          </form>
        )}
      </div>

      {/* Save / load route plans */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
        <h3 className="text-xs font-bold text-slate-100 uppercase border-b border-slate-800 pb-2 flex items-center gap-2">
          <Save className="w-4 h-4 text-cyan-400" /> Planes de Vuelo Guardados
        </h3>
        <form onSubmit={handleSavePlan} className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="Nombre del plan (ej: Vista Energy - Añelo semanal)"
            className="flex-1 min-w-[200px] bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
          />
          <button type="submit" disabled={points.length === 0} className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer">
            <Save className="w-3.5 h-3.5" /> Guardar Plan Actual
          </button>
          {saveFlash && <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Guardado</span>}
        </form>

        {savedRoutePlans.length > 0 && (
          <div className="space-y-1.5 pt-1">
            {savedRoutePlans.map(plan => (
              <div key={plan.id} className="flex items-center justify-between gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2 min-w-0">
                  <FolderOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="font-bold text-slate-200 truncate">{plan.name}</span>
                  <span className="text-slate-500 text-[10px] shrink-0">({plan.points.length} pts)</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => loadPlan(plan.id)} className="px-2 py-1 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-cyan-300 cursor-pointer">Cargar</button>
                  <button onClick={() => deletePlan(plan.id)} className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Waypoint list */}
      {points.length > 0 && (
        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
          <h3 className="text-xs font-bold text-slate-100 uppercase border-b border-slate-800 pb-2">Puntos de la Ruta</h3>
          {points.map((p, idx) => (
            <div key={p.id} className={`flex items-center justify-between gap-2 p-2 rounded-lg border ${p.isAlternate ? 'bg-amber-950/20 border-amber-500/30' : 'bg-slate-900/60 border-slate-800'}`}>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-cyan-400 font-bold w-6 shrink-0">{idx + 1}.</span>
                <span className="text-slate-100 font-bold shrink-0">{p.code}</span>
                <span className="text-slate-300 truncate">{p.name}</span>
                {p.isAlternate && <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded shrink-0">ALTERNATIVA</span>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => movePoint(p.id, -1)} className="p-1 text-slate-500 hover:text-slate-200 cursor-pointer" title="Subir"><ArrowUp className="w-3.5 h-3.5" /></button>
                <button onClick={() => movePoint(p.id, 1)} className="p-1 text-slate-500 hover:text-slate-200 cursor-pointer" title="Bajar"><ArrowDown className="w-3.5 h-3.5" /></button>
                <button onClick={() => toggleAlternate(p.id)} className="px-2 py-1 text-[10px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer" title="Marcar/Desmarcar como alternativa">
                  {p.isAlternate ? 'Quitar Alt.' : 'Alternativa'}
                </button>
                <button onClick={() => removePoint(p.id)} className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer" title="Quitar"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}

          {nearbyAlternateSuggestions.length > 0 && (
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Alternativas Cercanas al Destino (≤ {NEARBY_ALTERNATE_RADIUS_NM} NM)</span>
              <div className="flex flex-wrap gap-1.5">
                {nearbyAlternateSuggestions.map((r, idx) => (
                  <button
                    key={idx}
                    onClick={() => addNearbyAsAlternate(r)}
                    className="px-2 py-1 rounded-lg text-[10px] bg-slate-900/80 hover:bg-amber-950/40 border border-slate-700 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> {r.icao || r.localCode} — {r.name} ({r.distanceNm.toFixed(0)} NM)
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <RouteMap routePoints={routePoints} alternatePoints={alternatePoints} />

      {/* Legs table */}
      {legs.length > 0 && (
        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
          <h3 className="font-bold text-slate-200 uppercase tracking-wider text-xs flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" /> Tramos de Navegación (Crucero {CRUISE_SPEED_KT} kt TAS)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                  <th className="py-2 px-2">Tramo</th>
                  <th className="py-2 px-2">Rumbo</th>
                  <th className="py-2 px-2">Distancia</th>
                  <th className="py-2 px-2">GS Efectiva</th>
                  <th className="py-2 px-2">Tiempo Parcial</th>
                  <th className="py-2 px-2">Peso Estimado</th>
                  <th className="py-2 px-2">Paciente a Bordo</th>
                  <th className="py-2 px-2">Sobre Agua</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-[11px]">
                {legs.map((leg, idx) => {
                  const w = legWeights[idx];
                  const overMtow = w.weightAtStartKg > BO105_SPECS.mtowKg;
                  const isOverwaterLeg = overwaterLegKeys.has(leg.key);
                  return (
                    <tr key={leg.key} className="hover:bg-slate-900/40">
                      <td className="py-2 px-2 text-slate-200 font-medium">{leg.from.code} ➔ {leg.to.code}</td>
                      <td className="py-2 px-2 text-cyan-400 font-bold">{leg.headingDeg}° M</td>
                      <td className="py-2 px-2">{leg.distanceNm.toFixed(1)} NM</td>
                      <td className="py-2 px-2">
                        {Math.round(leg.groundSpeedKt)} kt{leg.windCorrected && <Wind className="w-3 h-3 inline ml-1 text-cyan-400" />}
                      </td>
                      <td className="py-2 px-2">{leg.timeMin.toFixed(0)} min</td>
                      <td className={`py-2 px-2 font-bold ${overMtow ? 'text-rose-400' : 'text-slate-200'}`}>
                        {Math.round(w.weightAtStartKg)} kg{overMtow ? ' ⚠' : ''}
                      </td>
                      <td className="py-2 px-2">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={w.hasPatient} onChange={() => togglePatientLeg(leg.key)} className="w-3.5 h-3.5 accent-rose-500 rounded cursor-pointer" />
                          {w.hasPatient && <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded">CON PACIENTE</span>}
                        </label>
                      </td>
                      <td className="py-2 px-2">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={isOverwaterLeg} onChange={() => toggleOverwaterLeg(leg.key)} className="w-3.5 h-3.5 accent-cyan-500 rounded cursor-pointer" />
                          {isOverwaterLeg && <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">OVERWATER</span>}
                        </label>
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-slate-900/90 font-bold text-emerald-400 border-t border-slate-700">
                  <td className="py-2.5 px-2 text-sm">TOTAL RUTA</td>
                  <td className="py-2.5 px-2"></td>
                  <td className="py-2.5 px-2 text-sm">{totalDistanceNm.toFixed(1)} NM</td>
                  <td className="py-2.5 px-2"></td>
                  <td className="py-2.5 px-2 text-sm">{totalTimeMin.toFixed(0)} min</td>
                  <td className="py-2.5 px-2"></td>
                  <td className="py-2.5 px-2"></td>
                  <td className="py-2.5 px-2"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {anyLegWindCorrected && (
            <p className="text-[10px] text-cyan-400 flex items-center gap-1"><Wind className="w-3 h-3" /> Tiempos corregidos por viento real (METAR) donde hay dato disponible; sin dato se asume 100 kt sin viento.</p>
          )}

          {anyLegOverMtow && (
            <div className="p-2.5 rounded-lg border border-rose-500/40 bg-rose-950/30 text-rose-300 flex items-center gap-2 text-[11px]">
              <AlertTriangle className="w-4 h-4 shrink-0" /> Al menos un tramo excede el MTOW ({BO105_SPECS.mtowKg} kg) con la carga actual de Peso &amp; Balanceo — ajustá la carga o el combustible antes de despachar.
            </div>
          )}

          {patientLegTimeMin > 0 && (
            <div className="p-3 rounded-lg border border-cyan-500/30 bg-cyan-950/20 flex items-start gap-2 text-[11px] text-cyan-200">
              <HeartPulse className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <p>
                Tiempo con paciente a bordo: <strong>{patientLegTimeMin.toFixed(0)} min</strong>. Autonomía de oxígeno requerida
                (tramo con paciente + {OXYGEN_RESERVE_MIN} min de reserva): <strong>{requiredO2Min.toFixed(0)} min</strong>.
                Verificá en &ldquo;Oxígeno HEMS&rdquo; que el cilindro cargado cubra esta autonomía.
              </p>
            </div>
          )}

          {overwaterTimeMin > 0 && (
            <div className={`p-3 rounded-lg border flex items-start gap-2 text-[11px] ${isOverwaterSafe ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200' : 'border-rose-500/40 bg-rose-950/30 text-rose-300'}`}>
              <Waves className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                Exposición overwater marcada: <strong>{overwaterTimeMin.toFixed(0)} min</strong> (límite {OVERWATER_LIMIT_MIN} min).
                {isOverwaterSafe ? ' Dentro de límite.' : ' EXCEDE el límite — requiere equipamiento de supervivencia marítima completo o replanificar.'}
              </p>
            </div>
          )}

          {alternateLegs.length > 0 && (
            <div className="pt-2 border-t border-slate-800 space-y-1">
              {alternateLegs.map((a, idx) => (
                <p key={idx} className={`text-[11px] ${farthestAlternate === a ? 'text-amber-300 font-bold' : 'text-slate-400'}`}>
                  Alternativa {a.point.code} ({a.point.name}): {a.distanceNm.toFixed(1)} NM / {a.timeMin.toFixed(0)} min desde destino {farthestAlternate === a ? '— MÁS LEJANA' : ''}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Fuel planning */}
      {legs.length > 0 && (
        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
          <h3 className="font-bold text-slate-200 uppercase tracking-wider text-xs flex items-center gap-2">
            <Fuel className="w-4 h-4 text-amber-400" /> Combustible Programado
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Consumo Específico (kg/h):</span>
                <span className="text-amber-400 font-bold">{fuelBurnKgH} kg/h</span>
              </div>
              <input type="range" min={150} max={220} step={5} value={fuelBurnKgH} onChange={(e) => setFuelBurnKgH(Number(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded accent-amber-400 cursor-pointer" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Reserva / Espera (min):</span>
                <span className="text-emerald-400 font-bold">{reserveMin} min</span>
              </div>
              <input type="range" min={15} max={60} step={5} value={reserveMin} onChange={(e) => setReserveMin(Number(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded accent-emerald-400 cursor-pointer" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400">Combustible de Viaje</span>
              <p className="text-lg font-bold text-slate-100">{Math.round(tripFuelKg)} kg</p>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400">Combustible a Alternativa</span>
              <p className="text-lg font-bold text-slate-100">{Math.round(alternateFuelKg)} kg</p>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400">Reserva / Espera</span>
              <p className="text-lg font-bold text-slate-100">{Math.round(reserveFuelKg)} kg</p>
            </div>
            <div className={`p-3 rounded-lg border ${exceedsCapacity ? 'bg-rose-950/30 border-rose-500/40' : 'bg-emerald-950/30 border-emerald-500/40'}`}>
              <span className="text-[10px] text-slate-400">Total Programado</span>
              <p className={`text-lg font-bold ${exceedsCapacity ? 'text-rose-400' : 'text-emerald-400'}`}>{Math.round(totalFuelRequiredKg)} kg</p>
            </div>
          </div>

          <div className={`p-3 rounded-lg border flex items-center gap-2 ${exceedsCapacity ? 'bg-rose-950/40 border-rose-500/40 text-rose-300' : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'}`}>
            {exceedsCapacity ? <AlertTriangle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
            <span>
              {exceedsCapacity
                ? `EXCEDE la capacidad de combustible utilizable (${BO105_SPECS.maxFuelKg} kg) — replanificar escalas o reducir carga.`
                : `Dentro de la capacidad de combustible utilizable (${BO105_SPECS.maxFuelKg} kg). Margen: ${Math.round(BO105_SPECS.maxFuelKg - totalFuelRequiredKg)} kg.`}
            </span>
          </div>
        </div>
      )}

      {/* Weather along the route */}
      {routeIcaoCodes.length > 0 && (
        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-xs flex items-center gap-2">
              <CloudSun className="w-4 h-4 text-cyan-400" /> Meteorología de la Ruta
            </h3>
            <div className="flex items-center gap-2">
              {wxStatus === 'live' && <span className="text-[10px] text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> En vivo</span>}
              {wxStatus === 'offline' && <span className="text-[10px] text-amber-400 flex items-center gap-1"><WifiOff className="w-3.5 h-3.5" /> Sin conexión</span>}
              <button onClick={loadWeather} disabled={wxStatus === 'loading'} className="p-1.5 rounded bg-slate-800 text-cyan-400 hover:bg-slate-700 cursor-pointer disabled:opacity-50">
                <RefreshCw className={`w-3.5 h-3.5 ${wxStatus === 'loading' ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {metars.map(m => (
              <div key={m.icao} className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-100">{m.icao}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${m.flightCategory === 'VFR' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>{m.flightCategory}</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">{m.name}</p>
                <p className="text-[10px] text-slate-500">Viento {m.windDirDeg}°/{m.windSpeedKt}kt • {m.tempC}°C • QNH {m.qnhHpa}</p>
                <code className="text-[9px] text-cyan-300 block truncate">{m.rawMetar}</code>
              </div>
            ))}
            {metars.length === 0 && wxStatus !== 'loading' && (
              <p className="text-slate-500 text-[11px]">Sin datos meteorológicos disponibles para los puntos con código OACI de la ruta.</p>
            )}
          </div>
          <p className="text-[10px] text-slate-500">
            Solo se consulta METAR/TAF para los puntos con código OACI de 4 letras (fuente: NOAA Aviation Weather Center).
          </p>

          {tafs.length > 0 && (
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase">Pronóstico TAF</h4>
              {tafs.map(t => (
                <div key={t.icao} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-cyan-300 font-bold text-[10px]">{t.icao}</span>
                  <code className="text-[9px] text-amber-300 block mt-1 whitespace-pre-wrap break-words">{t.rawTaf}</code>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Integrated GO / NO-GO risk analysis */}
      {legs.length > 0 && (
        <div className={`glass-card p-4 rounded-xl border space-y-3 font-mono text-xs ${
          goNoGoVerdict === 'NO-GO' ? 'border-rose-500/50' : goNoGoVerdict === 'PRECAUCION' ? 'border-amber-500/50' : 'border-emerald-500/50'
        }`}>
          <h3 className="font-bold text-slate-200 uppercase tracking-wider text-xs flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-cyan-400" /> Análisis de Riesgo & Decisión de Despacho
          </h3>
          <p className="text-[10px] text-slate-500">
            Consolida ruta, combustible, meteorología y la matriz de riesgo OACI (Doc. 9859) aplicable a la misión activa en un
            único resultado. No reemplaza el juicio operativo del PIC ni el proceso de despacho formal de Modena.
          </p>

          <div className={`p-4 rounded-xl border flex items-center gap-3 ${
            goNoGoVerdict === 'NO-GO' ? 'bg-rose-950/40 border-rose-500/40 text-rose-300' :
            goNoGoVerdict === 'PRECAUCION' ? 'bg-amber-950/40 border-amber-500/40 text-amber-300' :
            'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
          }`}>
            {goNoGoVerdict === 'NO-GO' ? <AlertTriangle className="w-8 h-8 shrink-0" /> : goNoGoVerdict === 'PRECAUCION' ? <ShieldAlert className="w-8 h-8 shrink-0" /> : <CheckCircle2 className="w-8 h-8 shrink-0" />}
            <div>
              <p className="text-lg font-bold">
                {goNoGoVerdict === 'NO-GO' ? 'NO-GO' : goNoGoVerdict === 'PRECAUCION' ? 'GO CON PRECAUCIÓN' : 'GO'}
              </p>
              <p className="text-[11px] opacity-90">
                {goNoGoVerdict === 'NO-GO'
                  ? 'Hay condiciones que impiden el despacho tal como está planificado.'
                  : goNoGoVerdict === 'PRECAUCION'
                  ? 'Despacho posible aplicando las barreras mitigadoras señaladas.'
                  : 'Ruta, combustible, meteorología y riesgo dentro de parámetros aceptables.'}
              </p>
            </div>
          </div>

          {goNoGoBlockers.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-rose-400 uppercase">Bloqueantes (NO-GO)</span>
              {goNoGoBlockers.map((b, idx) => (
                <p key={idx} className="text-[11px] text-rose-300 flex items-start gap-1.5"><AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {b}</p>
              ))}
            </div>
          )}

          {goNoGoCautions.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase">Precauciones</span>
              {goNoGoCautions.map((c, idx) => (
                <p key={idx} className="text-[11px] text-amber-300 flex items-start gap-1.5"><ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {c}</p>
              ))}
            </div>
          )}

          {applicableRiskFactors.length > 0 && (
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Matriz de Riesgo OACI Aplicable a la Misión</span>
              {applicableRiskFactors.map(f => {
                const score = f.severity * f.probability;
                const level = score >= 15 ? 'INTOLERABLE' : score >= 7 ? 'TOLERABLE' : 'ACEPTABLE';
                const color = score >= 15 ? 'text-rose-300 bg-rose-500/20 border-rose-500/30' : score >= 7 ? 'text-amber-300 bg-amber-500/20 border-amber-500/30' : 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30';
                return (
                  <div key={f.id} className="flex items-center justify-between gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-300 text-[11px]">{f.name}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold border shrink-0 ${color}`}>{level} ({f.severity}x{f.probability})</span>
                  </div>
                );
              })}
              <p className="text-[10px] text-slate-500">Ver detalle completo y mitigaciones en &ldquo;Matriz Riesgo SMS OACI&rdquo;.</p>
            </div>
          )}

          <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
            <button onClick={handleLogRiskAssessment} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer">
              <History className="w-3.5 h-3.5" /> Guardar Evaluación en Historial
            </button>
            {logFlash && <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Guardado</span>}
          </div>
        </div>
      )}

      {/* Risk assessment history */}
      {riskLog.length > 0 && (
        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
          <h3 className="font-bold text-slate-200 uppercase tracking-wider text-xs flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" /> Historial de Evaluaciones de Riesgo
          </h3>
          <div className="max-h-72 overflow-y-auto space-y-1.5">
            {riskLog.map(entry => (
              <div key={entry.id} className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2 min-w-0">
                  <Compass className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="text-slate-400 text-[10px] shrink-0">{new Date(entry.savedAtIso).toLocaleString('es-AR')}</span>
                  <span className="text-slate-300 truncate">{entry.routeSummary}</span>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded font-bold shrink-0 ${
                  entry.verdict === 'NO-GO' ? 'bg-rose-500/20 text-rose-300' : entry.verdict === 'PRECAUCION' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {entry.verdict === 'PRECAUCION' ? 'GO CON PRECAUCIÓN' : entry.verdict}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
