'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ShieldAlert, Users, Award, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const ADMIN_EMAILS = ['eforgan@gruppomodena.com', 'admin@bo105.com', 'piloto@test.com'];

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [usersData, setUsersData] = useState<any[]>([]);
  const [examsData, setExamsData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const t = useTranslations('Admin');

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('DummyKey') || !db) return;

        // Fetch users
        const uSnap = await getDocs(collection(db, 'users'));
        const users: any[] = [];
        uSnap.forEach(doc => {
          users.push({ id: doc.id, ...doc.data() });
        });

        // Fetch exams
        const eSnap = await getDocs(collection(db, 'userExams'));
        const exams: Record<string, any> = {};
        eSnap.forEach(doc => {
          exams[doc.id] = doc.data();
        });

        setUsersData(users);
        setExamsData(exams);
      } catch (error) {
        console.error("Error fetching admin data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading, router]);

  if (authLoading || loading) return <div className="p-8 text-center text-slate-500">Verificando credenciales...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8 border-b border-slate-200 dark:border-slate-700 pb-6">
        <div className="w-14 h-14 bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 rounded-2xl flex items-center justify-center">
          <ShieldAlert size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white">{t('title')}</h1>
          <p className="text-slate-500 dark:text-slate-400">{t('desc')} (Solo Personal Autorizado)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
          <div className="bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 p-4 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('users')}</p>
            <p className="text-3xl font-black text-slate-800 dark:text-white">{usersData.length}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
          <div className="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 p-4 rounded-xl">
            <Award size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Exámenes Completados</p>
            <p className="text-3xl font-black text-slate-800 dark:text-white">{Object.keys(examsData).length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <th className="p-4">Nombre</th>
                <th className="p-4">{t('email')}</th>
                <th className="p-4">Registro</th>
                <th className="p-4 text-center">Examen Final</th>
                <th className="p-4 text-center">{t('score')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {usersData.map((u) => {
                const exam = examsData[u.id];
                return (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{u.name}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <Mail size={14} /> {u.email}
                    </td>
                    <td className="p-4 text-slate-500 text-sm">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-center">
                      {exam ? (
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${exam.passed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                          {exam.passed ? 'APROBADO' : 'REPROBADO'}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm italic">Pendiente</span>
                      )}
                    </td>
                    <td className="p-4 text-center font-mono">
                      {exam ? `${exam.lastScore}/${exam.totalQuestions}` : '-'}
                    </td>
                  </tr>
                );
              })}
              {usersData.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">{t('no_data')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
