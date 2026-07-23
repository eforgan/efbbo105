'use client';

import React from 'react';
import { DisplayMode, MissionType } from '../types/efb';
import { Activity, Battery, Sun, Moon, Eye, Radio, ShieldAlert, Menu } from 'lucide-react';

interface HeaderProps {
  mode: DisplayMode;
  setMode: (m: DisplayMode) => void;
  mission: MissionType;
  setMission: (m: MissionType) => void;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ mode, setMode, mission, setMission, onToggleMobileSidebar }) => {
  const [time, setTime] = React.useState<string>('');

  React.useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setTime(`${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}:${d.getUTCSeconds().toString().padStart(2, '0')} UTC`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="glass-panel sticky top-0 z-40 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4">
      {/* Aircraft Info & Mobile Menu Button */}
      <div className="flex items-center justify-between sm:justify-start space-x-3">
        <div className="flex items-center space-x-3">
          {/* Mobile Sidebar Toggle Button */}
          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 hover:text-slate-100 transition cursor-pointer"
              title="Abrir Menú Lateral"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-base sm:text-lg tracking-wider text-slate-100">BO105 EFB</h1>
              <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] sm:text-xs px-2 py-0.5 rounded font-mono font-bold">
                LQ-HEMS
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 font-mono">Modena Air Service • Dual Allison</p>
          </div>
        </div>

        {/* UTC Time Clock (Mobile Only) */}
        <div className="sm:hidden font-mono text-[10px] text-cyan-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
          {time || '12:00:00 UTC'}
        </div>
      </div>

      {/* Mission Selector & Cockpit Theme Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
        {/* Mission Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-900/90 p-1 rounded-lg border border-slate-800 max-w-full overflow-hidden">
          <span className="text-[10px] sm:text-xs text-slate-400 px-1 font-mono flex items-center gap-1 shrink-0">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Misión:
          </span>
          <select
            value={mission}
            onChange={(e) => setMission(e.target.value as MissionType)}
            className="bg-slate-800 text-[11px] sm:text-xs font-mono text-cyan-300 rounded px-2 py-1 border border-slate-700 outline-none cursor-pointer truncate max-w-[170px] sm:max-w-none"
          >
            <option value="hems-neuquen-vista">Neuquén Vaca Muerta (Vista)</option>
            <option value="hems-rosario-utv">Zona Rosario (UTV HEMS)</option>
            <option value="hems-same-ba">Buenos Aires (SAME AÉREO)</option>
            <option value="hems-ypf-vmos">YPF VMOS Offshore Support</option>
            <option value="training">Entrenamiento & Simulación</option>
          </select>
        </div>

        {/* Status Indicators (Tablet/Desktop) */}
        <div className="hidden lg:flex items-center space-x-3 font-mono text-xs text-slate-400">
          <span className="flex items-center text-emerald-400 gap-1">
            <Radio className="w-3.5 h-3.5" /> DGPS 3D
          </span>
          <span className="flex items-center text-cyan-400 gap-1">
            <Battery className="w-3.5 h-3.5" /> 28.5V DC
          </span>
          <span className="bg-slate-900 border border-slate-800 text-slate-200 px-2 py-1 rounded">
            {time || '12:00:00 UTC'}
          </span>
        </div>

        {/* Modo Día / Modo Noche & Cockpit Theme Switcher */}
        <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 sm:p-1 border border-slate-800 space-x-0.5 sm:space-x-1 font-mono">
          <button
            onClick={() => setMode('daylight')}
            className={`px-2.5 py-1 rounded text-[11px] sm:text-xs flex items-center gap-1 transition cursor-pointer ${
              mode === 'daylight' ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Modo Día (Fondo Claro Alto Contraste)"
          >
            <Sun className="w-3.5 h-3.5" /> Modo Día
          </button>

          <button
            onClick={() => setMode('glass')}
            className={`px-2.5 py-1 rounded text-[11px] sm:text-xs flex items-center gap-1 transition cursor-pointer ${
              mode === 'glass' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Modo Noche (Fondo Oscuro Cockpit Glass)"
          >
            <Moon className="w-3.5 h-3.5" /> Modo Noche
          </button>

          <button
            onClick={() => setMode('nvg-green')}
            className={`px-2 py-1 rounded text-[11px] sm:text-xs flex items-center gap-1 transition cursor-pointer ${
              mode === 'nvg-green' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Filtro Verde Visores Nocturnos (NVG)"
          >
            <Eye className="w-3 h-3" /> NVG Verde
          </button>

          <button
            onClick={() => setMode('cockpit-red')}
            className={`px-2 py-1 rounded text-[11px] sm:text-xs flex items-center gap-1 transition cursor-pointer ${
              mode === 'cockpit-red' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Filtro Rojo Preservación Visión Nocturna"
          >
            Red Preserv.
          </button>
        </div>
      </div>
    </header>
  );
};
