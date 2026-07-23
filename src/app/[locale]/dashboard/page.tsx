'use client';
import { useAuth } from '@/context/AuthContext';
import { useProgress } from '@/context/ProgressContext';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { generateCertificatePdf, generateCertificateId } from '@/lib/certificate';
import { Award, BookOpen, Activity, Anchor, Download, CheckCircle2 } from 'lucide-react';
import Leaderboard from '@/components/Leaderboard';
import Logbook from '@/components/Logbook';
import Badges from '@/components/Badges';
import Link from 'next/link';

import { useTranslations } from 'next-intl';
import { REQUIRED_OFFSHORE_MODULE_IDS } from '@/data/offshoreModules';

export default function DashboardPage() {
  const { user } = useAuth();
  const { completedModules, completedOffshoreModules } = useProgress();
  const [examData, setExamData] = useState<any>(null);
  const [profile, setProfile] = useState<{ name?: string; licenseType?: string; licenseNumber?: string }>({});
  const [loading, setLoading] = useState(true);
  const t = useTranslations('Dashboard');

  const isOffshoreCompleted = REQUIRED_OFFSHORE_MODULE_IDS.every(id => completedOffshoreModules.includes(id));

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchExam = async () => {
      try {
        if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.includes('DummyKey')) {
          setLoading(false);
          return;
        }

        if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY && db) {
          const docRef = doc(db, 'userExams', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setExamData(docSnap.data());
          }

          const profileSnap = await getDoc(doc(db, 'users', user.uid));
          if (profileSnap.exists()) {
            setProfile(profileSnap.data());
          }
        }
      } catch (error) {
        console.error("Error fetching exam", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [user]);

  const generateStandardCertificate = async () => {
    const name = profile.name || user?.displayName || user?.email?.split('@')[0] || "Piloto";
    const percentage = examData ? Math.round((examData.lastScore / examData.totalQuestions) * 100) : 100;
    const dateStr = examData?.timestamp ? new Date(examData.timestamp).toLocaleDateString('es-AR') : new Date().toLocaleDateString('es-AR');

    await generateCertificatePdf({
      pilotName: name,
      licenseType: profile.licenseType,
      licenseNumber: profile.licenseNumber,
      courseTitle: 'ENTRENAMIENTO TEÓRICO BO105 CBS4',
      achievementLine: `Aprobando el examen final con un puntaje de ${percentage}%`,
      dateStr,
      certificateId: generateCertificateId('BO105'),
      fileNameBase: 'Certificado_BO105',
    });
  };

  const generateOffshoreCertificate = async () => {
    const name = profile.name || user?.displayName || user?.email?.split('@')[0] || "Piloto";

    await generateCertificatePdf({
      pilotName: name,
      licenseType: profile.licenseType,
      licenseNumber: profile.licenseNumber,
      courseTitle: 'CURSO DE OPERACIÓN HEMS EN ENTORNO OFFSHORE — BO105 CBS4',
      achievementLine: 'Operaciones de corta distancia (< 8 km de costa) — Módulos teóricos aprobados (100%)',
      dateStr: new Date().toLocaleDateString('es-AR'),
      certificateId: generateCertificateId('OFFSHORE'),
      footerNote: 'El módulo práctico (OF7) y la evaluación PCR en vuelo se certifican por separado por un instructor habilitado.',
      fileNameBase: 'Certificado_Offshore_BO105',
    });
  };

  if (loading) return <div className="p-8">Cargando...</div>;

  if (!user) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center mt-12">
        <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">{t('title')}</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">Debes iniciar sesión para ver tu bitácora, progreso y certificados.</p>
          <Link href="/login" className="inline-block bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors">
            Ir a Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  const name = profile.name || user.displayName || user.email?.split('@')[0] || "Piloto";
  const availableCertificatesCount = (examData?.passed ? 1 : 0) + (isOffshoreCompleted ? 1 : 0);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 border-b border-slate-200 dark:border-slate-700 pb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{t('title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Bienvenido, {name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-xl flex items-center justify-center mb-4">
            <BookOpen size={24} />
          </div>
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t('modules_completed')}</h3>
          <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">{completedModules.length} / 7</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-4">
            <Award size={24} />
          </div>
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t('exam_score')}</h3>
          <p className="text-2xl font-bold text-slate-800 dark:text-white mt-2">
            {examData ? (examData.passed ? 'Aprobado' : 'Reprobado') : t('not_taken')}
          </p>
          {examData && (
            <p className="text-xs text-slate-500 mt-1">Puntaje: {examData.lastScore} / {examData.totalQuestions}</p>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center mb-4">
            <Anchor size={24} />
          </div>
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Curso HEMS Offshore</h3>
          <p className="text-2xl font-bold text-slate-800 dark:text-white mt-2">
            {completedOffshoreModules.length} / {REQUIRED_OFFSHORE_MODULE_IDS.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {isOffshoreCompleted ? 'Completado (100%)' : 'En Progreso'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-4">
            <Activity size={24} />
          </div>
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Certificados</h3>
          <p className="text-2xl font-bold text-slate-800 dark:text-white mt-2">
            {availableCertificatesCount > 0 ? `${availableCertificatesCount} Disponible(s)` : 'En Proceso'}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Tus Certificados</h2>
        
        {availableCertificatesCount === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
            <Award className="mx-auto text-slate-400 dark:text-slate-600 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">No hay certificados disponibles</h3>
            <p className="text-slate-500 dark:text-slate-500 max-w-md mx-auto">
              Debes completar los módulos y aprobar los cuestionarios o exámenes de cada programa para obtener tu certificado.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {isOffshoreCompleted && (
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-emerald-50/60 dark:bg-emerald-950/20 p-6 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Award size={32} />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 mb-1">
                      <CheckCircle2 size={12} /> COMPLETADO & HABILITADO
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                      Certificado Curso de Operación HEMS en Entorno Offshore — BO105 CBS4
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                      Capacitación teórica completa para operaciones de corta distancia (&lt; 8 km de costa).
                    </p>
                  </div>
                </div>
                <button 
                  onClick={generateOffshoreCertificate}
                  className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors whitespace-nowrap shrink-0 flex items-center justify-center gap-2"
                >
                  <Download size={18} /> Descargar PDF
                </button>
              </div>
            )}

            {examData?.passed && (
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-sky-50/60 dark:bg-sky-950/20 p-6 rounded-xl border border-sky-200 dark:border-sky-800/60">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 shrink-0">
                    <Award size={32} />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 mb-1">
                      <CheckCircle2 size={12} /> COMPLETADO & HABILITADO
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                      Certificado Curso Teórico BO105 CBS4 (Estándar)
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                      Otorgado el {new Date(examData.timestamp).toLocaleDateString('es-AR')} — Puntaje: {examData.lastScore}/{examData.totalQuestions} ({Math.round((examData.lastScore / examData.totalQuestions) * 100)}%)
                    </p>
                  </div>
                </div>
                <button 
                  onClick={generateStandardCertificate}
                  className="w-full md:w-auto bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors whitespace-nowrap shrink-0 flex items-center justify-center gap-2"
                >
                  <Download size={18} /> Descargar PDF
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <Badges />
      <Logbook />
      <Leaderboard />
    </div>
  );
}

