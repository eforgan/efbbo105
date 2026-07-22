"use client";

import { useState } from 'react';
import { CheckCircle2, XCircle, ClipboardCheck, Mic, MicOff } from 'lucide-react';
import { offshorePcrManeuvers } from '@/data/offshorePcr';
import { useProgress, PCRResult } from '@/context/ProgressContext';
import { useSTT } from '@/hooks/useSTT';

type Grade = 'satisfactory' | 'unsatisfactory' | null;

export default function PCRChecklist() {
  const { pcrResults, recordPcrResult } = useProgress();
  const [grades, setGrades] = useState<Record<string, Grade>>(() => {
    const initial: Record<string, Grade> = {};
    offshorePcrManeuvers.forEach(m => {
      const existing = pcrResults.find(r => r.id === m.id);
      initial[m.id] = existing ? existing.result : null;
    });
    return initial;
  });
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    offshorePcrManeuvers.forEach(m => {
      const existing = pcrResults.find(r => r.id === m.id);
      initial[m.id] = existing?.notes || '';
    });
    return initial;
  });
  const [saved, setSaved] = useState(false);
  const { isListening, activeId, error: sttError, isSupported: sttSupported, startListening, stopListening } = useSTT();

  const toggleDictation = (id: string) => {
    if (isListening && activeId === id) {
      stopListening();
      return;
    }
    startListening(id, (transcript) => {
      setNotes(prev => ({
        ...prev,
        [id]: prev[id] ? `${prev[id]} ${transcript}` : transcript
      }));
      setSaved(false);
    });
  };

  const setGrade = (id: string, grade: Grade) => {
    setGrades(prev => ({ ...prev, [id]: grade }));
    setSaved(false);
  };

  const setNote = (id: string, note: string) => {
    setNotes(prev => ({ ...prev, [id]: note }));
    setSaved(false);
  };

  const handleSave = () => {
    offshorePcrManeuvers.forEach(m => {
      const grade = grades[m.id];
      if (!grade) return;
      const result: PCRResult = {
        id: m.id,
        result: grade,
        notes: notes[m.id] || undefined,
        timestamp: Date.now(),
      };
      recordPcrResult(result);
    });
    setSaved(true);
  };

  const gradedCount = Object.values(grades).filter(Boolean).length;
  const allSatisfactory = offshorePcrManeuvers.every(m => grades[m.id] === 'satisfactory');
  const allGraded = gradedCount === offshorePcrManeuvers.length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-4xl mx-auto overflow-hidden">
      <div className="bg-slate-900 text-white p-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardCheck className="text-sky-400" /> Tarjeta de Evaluación en Vuelo (PCR)
        </h2>
        <p className="text-slate-400 mt-1 text-sm">
          Proficiency Check Ride — Offshore Corta Distancia BO105 CBS4. Para uso del instructor durante el vuelo práctico real.
        </p>
        {!sttSupported && (
          <p className="mt-2 text-xs text-slate-400">
            El dictado por voz no está disponible en este navegador. Use Chrome o Edge para dictar observaciones, o escríbalas manualmente.
          </p>
        )}
        {sttError && (
          <p className="mt-2 text-xs text-amber-400">
            No se pudo acceder al micrófono ({sttError}). Verifique los permisos del navegador e inténtelo de nuevo.
          </p>
        )}
      </div>

      <div className="p-6 space-y-4">
        {offshorePcrManeuvers.map((m, idx) => {
          const grade = grades[m.id];
          return (
            <div key={m.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wide">
                    Maniobra {idx + 1}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{m.maneuver}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{m.standard}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setGrade(m.id, 'satisfactory')}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold border transition-colors ${
                      grade === 'satisfactory'
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-green-400'
                    }`}
                  >
                    <CheckCircle2 size={16} /> S
                  </button>
                  <button
                    onClick={() => setGrade(m.id, 'unsatisfactory')}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold border transition-colors ${
                      grade === 'unsatisfactory'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-red-400'
                    }`}
                  >
                    <XCircle size={16} /> NS
                  </button>
                </div>
              </div>
              <div className="relative mt-3">
                <textarea
                  value={notes[m.id] || ''}
                  onChange={(e) => setNote(m.id, e.target.value)}
                  placeholder="Observaciones del instructor..."
                  className="w-full text-sm p-2 pr-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                  rows={2}
                />
                {sttSupported && (
                  <button
                    type="button"
                    onClick={() => toggleDictation(m.id)}
                    disabled={isListening && activeId !== m.id}
                    title={isListening && activeId === m.id ? 'Detener dictado' : 'Dictar observación por voz'}
                    className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors ${
                      isListening && activeId === m.id
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                  >
                    {isListening && activeId === m.id ? <Mic size={14} /> : <MicOff size={14} />}
                  </button>
                )}
              </div>
              {isListening && activeId === m.id && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" /> Escuchando... hable para dictar la observación.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {gradedCount} / {offshorePcrManeuvers.length} maniobras calificadas
          {allGraded && (
            <span className={`ml-2 font-bold ${allSatisfactory ? 'text-green-600' : 'text-red-600'}`}>
              — {allSatisfactory ? 'APROBADO' : 'NO APROBADO'}
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={gradedCount === 0}
          className="px-6 py-3 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
        >
          {saved ? 'Evaluación Guardada ✓' : 'Guardar Evaluación'}
        </button>
      </div>
    </div>
  );
}
