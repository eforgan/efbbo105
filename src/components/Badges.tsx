'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, getDoc, Firestore } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { useProgress } from '@/context/ProgressContext';
import { Medal, Star, Shield, Trophy, Target } from 'lucide-react';

export default function Badges() {
  const { user } = useAuth();
  const { completedModules } = useProgress();
  const [logHours, setLogHours] = useState(0);
  const [examPassed, setExamPassed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.includes('DummyKey')) {
          setLoading(false);
          return;
        }

        // Fetch Logbook hours
        const qLogs = query(collection(db as Firestore, 'logbooks'), where('uid', '==', user.uid));
        const snapLogs = await getDocs(qLogs);
        let totalHours = 0;
        snapLogs.forEach(doc => {
          totalHours += doc.data().duration || 0;
        });
        setLogHours(totalHours);

        // Fetch Exam status
        const docRef = doc(db as Firestore, 'userExams', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setExamPassed(docSnap.data().passed === true);
        }
      } catch (error) {
        console.error("Error fetching stats for badges", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (!user || loading) return null;

  const badges = [
    {
      id: 'first_flight',
      title: 'Primer Vuelo',
      description: 'Registraste al menos 1 hora de vuelo en la bitácora.',
      icon: Star,
      achieved: logHours >= 1,
      color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800'
    },
    {
      id: 'veteran',
      title: 'Veterano',
      description: 'Alcanzaste 50 horas registradas en el BO105.',
      icon: Shield,
      achieved: logHours >= 50,
      color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
    },
    {
      id: 'scholar',
      title: 'Erudito Teórico',
      description: 'Completaste los 7 módulos de estudio.',
      icon: Target,
      achieved: completedModules.length >= 7,
      color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    },
    {
      id: 'certified',
      title: 'Piloto Certificado',
      description: 'Aprobaste el examen final del BO105.',
      icon: Trophy,
      achieved: examPassed,
      color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200 dark:border-sky-800'
    }
  ];

  const achievedCount = badges.filter(b => b.achieved).length;

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Medal className="text-rose-500" size={28} />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Logros y Medallas</h2>
        </div>
        <div className="bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
          <span className="font-bold text-slate-800 dark:text-white">{achievedCount}</span>
          <span className="text-slate-500 dark:text-slate-400"> / {badges.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {badges.map(badge => {
          const Icon = badge.icon;
          return (
            <div 
              key={badge.id}
              className={`p-6 rounded-xl border-2 transition-all ${
                badge.achieved 
                  ? badge.color
                  : 'bg-slate-50 text-slate-400 dark:bg-slate-900/50 dark:text-slate-600 border-slate-100 dark:border-slate-800 opacity-60 grayscale'
              }`}
            >
              <div className="flex justify-center mb-4">
                <div className={`p-4 rounded-full ${badge.achieved ? 'bg-white/50 dark:bg-black/20 shadow-sm' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  <Icon size={32} />
                </div>
              </div>
              <h3 className="text-center font-bold text-lg mb-2">{badge.title}</h3>
              <p className="text-center text-sm leading-tight opacity-90">{badge.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
