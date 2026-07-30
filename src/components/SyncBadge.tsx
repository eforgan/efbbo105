'use client';

import React from 'react';
import { useEfbData } from '../context/EfbDataContext';
import { Cloud, CloudOff, RefreshCw, KeyRound, LogOut, AlertTriangle } from 'lucide-react';

// One shared PIN-entry + sync-status control, reused on every screen backed by the shared
// Neon tables (Roster, Bitácora, Matriz de Riesgo, Planes de Ruta) — entering the PIN once
// here activates sync everywhere, since it's the same syncPin behind all four.
export const SyncBadge: React.FC = () => {
  const { syncPin, setSyncPin, syncStatus, syncPendingCount, syncAllNow } = useEfbData();
  const [pinInput, setPinInput] = React.useState('');
  const [showPinForm, setShowPinForm] = React.useState(false);

  if (!syncPin) {
    return (
      <div className="flex items-center gap-2">
        {showPinForm ? (
          <form
            onSubmit={(e) => { e.preventDefault(); if (pinInput.trim()) { setSyncPin(pinInput.trim()); setShowPinForm(false); setPinInput(''); } }}
            className="flex items-center gap-1"
          >
            <input
              type="password" inputMode="numeric" autoFocus value={pinInput} onChange={(e) => setPinInput(e.target.value)}
              placeholder="PIN"
              className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs tracking-widest text-center"
            />
            <button type="submit" className="px-2 py-1 rounded text-[10px] bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold cursor-pointer">Ingresar</button>
            <button type="button" onClick={() => { setShowPinForm(false); setPinInput(''); }} className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer">Cancelar</button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowPinForm(true)}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] flex items-center gap-1 cursor-pointer transition"
          >
            <KeyRound className="w-3.5 h-3.5" /> Sincronizar con PIN
          </button>
        )}
      </div>
    );
  }

  const statusMeta: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    idle: { icon: <Cloud className="w-3.5 h-3.5" />, label: 'Sin sincronizar', color: 'text-slate-400 bg-slate-800/60 border-slate-700' },
    syncing: { icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" />, label: 'Sincronizando…', color: 'text-cyan-300 bg-cyan-950/40 border-cyan-500/40' },
    synced: { icon: <Cloud className="w-3.5 h-3.5" />, label: 'Sincronizado', color: 'text-emerald-300 bg-emerald-950/40 border-emerald-500/40' },
    offline: { icon: <CloudOff className="w-3.5 h-3.5" />, label: syncPendingCount > 0 ? `Sin conexión — ${syncPendingCount} pendiente(s)` : 'Sin conexión', color: 'text-amber-300 bg-amber-950/40 border-amber-500/40' },
    error: { icon: <AlertTriangle className="w-3.5 h-3.5" />, label: 'Error de sincronización', color: 'text-rose-300 bg-rose-950/40 border-rose-500/40' },
  };
  const meta = statusMeta[syncStatus] ?? statusMeta.idle;

  return (
    <div className="flex items-center gap-1.5">
      <span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border ${meta.color}`}>
        {meta.icon} {meta.label}
      </span>
      <button type="button" title="Sincronizar ahora" onClick={() => syncAllNow()} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer">
        <RefreshCw className="w-3.5 h-3.5" />
      </button>
      <button type="button" title="Salir de la sincronización" onClick={() => setSyncPin(null)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer">
        <LogOut className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
