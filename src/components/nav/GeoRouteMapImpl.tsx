'use client';

import React from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
import { RoutePoint } from '../../types/efb';

interface GeoRouteMapProps {
  routePoints: RoutePoint[];
  alternatePoints: RoutePoint[];
}

// Colored dot markers matching RouteMap's SVG palette (cyan departure, emerald destination,
// cyan-700 en-route, amber alternate) — avoids Leaflet's default marker-icon.png/shadow
// assets, which Next.js's bundler doesn't resolve correctly without extra webpack config.
function dotIcon(color: string, size: number): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 4px rgba(0,0,0,0.7)"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Fits the view to every plotted point whenever the route changes — react-leaflet has no
// declarative "fit to markers" prop, so this runs imperatively via the map instance.
function FitBounds({ points }: { points: RoutePoint[] }) {
  const map = useMap();
  React.useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lon], 9);
      return;
    }
    map.fitBounds(points.map(p => [p.lat, p.lon] as [number, number]), { padding: [30, 30] });
  }, [points, map]);
  return null;
}

export default function GeoRouteMapImpl({ routePoints, alternatePoints }: GeoRouteMapProps) {
  const allPoints = [...routePoints, ...alternatePoints];
  if (allPoints.length === 0) return null;

  const center: [number, number] = [routePoints[0]?.lat ?? allPoints[0].lat, routePoints[0]?.lon ?? allPoints[0].lon];
  const destination = routePoints[routePoints.length - 1];

  return (
    <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 className="text-xs font-bold text-slate-100 uppercase">Mapa Geográfico</h3>
        <span className="text-[10px] text-slate-500">OpenStreetMap / CARTO — requiere conexión para cargar el mapa</span>
      </div>

      <div className="w-full h-72 sm:h-96 rounded-lg overflow-hidden border border-slate-800">
        <MapContainer center={center} zoom={9} scrollWheelZoom={true} style={{ width: '100%', height: '100%', background: '#090d16' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors &copy; <a href=&quot;https://carto.com/attributions&quot;>CARTO</a>"
          />
          <FitBounds points={allPoints} />

          {routePoints.slice(0, -1).map((p, idx) => {
            const next = routePoints[idx + 1];
            return (
              <Polyline
                key={`leg-${p.id}`}
                positions={[[p.lat, p.lon], [next.lat, next.lon]]}
                pathOptions={{ color: '#06b6d4', weight: 2.5 }}
              />
            );
          })}

          {destination && alternatePoints.map(alt => (
            <Polyline
              key={`alt-line-${alt.id}`}
              positions={[[destination.lat, destination.lon], [alt.lat, alt.lon]]}
              pathOptions={{ color: '#f59e0b', weight: 1.5, dashArray: '6 5' }}
            />
          ))}

          {routePoints.map((p, idx) => {
            const isDest = idx === routePoints.length - 1;
            const isDep = idx === 0;
            const color = isDest ? '#10b981' : isDep ? '#06b6d4' : '#0891b2';
            return (
              <Marker key={p.id} position={[p.lat, p.lon]} icon={dotIcon(color, isDep || isDest ? 14 : 11)}>
                <Tooltip permanent direction="top" offset={[0, -8]} className="!bg-slate-950 !border-slate-700 !text-slate-100 !text-[10px] !font-bold !font-mono">
                  {p.code}
                </Tooltip>
              </Marker>
            );
          })}

          {alternatePoints.map(p => (
            <Marker key={p.id} position={[p.lat, p.lon]} icon={dotIcon('#f59e0b', 12)}>
              <Tooltip permanent direction="top" offset={[0, -8]} className="!bg-slate-950 !border-slate-700 !text-amber-400 !text-[10px] !font-bold !font-mono">
                {p.code}
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="flex items-center justify-center gap-4 text-[10px] pt-1">
        <span className="flex items-center gap-1.5 text-cyan-400"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" /> Salida</span>
        <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Destino</span>
        <span className="flex items-center gap-1.5 text-amber-400"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Alternativa</span>
      </div>
    </div>
  );
}
