'use client';

import React from 'react';
import { RoutePoint } from '../../types/efb';

interface RouteMapProps {
  routePoints: RoutePoint[];
  alternatePoints: RoutePoint[];
}

const WIDTH = 460;
const HEIGHT = 320;
const PADDING = 36;

export const RouteMap: React.FC<RouteMapProps> = ({ routePoints, alternatePoints }) => {
  const allPoints = [...routePoints, ...alternatePoints];
  if (allPoints.length === 0) return null;

  const lats = allPoints.map(p => p.lat);
  const lons = allPoints.map(p => p.lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  // Guard against a degenerate (single-point or perfectly aligned) bounding box.
  const latSpan = Math.max(maxLat - minLat, 0.01);
  const lonSpan = Math.max(maxLon - minLon, 0.01);

  const toX = (lon: number) => PADDING + ((lon - minLon) / lonSpan) * (WIDTH - PADDING * 2);
  const toY = (lat: number) => PADDING + ((maxLat - lat) / latSpan) * (HEIGHT - PADDING * 2);

  const destination = routePoints[routePoints.length - 1];

  return (
    <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
      <h3 className="text-xs font-bold text-slate-100 uppercase border-b border-slate-800 pb-2">Mapa de Ruta</h3>
      <div className="relative w-full overflow-hidden flex justify-center">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full max-w-xl h-auto">
          <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="#090d16" rx="8" />

          {/* Main route legs */}
          {routePoints.slice(0, -1).map((p, idx) => {
            const next = routePoints[idx + 1];
            return (
              <line
                key={`leg-${p.id}`}
                x1={toX(p.lon)} y1={toY(p.lat)} x2={toX(next.lon)} y2={toY(next.lat)}
                stroke="#06b6d4" strokeWidth="2"
              />
            );
          })}

          {/* Alternate spokes from destination */}
          {destination && alternatePoints.map(alt => (
            <line
              key={`alt-${alt.id}`}
              x1={toX(destination.lon)} y1={toY(destination.lat)} x2={toX(alt.lon)} y2={toY(alt.lat)}
              stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3"
            />
          ))}

          {/* Route waypoints */}
          {routePoints.map((p, idx) => {
            const isDest = idx === routePoints.length - 1;
            const isDep = idx === 0;
            return (
              <g key={p.id}>
                <circle cx={toX(p.lon)} cy={toY(p.lat)} r={isDep || isDest ? 6 : 4.5} fill={isDest ? '#10b981' : isDep ? '#06b6d4' : '#0891b2'} stroke="#ffffff" strokeWidth="1.5" />
                <text x={toX(p.lon) + 8} y={toY(p.lat) - 6} fill="#e2e8f0" fontSize="10" fontWeight="bold">{p.code}</text>
              </g>
            );
          })}

          {/* Alternates */}
          {alternatePoints.map(p => (
            <g key={p.id}>
              <circle cx={toX(p.lon)} cy={toY(p.lat)} r={5} fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
              <text x={toX(p.lon) + 8} y={toY(p.lat) - 6} fill="#fbbf24" fontSize="10" fontWeight="bold">{p.code}</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="flex items-center justify-center gap-4 text-[10px] pt-1">
        <span className="flex items-center gap-1.5 text-cyan-400"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" /> Salida</span>
        <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Destino</span>
        <span className="flex items-center gap-1.5 text-amber-400"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Alternativa</span>
      </div>
    </div>
  );
};
