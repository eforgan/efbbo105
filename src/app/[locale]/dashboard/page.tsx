'use client';
import { useAuth } from '@/context/AuthContext';
import { useProgress } from '@/context/ProgressContext';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { generateCertificatePdf, generateCertificateId } from '@/lib/certificate';
import { Award, BookOpen, Activity } from 'lucide-react';
import Leaderboard from '@/components/Leaderboard';
import Logbook from '@/components/Logbook';
import Badges from '@/components/Badges';
import Link from 'next/link';

import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const { user } = useAuth();
  const { completedModules } = useProgress();
  const [examData, setExamData] = useState<any>(null);
  const [profile, setProfile] = useState<{ name?: string; licenseType?: string; licenseNumber?: string }>({});
  const [loading, setLoading] = useState(true);
  const t = useTranslations('Dashboard');

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

  const generateCertificate = async () => {
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

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 border-b border-slate-200 dark:border-slate-700 pb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{t('title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Bienvenido, {name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
          <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
            {examData ? (examData.passed ? 'Aprobado' : 'Reprobado') : t('not_taken')}
          </p>
          {examData && (
            <p className="text-sm text-slate-500 mt-1">Puntaje: {examData.lastScore} / {examData.totalQuestions}</p>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-4">
            <Activity size={24} />
          </div>
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Estado General</h3>
          <p className="text-xl font-bold text-slate-800 dark:text-white mt-2">
            {completedModules.length === 7 && examData?.passed ? 'Certificado' : 'En Entrenamiento'}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Tus Certificados</h2>
        {examData?.passed ? (
          <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Certificado Curso BO105 CBS4</h3>
              <p className="text-slate-600 dark:text-slate-400">Otorgado el {new Date(examData.timestamp).toLocaleDateString('es-AR')}</p>
            </div>
            <button 
              onClick={generateCertificate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors"
            >
              Descargar PDF
            </button>
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
            <Award className="mx-auto text-slate-400 dark:text-slate-600 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">No hay certificados disponibles</h3>
            <p className="text-slate-500 dark:text-slate-500">Debes completar todos los módulos y aprobar el examen final para obtener tu certificado.</p>
          </div>
        )}
      </div>

      <Badges />
      <Logbook />
      <Leaderboard />
    </div>
  );
}
