'use client';

import React from 'react';
import { WBStation, PerformanceInput, MissionType, CrewProfile } from '../types/efb';
import { INITIAL_STATIONS } from '../lib/bo105-specs';

// Shared live flight data (loading, environmental inputs, active mission, crew profile) so
// that every module — in particular the official Dispatch PDF — reads the same state the
// crew actually configured, instead of each tab keeping its own disconnected copy.
interface EfbDataContextValue {
  stations: WBStation[];
  setStations: React.Dispatch<React.SetStateAction<WBStation[]>>;
  performanceInput: PerformanceInput;
  setPerformanceInput: React.Dispatch<React.SetStateAction<PerformanceInput>>;
  mission: MissionType;
  setMission: React.Dispatch<React.SetStateAction<MissionType>>;
  profile: CrewProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<CrewProfile | null>>;
}

const EfbDataContext = React.createContext<EfbDataContextValue | null>(null);

const DEFAULT_PERFORMANCE_INPUT: PerformanceInput = {
  pressureAltFt: 500,
  tempC: 18,
  qnhHpa: 1013,
  windSpeedKt: 18,
  windDirDeg: 270,
  runwayHeadingDeg: 250,
  takeoffWeightKg: 2420,
};

const PROFILE_STORAGE_KEY = 'modena-efb-crew-profile-v1';

export const EfbDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stations, setStations] = React.useState<WBStation[]>(INITIAL_STATIONS);
  const [performanceInput, setPerformanceInput] = React.useState<PerformanceInput>(DEFAULT_PERFORMANCE_INPUT);
  const [mission, setMission] = React.useState<MissionType>('hems-neuquen-vista');
  const [profile, setProfile] = React.useState<CrewProfile | null>(null);
  const [hydrated, setHydrated] = React.useState(false);

  // Load any previously saved local profile on mount (seeded post-mount so SSR/first
  // client render match and hydration never mismatches — same pattern as the logbook).
  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from localStorage on mount
        setProfile(JSON.parse(stored));
      }
    } catch {
      // Corrupted or inaccessible storage — start unregistered.
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      if (profile) {
        window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
      } else {
        window.localStorage.removeItem(PROFILE_STORAGE_KEY);
      }
    } catch {
      // Storage unavailable (private browsing / quota) — nothing to do.
    }
  }, [profile, hydrated]);

  const value = React.useMemo(
    () => ({ stations, setStations, performanceInput, setPerformanceInput, mission, setMission, profile, setProfile }),
    [stations, performanceInput, mission, profile]
  );

  return <EfbDataContext.Provider value={value}>{children}</EfbDataContext.Provider>;
};

export function useEfbData(): EfbDataContextValue {
  const ctx = React.useContext(EfbDataContext);
  if (!ctx) throw new Error('useEfbData debe usarse dentro de <EfbDataProvider>');
  return ctx;
}
