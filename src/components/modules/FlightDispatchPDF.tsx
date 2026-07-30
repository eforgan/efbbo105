'use client';

import React from 'react';
import { generateDispatchPDF } from '../../lib/pdf-generator';
import { calculateWB, calculatePerformance, buildRouteLegs } from '../../lib/calculations';
import { MODENA_WAYPOINTS, DEFAULT_WAYPOINTS, getFleetAircraft } from '../../lib/bo105-specs';
import { useEfbData } from '../../context/EfbDataContext';
import { Waypoint } from '../../types/efb';
import { SignaturePad } from '../SignaturePad';
import { FileCheck, Download, PenLine } from 'lucide-react';

const MISSION_LABELS: Record<string, string> = {
  'hems-neuquen-vista': 'Neuquén Vaca Muerta (Vista Energy)',
  'hems-rosario-utv': 'Zona Rosario (UTV HEMS Fluvial)',
  'hems-same-ba': 'Buenos Aires (SAME AÉREO Urbano)',
  'hems-ypf-vmos': 'YPF VMOS Offshore Support',
  'hems-onshore': 'HEMS Onshore',
  'hems-offshore': 'HEMS Offshore',
  training: 'Entrenamiento & Simulación',
};

export const FlightDispatchPDFModule: React.FC = () => {
  const { stations, performanceInput, mission, activeProfile, routePoints } = useEfbData();
  const [pilotName, setPilotName] = React.useState<string>('Cap. Juan Pérez (PIC)');
  const [copilotName, setCopilotName] = React.useState<string>('Of. Esteban Gómez (SIC)');
  const [doctorName, setDoctorName] = React.useState<string>('Dr. Carlos Rossi (Médico HEMS)');
  const [pilotSignature, setPilotSignature] = React.useState<string | null>(null);

  // Prefill whichever crew field matches the active roster profile's role, so a
  // tripulante que eligió "vuela hoy" no tiene que retipear su nombre en cada despacho.
  React.useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time sync from the roster store on mount/change, not a render loop */
    if (!activeProfile || !activeProfile.fullName) return;
    if (activeProfile.role === 'PIC') setPilotName(activeProfile.fullName);
    else if (activeProfile.role === 'SIC') setCopilotName(activeProfile.fullName);
    else if (activeProfile.role === 'medico') setDoctorName(activeProfile.fullName);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [activeProfile]);

  // Contract name follows the mission selected in the Header, so the printed dispatch
  // always matches the route/waypoints actually used for the navigation section below.
  const contractName = MISSION_LABELS[mission] || MISSION_LABELS['hems-neuquen-vista'];
  const aircraft = React.useMemo(() => getFleetAircraft(mission), [mission]);

  const summary = React.useMemo(() => calculateWB(stations, aircraft.bewKg), [stations, aircraft.bewKg]);
  const perf = React.useMemo(() => calculatePerformance({
    ...performanceInput,
    takeoffWeightKg: summary.totalWeightKg,
  }), [performanceInput, summary]);

  // Prefer the route actually planned in "Planificación de Navegación" (main leg points,
  // excluding alternates); fall back to the mission's default Modena waypoints otherwise.
  const plannedWaypoints: Waypoint[] = React.useMemo(
    () => routePoints.filter(p => !p.isAlternate).map(p => ({
      id: p.id, name: `${p.code} - ${p.name}`, lat: p.lat, lon: p.lon, altFt: 0, isOverwater: false, type: 'airfield',
    })),
    [routePoints]
  );
  const usingPlannedRoute = plannedWaypoints.length >= 2;
  const waypoints = usingPlannedRoute ? plannedWaypoints : (MODENA_WAYPOINTS[mission] || DEFAULT_WAYPOINTS);
  const legs = React.useMemo(() => buildRouteLegs(waypoints), [waypoints]);

  const handleExportPDF = () => {
    generateDispatchPDF(summary, stations, perf, legs, pilotName, contractName, copilotName, doctorName, pilotSignature, aircraft);
  };

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 font-mono">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-cyan-400" /> Hoja de Despacho Oficial Modena Air Service & Certificado W&B
          </h2>
          <p className="text-xs text-slate-400">
            Generación e impresión de documento de despacho de vuelo aprobado para operaciones RAAC 135 HEMS.
          </p>
        </div>

        <button
          onClick={handleExportPDF}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
        >
          <Download className="w-4 h-4" /> Descargar Certificado PDF
        </button>
      </div>

      {/* Form Fields & Preview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">
        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-100 uppercase border-b border-slate-800 pb-2">
            Datos de Operación & Tripulación
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Contrato / Misión Modena</label>
              <div className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-cyan-300 font-bold">
                {contractName}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Se define en el selector de Misión del encabezado — determina la ruta y exposición overwater del despacho.
              </p>
              <p className={`text-[10px] mt-1 font-bold ${usingPlannedRoute ? 'text-emerald-400' : 'text-amber-400'}`}>
                {usingPlannedRoute
                  ? `Usando ruta planificada (${plannedWaypoints.length} puntos) de "Planificación de Navegación".`
                  : 'Sin ruta planificada — usando puntos por defecto de la misión. Armá la ruta en "Planificación de Navegación" para reflejarla acá.'}
              </p>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Piloto al Mando (PIC)</label>
              <input
                type="text"
                value={pilotName}
                onChange={(e) => setPilotName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Copiloto / HEMS Crew (SIC)</label>
              <input
                type="text"
                value={copilotName}
                onChange={(e) => setCopilotName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Médico Aeroevacuador</label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
              />
            </div>

            <div className="pt-2 border-t border-slate-800">
              <label className="text-slate-400 flex items-center gap-1.5 mb-1"><PenLine className="w-3.5 h-3.5" /> Conformidad PIC (Firma)</label>
              <SignaturePad onChange={setPilotSignature} />
              <p className="text-[10px] text-slate-500 mt-1">
                {pilotSignature ? 'Firma capturada — se incluye en el PDF.' : 'Sin firmar — el PDF se genera igual, con el recuadro en blanco.'}
              </p>
            </div>
          </div>
        </div>

        {/* Live Preview Document Mockup */}
        <div className="lg:col-span-2 glass-card p-6 rounded-xl border border-slate-800 space-y-4 bg-slate-900/90 text-slate-200">
          <div className="border-b border-slate-700 pb-3 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-sm text-cyan-400">DESPACHO DE VUELO HEMS - MODENA AIR SERVICE</h4>
              <p className="text-[10px] text-slate-400">Matrícula {aircraft.registration} • {aircraft.color} • BO105 CBS-4 Stretched</p>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-1 rounded font-bold">
              APROBADO RAAC 135
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Resumen Peso y Balanceo</p>
              <p className={`font-bold ${summary.isWeightValid ? '' : 'text-rose-400'}`}>
                Peso Total Despegue: {summary.totalWeightKg} kg / 2,500 kg MTOW {summary.isWeightValid ? '' : '(EXCEDIDO)'}
              </p>
              <p className={`font-bold ${summary.isCgValid ? '' : 'text-rose-400'}`}>
                Centro de Gravedad: {summary.cgLocationMm.toFixed(1)} mm ({summary.isCgValid ? 'DENTRO DE ENVOLVENTE' : 'FUERA DE LÍMITES'})
              </p>
            </div>
            <div>
              <p className={`font-bold ${perf.canHoge ? 'text-emerald-400' : 'text-rose-400'}`}>
                Techo HOGE: {perf.hogeMaxWeightKg} kg ({perf.canHoge ? 'CUMPLE MARGEN' : 'NO CUMPLE'})
              </p>
              <p className="font-bold text-amber-400">Ascenso OEI: +{perf.oeiClimbRateFpm} ft/min</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-xs">
            <p className="text-[10px] text-slate-400 uppercase mb-1">Misión Seleccionada</p>
            <p className="text-slate-300 font-bold">{contractName}</p>
            <p className="text-[10px] text-slate-400 mt-1">
              Misión VFR Diurna / Nocturna HEMS con equipamiento de supervivencia, camilla bloqueada en 4 puntos y oxígeno continuo.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800 grid grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-[10px] text-slate-400 uppercase">PIC</p>
              <p className="font-bold text-slate-200">{pilotName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Copiloto / SIC</p>
              <p className="font-bold text-slate-200">{copilotName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Médico HEMS</p>
              <p className="font-bold text-slate-200">{doctorName || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
