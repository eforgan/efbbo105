'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, Firestore } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { Book, Plus, Download } from 'lucide-react';

type LogEntry = {
  id: string;
  date: string;
  type: string; // 'Simulador' | 'Vuelo Real'
  duration: number; // in hours
  notes: string;
  timestamp: string;
};

export default function Logbook() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('Simulador');
  const [duration, setDuration] = useState('1.0');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!user || !db) {
      setLoading(false);
      return;
    }

    const fetchLogs = async () => {
      if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.includes('DummyKey')) {
        setLoading(false);
        return;
      }
      
      if (!db) return;
      try {
        const q = query(collection(db as Firestore, 'logbooks'), where('uid', '==', user.uid), orderBy('date', 'desc'));
        const snap = await getDocs(q);
        const entries: LogEntry[] = [];
        snap.forEach(doc => {
          entries.push({ id: doc.id, ...doc.data() } as LogEntry);
        });
        setLogs(entries);
      } catch (error) {
        console.error("Error fetching logs", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;

    try {
      const newLog = {
        uid: user.uid,
        date,
        type,
        duration: parseFloat(duration),
        notes,
        timestamp: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db as Firestore, 'logbooks'), newLog);
      setLogs([{ id: docRef.id, ...newLog }, ...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setShowForm(false);
      setNotes('');
    } catch (error) {
      console.error("Error saving log", error);
    }
  };

  const exportCSV = () => {
    const headers = ['Fecha,Tipo,Duracion(hrs),Notas'];
    const rows = logs.map(l => `${l.date},${l.type},${l.duration},"${l.notes.replace(/"/g, '""')}"`);
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bitacora_bo105.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (!user) return null;

  const totalHours = logs.reduce((acc, log) => acc + log.duration, 0).toFixed(1);

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Book className="text-emerald-500" size={28} />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Bitácora de Vuelo</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-slate-600 dark:text-slate-300 transition-colors" title="Exportar CSV">
            <Download size={20} />
          </button>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors">
            <Plus size={18} /> Nuevo Vuelo
          </button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <span className="text-slate-600 dark:text-slate-400 font-medium">Total de horas registradas:</span>
        <span className="text-2xl font-black text-slate-800 dark:text-white">{totalHours} hrs</span>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Fecha</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Tipo</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                <option>Simulador</option>
                <option>Vuelo Real</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Duración (hrs)</label>
              <input type="number" step="0.1" min="0.1" value={duration} onChange={e => setDuration(e.target.value)} required className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Observaciones / Maniobras</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ej: Autorrotaciones, Vuelo nocturno..." className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded-lg font-bold">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold">Guardar Entrada</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="animate-pulse bg-slate-100 dark:bg-slate-700 h-32 rounded-xl"></div>
      ) : logs.length === 0 ? (
        <div className="text-center p-8 text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          No tienes vuelos registrados aún. ¡Añade tu primer vuelo!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="p-3">Fecha</th>
                <th className="p-3">Tipo</th>
                <th className="p-3 text-center">Horas</th>
                <th className="p-3">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 text-slate-800 dark:text-slate-200 font-medium">{log.date}</td>
                  <td className="p-3">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${log.type === 'Vuelo Real' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="p-3 text-center font-mono text-sky-600 dark:text-sky-400 font-bold">{log.duration.toFixed(1)}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400 text-sm">{log.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
