'use client';

import React from 'react';
import { Phone, Mail, Search, Radio, Fuel, ShieldAlert, AlertTriangle, Clock, CloudSun } from 'lucide-react';
import { OFFICIAL_CONTACTS, METEOROLOGICAL_STATIONS, USEFUL_PHONE_NUMBERS, YPF_AEROPLANTAS, MISSION_ICAO_CODES } from '../../data/aviationContacts';
import { telHref } from '../../lib/telHref';

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  'ais-aro': <Radio className="w-4 h-4" />,
  notam: <Radio className="w-4 h-4" />,
  meteorologia: <Radio className="w-4 h-4" />,
  anac: <ShieldAlert className="w-4 h-4" />,
  maritimo: <ShieldAlert className="w-4 h-4" />,
};

export const ContactsDirectoryModule: React.FC = () => {
  const [query, setQuery] = React.useState('');

  const q = query.trim().toLowerCase();
  const matches = (...fields: (string | undefined)[]) =>
    q === '' || fields.some(f => f?.toLowerCase().includes(q));

  const filteredOfficial = OFFICIAL_CONTACTS.filter(c => matches(c.name, c.phone, c.email, c.notes));
  const filteredMeteo = METEOROLOGICAL_STATIONS.filter(c => matches(c.name, c.phone, c.email, c.notes));
  const filteredUseful = USEFUL_PHONE_NUMBERS.filter(c => matches(c.label, c.phone, c.notes));
  const filteredAeroplantas = YPF_AEROPLANTAS.filter(a => matches(a.icao, a.iata, a.name, a.province, a.phone));

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto font-sans">
      <div className="glass-panel p-4 rounded-xl border border-slate-800 font-mono">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Phone className="w-5 h-5 text-cyan-400" /> Directorio de Contactos & Combustible
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Oficinas ARO-AIS/NOTAM/SAR, teléfonos de emergencia y aeroplantas YPF (Jet A-1) a nivel nacional.
        </p>
      </div>

      <div className="p-2.5 rounded-lg border border-amber-500/40 bg-amber-950/40 text-amber-300 text-xs flex items-start gap-2 font-mono">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          Datos de referencia relevados de fuentes públicas (AIP Argentina / ais.anac.gob.ar, argentina.gob.ar/prefecturanaval,
          listados públicos de aeroplantas YPF). Verificar contra AIP/NOTAM vigente antes de una escala de reabastecimiento u
          operación real — no reemplaza el despacho oficial ni el juicio operativo del PIC.
        </span>
      </div>

      <div className="glass-card p-3 rounded-xl border border-slate-800 flex items-center gap-2 font-mono">
        <Search className="w-4 h-4 text-cyan-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por ICAO, nombre, ciudad, provincia o teléfono..."
          className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Contactos Oficiales */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 font-mono">
        <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" /> Contactos Oficiales ANAC / EANA / Prefectura
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredOfficial.map(c => (
            <div key={c.id} className="glass-card p-3 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                {CATEGORY_ICON[c.category]} {c.name}
              </div>
              <div className="mt-2 space-y-1 text-xs text-slate-300">
                {c.phone && (
                  <a href={telHref(c.phone)} className="flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 w-fit">
                    <Phone className="w-3.5 h-3.5" /> {c.phone}
                  </a>
                )}
                {c.phoneAlt && <div className="text-slate-500 pl-5">{c.phoneAlt}</div>}
                {c.email && (
                  <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200 w-fit">
                    <Mail className="w-3.5 h-3.5" /> {c.email}
                  </a>
                )}
                {c.hours && (
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5" /> {c.hours}
                  </div>
                )}
                {c.notes && <p className="text-slate-500 pt-1">{c.notes}</p>}
                <p className="text-[10px] text-slate-600 pt-1">Fuente: {c.source}</p>
              </div>
            </div>
          ))}
          {filteredOfficial.length === 0 && <p className="text-xs text-slate-500 col-span-2">Sin resultados.</p>}
        </div>
      </div>

      {/* Estaciones Meteorológicas SMN */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 font-mono">
        <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
          <CloudSun className="w-4 h-4 text-cyan-400" /> Estaciones Meteorológicas (SMN — OMA/OIM)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredMeteo.map(c => (
            <div key={c.id} className="glass-card p-3 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                <CloudSun className="w-4 h-4" /> {c.name}
              </div>
              <div className="mt-2 space-y-1 text-xs text-slate-300">
                {c.phone && (
                  <a href={telHref(c.phone)} className="flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 w-fit">
                    <Phone className="w-3.5 h-3.5" /> {c.phone}
                  </a>
                )}
                {c.phoneAlt && <div className="text-slate-500 pl-5">{c.phoneAlt}</div>}
                {c.email && (
                  <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200 w-fit">
                    <Mail className="w-3.5 h-3.5" /> {c.email}
                  </a>
                )}
                {c.notes && <p className="text-slate-500 pt-1">{c.notes}</p>}
                <p className="text-[10px] text-slate-600 pt-1">Fuente: {c.source}</p>
              </div>
            </div>
          ))}
          {filteredMeteo.length === 0 && <p className="text-xs text-slate-500 col-span-2">Sin resultados.</p>}
        </div>
      </div>

      {/* Teléfonos Útiles */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 font-mono">
        <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
          <Phone className="w-4 h-4 text-cyan-400" /> Teléfonos Útiles (Emergencia)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filteredUseful.map(c => (
            <a
              key={c.id}
              href={telHref(c.phone)}
              className="glass-card p-3 rounded-lg border border-slate-800 hover:border-emerald-500/50 transition flex flex-col gap-1"
            >
              <span className="text-emerald-300 font-bold text-sm flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> {c.phone}
              </span>
              <span className="text-xs text-slate-300">{c.label}</span>
              {c.notes && <span className="text-[10px] text-slate-500">{c.notes}</span>}
            </a>
          ))}
          {filteredUseful.length === 0 && <p className="text-xs text-slate-500 col-span-3">Sin resultados.</p>}
        </div>
      </div>

      {/* Aeroplantas YPF */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 font-mono">
        <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
          <Fuel className="w-4 h-4 text-cyan-400" /> Aeroplantas YPF — Combustible de Aviación (Jet A-1)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[640px]">
            <thead>
              <tr className="text-slate-500 text-left border-b border-slate-800">
                <th className="py-1.5 pr-2">ICAO</th>
                <th className="py-1.5 pr-2">IATA</th>
                <th className="py-1.5 pr-2">Aeródromo</th>
                <th className="py-1.5 pr-2">Provincia</th>
                <th className="py-1.5 pr-2">Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {filteredAeroplantas.map(a => (
                <tr key={a.icao} className="border-b border-slate-900 hover:bg-slate-900/50">
                  <td className="py-1.5 pr-2 text-cyan-300 font-bold">
                    {a.icao}
                    {MISSION_ICAO_CODES.has(a.icao) && (
                      <span className="ml-1.5 text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded font-bold">
                        RUTA MODENA
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 pr-2 text-slate-400">{a.iata}</td>
                  <td className="py-1.5 pr-2 text-slate-200">{a.name}</td>
                  <td className="py-1.5 pr-2 text-slate-400">{a.province}</td>
                  <td className="py-1.5 pr-2">
                    <a href={telHref(a.phone)} className="flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 w-fit">
                      <Phone className="w-3.5 h-3.5" /> {a.phone}
                    </a>
                  </td>
                </tr>
              ))}
              {filteredAeroplantas.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-3 text-center text-slate-500">Sin resultados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
