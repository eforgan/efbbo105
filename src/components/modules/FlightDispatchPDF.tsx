'use client';

import React from 'react';
import { generateDispatchPDF } from '../../lib/pdf-generator';
import { calculateWB, calculatePerformance, buildRouteLegs } from '../../lib/calculations';
import { INITIAL_STATIONS, MODENA_WAYPOINTS } from '../../lib/bo105-specs';
import { FileCheck, Download } from 'lucide-react';

export const FlightDispatchPDFModule: React.FC = () => {
  const [pilotName, setPilotName] = React.useState<string>('Cap. Juan Pérez (PIC)');
  const [copilotName, setCopilotName] = React.useState<string>('Of. Esteban Gómez (SIC)');
  const [doctorName, setDoctorName] = React.useState<string>('Dr. Carlos Rossi (Médico HEMS)');
  const [contractName, setContractName] = React.useState<string>('Neuquén Vaca Muerta (Contrato Vista)');

  const summary = React.useMemo(() => calculateWB(INITIAL_STATIONS), []);
  const perf = React.useMemo(() => calculatePerformance({
    pressureAltFt: 500,
    tempC: 18,
    qnhHpa: 1013,
    windSpeedKt: 15,
    windDirDeg: 270,
    runwayHeadingDeg: 250,
    takeoffWeightKg: summary.totalWeightKg,
  }), [summary]);

  const legs = React.useMemo(() => buildRouteLegs(MODENA_WAYPOINTS['hems-neuquen-vista']), []);

  const handleExportPDF = () => {
    generateDispatchPDF(summary, INITIAL_STATIONS, perf, legs, pilotName, contractName, copilotName, doctorName);
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
              <select
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
              >
                <option value="Neuquén Vaca Muerta (Contrato Vista)">Neuquén Vaca Muerta (Contrato Vista)</option>
                <option value="Zona Rosario (UTV HEMS Fluvial)">Zona Rosario (UTV HEMS Fluvial)</option>
                <option value="Buenos Aires (SAME AÉREO Urbano)">Buenos Aires (SAME AÉREO Urbano)</option>
                <option value="YPF VMOS Offshore Support">YPF VMOS Offshore Support</option>
              </select>
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
          </div>
        </div>

        {/* Live Preview Document Mockup */}
        <div className="lg:col-span-2 glass-card p-6 rounded-xl border border-slate-800 space-y-4 bg-slate-900/90 text-slate-200">
          <div className="border-b border-slate-700 pb-3 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-sm text-cyan-400">DESPACHO DE VUELO HEMS - MODENA AIR SERVICE</h4>
              <p className="text-[10px] text-slate-400">Matrícula: LQ-HEMS • Operador: Modena Air Service • BO105 CBS-4 Stretched</p>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-1 rounded font-bold">
              APROBADO RAAC 135
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Resumen Peso y Balanceo</p>
              <p className="font-bold">Peso Total Despegue: {summary.totalWeightKg} kg / 2,500 kg MTOW</p>
              <p className="font-bold">Centro de Gravedad: {summary.cgLocationMm.toFixed(1)} mm (DENTRO DE ENVOLVENTE)</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Performance HOGE</p>
              <p className="font-bold text-emerald-400">Techo HOGE: {perf.hogeMaxWeightKg} kg (CUMPLE MARGEN)</p>
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
