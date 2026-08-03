'use client';

import dynamic from 'next/dynamic';

// Leaflet touches `window`/DOM APIs at module load time, so the real implementation (and its
// own imports of 'leaflet'/'react-leaflet') must never run during SSR — ssr:false defers
// loading the whole module to the browser, after mount.
const GeoRouteMap = dynamic(() => import('./GeoRouteMapImpl'), {
  ssr: false,
  loading: () => (
    <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
      <h3 className="text-xs font-bold text-slate-100 uppercase border-b border-slate-800 pb-2">Mapa Geográfico</h3>
      <div className="w-full h-72 sm:h-96 rounded-lg border border-slate-800 flex items-center justify-center text-slate-500">
        Cargando mapa…
      </div>
    </div>
  ),
});

export { GeoRouteMap };
