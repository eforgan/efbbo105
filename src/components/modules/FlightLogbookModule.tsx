'use client';

import React from 'react';
import { Book, Plus, Download, CheckCircle2, Trash2 } from 'lucide-react';
import { MissionType } from '../../types/efb';
import { useEfbData } from '../../context/EfbDataContext';
import { SyncBadge } from '../SyncBadge';

export const FlightLogbookModule: React.FC = () => {
  const { activeProfile, flightLogs: logs, upsertFlightLog, deleteFlightLog } = useEfbData();
  const [showForm, setShowForm] = React.useState(false);

  // New Form State
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [missionType, setMissionType] = React.useState<MissionType>('hems-neuquen-vista');
  const [departurePoint, setDeparturePoint] = React.useState('SAZN - Neuquén');
  const [destinationPoint, setDestinationPoint] = React.useState('ANL - Añelo');
  const [flightTimeHours, setFlightTimeHours] = React.useState(1.2);
  const [fuelUsedKg, setFuelUsedKg] = React.useState(210);
  const [picName, setPicName] = React.useState('Cap. Juan Pérez (PIC)');
  const [landingsCount, setLandingsCount] = React.useState(1);
  const [notes, setNotes] = React.useState('');

  // Prefill PIC name from the active crew roster profile, if it's flying as PIC today.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from the roster store on mount/change, not a render loop
    if (activeProfile && activeProfile.role === 'PIC' && activeProfile.fullName) setPicName(activeProfile.fullName);
  }, [activeProfile]);

  const totalHours = logs.reduce((sum, l) => sum + l.flightTimeHours, 0).toFixed(1);
  const totalLandings = logs.reduce((sum, l) => sum + l.landingsCount, 0);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    upsertFlightLog({
      id: `log-${Date.now()}`,
      date,
      missionType,
      departurePoint,
      destinationPoint,
      flightTimeHours,
      fuelUsedKg,
      picName,
      landingsCount,
      notes
    });
    setShowForm(false);
    setNotes('');
  };

  const exportCSV = () => {
    const csvField = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const headers = ['Fecha,Mision,Origen,Destino,Horas,Combustible_kg,Aterrizajes,Piloto,Notas'];
    const rows = logs.map(l => `${l.date},${l.missionType},${csvField(l.departurePoint)},${csvField(l.destinationPoint)},${l.flightTimeHours},${l.fuelUsedKg},${l.landingsCount},${csvField(l.picName)},${csvField(l.notes)}`);
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bitacora_vuelo_modena_bo105.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 font-mono">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Book className="w-5 h-5 text-cyan-400" /> Bitácora Digital de Vuelo Modena Air Service (BO105 CBS-4)
          </h2>
          <p className="text-xs text-slate-400">
            Registro Oficial de Horas de Vuelo, Misiones HEMS (Vista, UTV, SAME, YPF) y Firmas del PIC
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer transition"
          >
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold rounded-lg flex items-center gap-1 shadow-lg shadow-cyan-500/20 cursor-pointer transition"
          >
            <Plus className="w-4 h-4" /> Nuevo Vuelo
          </button>
          <SyncBadge />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase">Horas Totales Acumuladas</p>
          <p className="text-2xl font-bold text-cyan-400">{totalHours} <span className="text-xs">hrs</span></p>
          <p className="text-[10px] text-slate-400 mt-1">Regimen Allison 250-C20B OK</p>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase">Aterrizajes Registrados</p>
          <p className="text-2xl font-bold text-emerald-400">{totalLandings} <span className="text-xs">landings</span></p>
          <p className="text-[10px] text-slate-400 mt-1">Helidecks / Pistas / Helipuertos</p>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase">Total Registro Vuelos</p>
          <p className="text-2xl font-bold text-slate-100">{logs.length} <span className="text-xs">misiones</span></p>
          <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verificado por PIC
          </p>
        </div>
      </div>

      {/* Add Log Form */}
      {showForm && (
        <form onSubmit={handleAddLog} className="glass-card p-4 rounded-xl border border-slate-800 space-y-4 font-mono">
          <h3 className="text-xs font-bold text-slate-100 uppercase border-b border-slate-800 pb-2">
            Registrar Nuevo Vuelo HEMS
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Fecha de Vuelo</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Contrato / Misión Modena</label>
              <select
                value={missionType}
                onChange={(e) => setMissionType(e.target.value as MissionType)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
              >
                <option value="hems-neuquen-vista">Neuquén Vaca Muerta (Vista Energy)</option>
                <option value="hems-rosario-utv">Zona Rosario (UTV HEMS)</option>
                <option value="hems-same-ba">Buenos Aires (SAME AÉREO)</option>
                <option value="hems-ypf-vmos">YPF VMOS Offshore Support</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Piloto al Mando (PIC)</label>
              <input
                type="text"
                value={picName}
                onChange={(e) => setPicName(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Origen</label>
              <input
                type="text"
                value={departurePoint}
                onChange={(e) => setDeparturePoint(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Destino</label>
              <input
                type="text"
                value={destinationPoint}
                onChange={(e) => setDestinationPoint(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Horas de Vuelo (hrs)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={flightTimeHours}
                onChange={(e) => setFlightTimeHours(Number(e.target.value))}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Combustible Consumido (kg)</label>
              <input
                type="number"
                step="5"
                value={fuelUsedKg}
                onChange={(e) => setFuelUsedKg(Number(e.target.value))}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Aterrizajes (Landings)</label>
              <input
                type="number"
                min="1"
                value={landingsCount}
                onChange={(e) => setLandingsCount(Number(e.target.value))}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Observaciones / Maniobras</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detalles de la misión..."
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 bg-slate-800 text-slate-400 hover:bg-slate-700 rounded text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded text-xs"
            >
              Guardar en Bitácora
            </button>
          </div>
        </form>
      )}

      {/* Log Entries Table */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-4 font-mono">
        <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-2">
          Histórico de Registro de Vuelos
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Misión / Contrato</th>
                <th className="p-3">Tramo (Origen ➔ Destino)</th>
                <th className="p-3">Horas</th>
                <th className="p-3">Fuel</th>
                <th className="p-3">Landings</th>
                <th className="p-3">PIC</th>
                <th className="p-3">Observaciones</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-slate-100">{log.date}</td>
                  <td className="p-3">
                    <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                      {log.missionType.replace('hems-', '')}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-slate-300">
                    {log.departurePoint} ➔ {log.destinationPoint}
                  </td>
                  <td className="p-3 font-bold text-cyan-400">{log.flightTimeHours} hrs</td>
                  <td className="p-3 text-amber-400">{log.fuelUsedKg} kg</td>
                  <td className="p-3 text-emerald-400 font-bold">{log.landingsCount}</td>
                  <td className="p-3 text-slate-400 text-[10px]">{log.picName}</td>
                  <td className="p-3 text-slate-400 text-[10px]">{log.notes || '-'}</td>
                  <td className="p-3">
                    <button onClick={() => deleteFlightLog(log.id)} className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer" title="Eliminar registro">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
