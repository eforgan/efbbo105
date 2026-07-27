'use client';

import React from 'react';
import { WBStation, PerformanceInput, MissionType, CrewProfile, RoutePoint, SavedRoutePlan, RiskLogEntry } from '../types/efb';
import { INITIAL_STATIONS } from '../lib/bo105-specs';

// Shared live flight data (loading, environmental inputs, active mission, crew roster, route
// plan) so that every module — in particular the official Dispatch PDF and OACI Flight Plan —
// reads the same state the crew actually configured, instead of each tab keeping its own
// disconnected copy.
interface EfbDataContextValue {
  stations: WBStation[];
  setStations: React.Dispatch<React.SetStateAction<WBStation[]>>;
  performanceInput: PerformanceInput;
  setPerformanceInput: React.Dispatch<React.SetStateAction<PerformanceInput>>;
  mission: MissionType;
  setMission: React.Dispatch<React.SetStateAction<MissionType>>;

  profiles: CrewProfile[];
  setProfiles: React.Dispatch<React.SetStateAction<CrewProfile[]>>;
  activeProfileId: string | null;
  setActiveProfileId: React.Dispatch<React.SetStateAction<string | null>>;
  activeProfile: CrewProfile | null;

  routePoints: RoutePoint[];
  setRoutePoints: React.Dispatch<React.SetStateAction<RoutePoint[]>>;
  savedRoutePlans: SavedRoutePlan[];
  setSavedRoutePlans: React.Dispatch<React.SetStateAction<SavedRoutePlan[]>>;

  riskLog: RiskLogEntry[];
  addRiskLogEntry: (entry: Omit<RiskLogEntry, 'id' | 'savedAtIso'>) => void;
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

const PROFILES_STORAGE_KEY = 'modena-efb-crew-profiles-v2';
const ACTIVE_PROFILE_STORAGE_KEY = 'modena-efb-active-profile-v1';
const ROUTE_PLANS_STORAGE_KEY = 'modena-efb-route-plans-v1';
const RISK_LOG_STORAGE_KEY = 'modena-efb-risk-log-v1';

function loadJson<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const EfbDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stations, setStations] = React.useState<WBStation[]>(INITIAL_STATIONS);
  const [performanceInput, setPerformanceInput] = React.useState<PerformanceInput>(DEFAULT_PERFORMANCE_INPUT);
  const [mission, setMission] = React.useState<MissionType>('hems-neuquen-vista');

  const [profiles, setProfiles] = React.useState<CrewProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = React.useState<string | null>(null);

  const [routePoints, setRoutePoints] = React.useState<RoutePoint[]>([]);
  const [savedRoutePlans, setSavedRoutePlans] = React.useState<SavedRoutePlan[]>([]);

  const [riskLog, setRiskLog] = React.useState<RiskLogEntry[]>([]);

  const [hydrated, setHydrated] = React.useState(false);

  // Load anything previously saved on this device on mount. Deliberately seeded post-mount
  // (not via lazy useState initializers) so SSR/first client render match and hydration
  // never mismatches — same pattern already used by the logbook.
  React.useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time sync from localStorage on mount, not a render loop */
    setProfiles(loadJson(PROFILES_STORAGE_KEY, [] as CrewProfile[]));
    setActiveProfileId(loadJson(ACTIVE_PROFILE_STORAGE_KEY, null as string | null));
    setSavedRoutePlans(loadJson(ROUTE_PLANS_STORAGE_KEY, [] as SavedRoutePlan[]));
    setRiskLog(loadJson(RISK_LOG_STORAGE_KEY, [] as RiskLogEntry[]));
    /* eslint-enable react-hooks/set-state-in-effect */
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles)); } catch { /* storage unavailable */ }
  }, [profiles, hydrated]);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      if (activeProfileId) window.localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, JSON.stringify(activeProfileId));
      else window.localStorage.removeItem(ACTIVE_PROFILE_STORAGE_KEY);
    } catch { /* storage unavailable */ }
  }, [activeProfileId, hydrated]);

  React.useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(ROUTE_PLANS_STORAGE_KEY, JSON.stringify(savedRoutePlans)); } catch { /* storage unavailable */ }
  }, [savedRoutePlans, hydrated]);

  React.useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(RISK_LOG_STORAGE_KEY, JSON.stringify(riskLog)); } catch { /* storage unavailable */ }
  }, [riskLog, hydrated]);

  const activeProfile = React.useMemo(
    () => profiles.find(p => p.id === activeProfileId) ?? null,
    [profiles, activeProfileId]
  );

  const addRiskLogEntry = React.useCallback((entry: Omit<RiskLogEntry, 'id' | 'savedAtIso'>) => {
    setRiskLog(prev => [{ ...entry, id: `risk-${Date.now()}`, savedAtIso: new Date().toISOString() }, ...prev].slice(0, 100));
  }, []);

  const value = React.useMemo(
    () => ({
      stations, setStations,
      performanceInput, setPerformanceInput,
      mission, setMission,
      profiles, setProfiles, activeProfileId, setActiveProfileId, activeProfile,
      routePoints, setRoutePoints,
      savedRoutePlans, setSavedRoutePlans,
      riskLog, addRiskLogEntry,
    }),
    [stations, performanceInput, mission, profiles, activeProfileId, activeProfile, routePoints, savedRoutePlans, riskLog, addRiskLogEntry]
  );

  return <EfbDataContext.Provider value={value}>{children}</EfbDataContext.Provider>;
};

export function useEfbData(): EfbDataContextValue {
  const ctx = React.useContext(EfbDataContext);
  if (!ctx) throw new Error('useEfbData debe usarse dentro de <EfbDataProvider>');
  return ctx;
}
