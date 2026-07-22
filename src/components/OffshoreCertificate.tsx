'use client';
import { useState, useEffect } from 'react';
import { Award, Lock, CheckCircle2, Circle } from 'lucide-react';
import { useProgress } from '@/context/ProgressContext';
import { offshoreModules, REQUIRED_OFFSHORE_MODULE_IDS } from '@/data/offshoreModules';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc as firestoreDoc, getDoc } from 'firebase/firestore';
import { generateCertificatePdf, generateCertificateId } from '@/lib/certificate';

const REQUIRED_MODULES = REQUIRED_OFFSHORE_MODULE_IDS;

const MODULE_TITLES: Record<number, string> = Object.fromEntries(
  offshoreModules.filter(m => m.required).map(m => [m.id, `OF${m.id} — ${m.title}`])
);

export default function OffshoreCertificate() {
  const { completedOffshoreModules } = useProgress();
  const { user } = useAuth();
  const [pilotName, setPilotName] = useState('');
  const [licenseType, setLicenseType] = useState<string | undefined>(undefined);
  const [licenseNumber, setLicenseNumber] = useState<string | undefined>(undefined);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!user || !db) return;
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('DummyKey')) return;
    getDoc(firestoreDoc(db, 'users', user.uid)).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.name) setPilotName(data.name);
        if (data.licenseType) setLicenseType(data.licenseType);
        if (data.licenseNumber) setLicenseNumber(data.licenseNumber);
      }
    }).catch(console.error);
  }, [user]);

  const completedRequired = REQUIRED_MODULES.filter(id => completedOffshoreModules.includes(id));
  const allCompleted = completedRequired.length === REQUIRED_MODULES.length;

  const generateCertificate = async () => {
    if (!pilotName.trim()) {
      alert('Por favor, ingresa tu nombre completo para el certificado.');
      return;
    }
    setGenerating(true);

    await generateCertificatePdf({
      pilotName,
      licenseType,
      licenseNumber,
      courseTitle: 'CURSO DE OPERACIÓN HEMS EN ENTORNO OFFSHORE — BO105 CBS4',
      achievementLine: 'Operaciones de corta distancia (< 8 km de costa) — 7 módulos teóricos aprobados (100%)',
      dateStr: new Date().toLocaleDateString('es-AR'),
      certificateId: generateCertificateId('OFFSHORE'),
      footerNote: 'El módulo práctico (OF7) y la evaluación PCR en vuelo se certifican por separado por un instructor habilitado.',
      fileNameBase: 'Certificado_Offshore_BO105',
    });
    setGenerating(false);

    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'eforgan@gruppomodena.com',
        subject: `Curso Offshore HEMS Aprobado - ${pilotName}`,
        html: `<p>El cursante <strong>${pilotName}</strong> ha completado y aprobado los 7 módulos teóricos del Curso de Operación HEMS en Entorno Offshore (BO105 CBS4).</p>`
      })
    }).catch(console.error);
  };

  if (!allCompleted) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400">
            <Lock size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Certificado de Curso de Operación HEMS en Entorno Offshore</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Se desbloquea al aprobar los cuestionarios de los 7 módulos teóricos ({completedRequired.length} / {REQUIRED_MODULES.length} completados).
            </p>
          </div>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {REQUIRED_MODULES.map(id => {
            const done = completedOffshoreModules.includes(id);
            return (
              <li key={id} className={`flex items-center gap-2 ${done ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                {done ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                {MODULE_TITLES[id]}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-emerald-200 dark:border-emerald-800 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
          <Award size={22} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">¡Curso Teórico Offshore Completado!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Generá tu Certificado de Curso de Operación HEMS en Entorno Offshore.</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Ingresa tu nombre completo"
          value={pilotName}
          onChange={(e) => setPilotName(e.target.value)}
          className="flex-1 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 outline-none"
        />
        <button
          onClick={generateCertificate}
          disabled={!pilotName.trim() || generating}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {generating ? 'Generando...' : 'Descargar Certificado PDF'}
        </button>
      </div>
      {licenseType && licenseNumber && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Se incluirá en el certificado: Lic. {licenseType} N° {licenseNumber}
        </p>
      )}
    </div>
  );
}
