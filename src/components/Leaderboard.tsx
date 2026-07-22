'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { Trophy, Medal, Award } from 'lucide-react';

type LeaderboardEntry = {
  uid: string;
  name: string;
  score: number;
  total: number;
  timestamp: string;
};

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('DummyKey') || !db) {
          setLoading(false);
          return;
        }

        // Fetch top 10 exams
        const q = query(collection(db, 'userExams'), orderBy('lastScore', 'desc'), limit(10));
        const examSnap = await getDocs(q);
        
        const examData: Record<string, any> = {};
        examSnap.forEach(doc => {
          examData[doc.id] = doc.data();
        });

        // Fetch all users to map names (in a real app, you'd save name directly in userExams or use Cloud Functions)
        const usersSnap = await getDocs(collection(db, 'users'));
        const usersData: Record<string, any> = {};
        usersSnap.forEach(doc => {
          usersData[doc.id] = doc.data();
        });

        const combined: LeaderboardEntry[] = Object.keys(examData).map(uid => ({
          uid,
          name: usersData[uid]?.name || 'Piloto Anónimo',
          score: examData[uid].lastScore,
          total: examData[uid].totalQuestions,
          timestamp: examData[uid].timestamp
        }));

        combined.sort((a, b) => b.score - a.score);
        setLeaders(combined);
      } catch (error) {
        console.error("Error fetching leaderboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <div className="animate-pulse bg-slate-100 dark:bg-slate-800 h-64 rounded-xl"></div>;
  if (leaders.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 mt-8">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="text-amber-500" size={28} />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Top Pilotos</h2>
      </div>

      <div className="space-y-4">
        {leaders.map((leader, index) => (
          <div key={leader.uid} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                ${index === 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 
                  index === 1 ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' : 
                  index === 2 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 
                  'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400'}`}
              >
                {index === 0 ? <Trophy size={18} /> : index === 1 ? <Medal size={18} /> : index === 2 ? <Award size={18} /> : index + 1}
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">{leader.name}</p>
                <p className="text-xs text-slate-500">{new Date(leader.timestamp).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-sky-600 dark:text-sky-400">{leader.score} <span className="text-sm font-normal text-slate-500">/ {leader.total}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
