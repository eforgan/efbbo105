'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type EmergencyMetric = {
  id: string;
  timeSpentMs: number;
  success: boolean;
  timestamp: number;
};

export type PCRResult = {
  id: string;
  result: 'satisfactory' | 'unsatisfactory';
  notes?: string;
  timestamp: number;
};

type ProgressContextType = {
  completedModules: number[];
  completedOffshoreModules: number[];
  examScore: number | null;
  badges: string[];
  emergencyMetrics: EmergencyMetric[];
  pcrResults: PCRResult[];
  completeModule: (moduleId: number) => void;
  completeOffshoreModule: (moduleId: number) => void;
  setExamScore: (score: number) => void;
  addBadge: (badgeId: string) => void;
  recordEmergencyMetric: (metric: EmergencyMetric) => void;
  recordPcrResult: (result: PCRResult) => void;
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [completedOffshoreModules, setCompletedOffshoreModules] = useState<number[]>([]);
  const [examScore, setExamScoreState] = useState<number | null>(null);
  const [badges, setBadges] = useState<string[]>([]);
  const [emergencyMetrics, setEmergencyMetrics] = useState<EmergencyMetric[]>([]);
  const [pcrResults, setPcrResults] = useState<PCRResult[]>([]);
  const [loaded, setLoaded] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    const loadProgress = async () => {
      if (user && process.env.NEXT_PUBLIC_FIREBASE_API_KEY && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('DummyKey') && db) {
        // Load from Firestore
        const docRef = doc(db, 'userProgress', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCompletedModules(data.completedModules || []);
          setCompletedOffshoreModules(data.completedOffshoreModules || []);
          setExamScoreState(data.examScore || null);
          setBadges(data.badges || []);
          setEmergencyMetrics(data.emergencyMetrics || []);
          setPcrResults(data.pcrResults || []);
        }
      } else {
        // Load from LocalStorage
        const saved = localStorage.getItem('bo105_progress');
        if (saved) {
          try {
            const data = JSON.parse(saved);
            setCompletedModules(data.completedModules || []);
            setCompletedOffshoreModules(data.completedOffshoreModules || []);
            setExamScoreState(data.examScore || null);
            setBadges(data.badges || []);
            setEmergencyMetrics(data.emergencyMetrics || []);
            setPcrResults(data.pcrResults || []);
          } catch (e) {
            console.error('Error parsing progress', e);
          }
        }
      }
      setLoaded(true);
    };
    loadProgress();
  }, [user]);

  useEffect(() => {
    // Avoid saving until the initial load (Firestore or localStorage) has finished,
    // otherwise this effect can fire with the default empty state and wipe out
    // progress that was just loaded/completed.
    if (!loaded) return;

    // Save to local storage always as backup
    const dataToSave = { completedModules, completedOffshoreModules, examScore, badges, emergencyMetrics, pcrResults };
    localStorage.setItem('bo105_progress', JSON.stringify(dataToSave));

    // Save to Firestore if user is logged in
    if (user && process.env.NEXT_PUBLIC_FIREBASE_API_KEY && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('DummyKey') && db) {
      setDoc(doc(db, 'userProgress', user.uid), dataToSave, { merge: true }).catch(console.error);
    }
  }, [loaded, completedModules, completedOffshoreModules, examScore, badges, emergencyMetrics, pcrResults, user]);

  const completeModule = (moduleId: number) => {
    setCompletedModules((prev) => {
      if (prev.includes(moduleId)) return prev;
      return [...prev, moduleId];
    });
  };

  const completeOffshoreModule = (moduleId: number) => {
    setCompletedOffshoreModules((prev) => {
      if (prev.includes(moduleId)) return prev;
      return [...prev, moduleId];
    });
  };

  const setExamScore = (score: number) => {
    setExamScoreState(score);
    // Award a badge if score > 80
    if (score >= 80) {
      addBadge('bo105-certified');
    }
  };

  const addBadge = (badgeId: string) => {
    setBadges((prev) => {
      if (prev.includes(badgeId)) return prev;
      return [...prev, badgeId];
    });
  };

  const recordEmergencyMetric = (metric: EmergencyMetric) => {
    setEmergencyMetrics((prev) => {
      // Find if we already have this metric to update best time
      const existingIdx = prev.findIndex(m => m.id === metric.id);
      if (existingIdx !== -1) {
        const next = [...prev];
        // Only update if it's a better time (faster) AND it was a success
        if (metric.success && (!next[existingIdx].success || metric.timeSpentMs < next[existingIdx].timeSpentMs)) {
          next[existingIdx] = metric;
        }
        return next;
      }
      return [...prev, metric];
    });
  };

  const recordPcrResult = (result: PCRResult) => {
    setPcrResults((prev) => {
      const existingIdx = prev.findIndex(r => r.id === result.id);
      if (existingIdx !== -1) {
        const next = [...prev];
        next[existingIdx] = result;
        return next;
      }
      return [...prev, result];
    });
  };

  return (
    <ProgressContext.Provider value={{
      completedModules,
      completedOffshoreModules,
      examScore,
      badges,
      emergencyMetrics,
      pcrResults,
      completeModule,
      completeOffshoreModule,
      setExamScore,
      addBadge,
      recordEmergencyMetric,
      recordPcrResult
    }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
