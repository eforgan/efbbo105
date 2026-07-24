'use client';

import React from 'react';
import HVCurveComputer from '../HVCurveComputer';
import { AlertOctagon, Info } from 'lucide-react';

export const HVCurveModule: React.FC = () => {
  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Banner */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 font-mono">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-amber-400" /> Diagrama de Altura-Velocidad (Curva H-V / Avoid Zone)
          </h2>
          <p className="text-xs text-slate-400">
            MBB BO105 CBS-4 • Límite Operativo de Seguridad en Vuelo Estacionario IGE/OGE y Transición de Despegue
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-amber-950/40 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-lg font-bold">
            Aproximación Educativa • No es el RFM
          </span>
        </div>
      </div>

      {/* Info Card */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <Info className="w-4 h-4" /> Criterio Técnico HEMS Modena Air Service:
        </div>
        <p>
          La curva H-V define las combinaciones de altura AGL y velocidad KIAS donde una falla repentina de motor (OEI) o doble falla de motor no permite una autorrotación segura a tierra o aterrizaje forzado controlado. Mantenga perfiles de despegue de alto ángulo fuera del sombreado rojo en helipuertos urbanos (SAME) y helidecks fluviales (UTV Rosario).
        </p>
        <p className="text-amber-300">
          Esta gráfica es una forma estilizada con fines de estudio, no una transcripción de las curvas del RFM. Para
          la curva limitante oficial (Fig. 5-5 falla simple / Fig. 5-6 falla doble, BO 105 CB/CBS) consulte el documento
          RFM en <strong>Biblioteca ANAC &amp; RFM</strong>.
        </p>
      </div>

      {/* Main Interactive Computer */}
      <div className="glass-card p-4 rounded-xl border border-slate-800">
        <HVCurveComputer />
      </div>
    </div>
  );
};
