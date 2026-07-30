'use client';

import React from 'react';
import {
  WBStation, PerformanceInput, MissionType, CrewProfile, RoutePoint, SavedRoutePlan, RiskLogEntry, FlightLogEntry,
} from '../types/efb';
import { INITIAL_STATIONS } from '../lib/bo105-specs';
import { useCloudSyncedList, SyncStatus } from '../lib/useCloudSyncedList';

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
  upsertProfile: (profile: CrewProfile) => void;
  deleteProfile: (id: string) => void;
  activeProfileId: string | null;
  setActiveProfileId: React.Dispatch<React.SetStateAction<string | null>>;
  activeProfile: CrewProfile | null;

  flightLogs: FlightLogEntry[];
  upsertFlightLog: (entry: FlightLogEntry) => void;
  deleteFlightLog: (id: string) => void;

  routePoints: RoutePoint[];
  setRoutePoints: React.Dispatch<React.SetStateAction<RoutePoint[]>>;
  savedRoutePlans: SavedRoutePlan[];
  upsertRoutePlan: (plan: SavedRoutePlan) => void;
  deleteRoutePlan: (id: string) => void;

  riskLog: RiskLogEntry[];
  addRiskLogEntry: (entry: Omit<RiskLogEntry, 'id' | 'savedAtIso'>) => void;

  // One shared operational PIN gates sync for the roster, bitácora, matriz de riesgo and
  // planes de ruta alike — everything always works from the local cache first; the PIN only
  // controls whether it's also shared with the rest of the crew via Neon.
  syncPin: string | null;
  setSyncPin: (pin: string | null) => void;
  syncStatus: SyncStatus;
  syncError: string | null;
  syncPendingCount: number;
  syncAllNow: () => void;
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

const ACTIVE_PROFILE_STORAGE_KEY = 'modena-efb-active-profile-v1';
// Shared with the old CrewAccessModule's key so a PIN entered before this merge still works.
const SYNC_PIN_STORAGE_KEY = 'modena-crew-pin';

function loadJson<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function byDateDesc<T extends { date?: string; savedAtIso?: string }>(a: T, b: T): number {
  const av = a.savedAtIso ?? a.date ?? '';
  const bv = b.savedAtIso ?? b.date ?? '';
  return av < bv ? 1 : av > bv ? -1 : 0;
}

export const EfbDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stations, setStations] = React.useState<WBStation[]>(INITIAL_STATIONS);
  const [performanceInput, setPerformanceInput] = React.useState<PerformanceInput>(DEFAULT_PERFORMANCE_INPUT);
  const [mission, setMission] = React.useState<MissionType>('hems-neuquen-vista');

  const [activeProfileId, setActiveProfileId] = React.useState<string | null>(null);

  const [syncPin, setSyncPinState] = React.useState<string | null>(null);
  const [hydrated, setHydrated] = React.useState(false);

  const [routePoints, setRoutePoints] = React.useState<RoutePoint[]>([]);

  React.useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time sync from localStorage on mount, not a render loop */
    setActiveProfileId(loadJson(ACTIVE_PROFILE_STORAGE_KEY, null as string | null));
    setSyncPinState(window.localStorage.getItem(SYNC_PIN_STORAGE_KEY));
    /* eslint-enable react-hooks/set-state-in-effect */
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      if (activeProfileId) window.localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, JSON.stringify(activeProfileId));
      else window.localStorage.removeItem(ACTIVE_PROFILE_STORAGE_KEY);
    } catch { /* storage unavailable */ }
  }, [activeProfileId, hydrated]);

  const setSyncPin = React.useCallback((pin: string | null) => {
    setSyncPinState(pin);
    try {
      if (pin) window.localStorage.setItem(SYNC_PIN_STORAGE_KEY, pin);
      else window.localStorage.removeItem(SYNC_PIN_STORAGE_KEY);
    } catch { /* storage unavailable */ }
  }, []);

  // A wrong PIN is wrong for every resource — clearing it here (instead of once per hook)
  // means the despachante only has to re-enter it once, not four times.
  const onAuthError = React.useCallback(() => setSyncPin(null), [setSyncPin]);

  const crewSync = useCloudSyncedList<CrewProfile>({
    storageKey: 'modena-efb-crew-profiles-v2',
    pendingKey: 'modena-efb-crew-pending-ops-v1',
    apiPath: '/api/crew',
    pin: syncPin,
    onAuthError,
  });

  const flightLogsSync = useCloudSyncedList<FlightLogEntry>({
    // Deliberately a new key, not the old 'modena-efb-logbook-v1': that one may hold the
    // module's old hardcoded demo seed entries, which must never get synced to the shared
    // team database as if they were real flights.
    storageKey: 'modena-efb-logbook-v2',
    pendingKey: 'modena-efb-logbook-pending-ops-v1',
    apiPath: '/api/flight-logs',
    pin: syncPin,
    onAuthError,
    normalize: React.useCallback((items: FlightLogEntry[]) => [...items].sort(byDateDesc), []),
  });

  const riskLogSync = useCloudSyncedList<RiskLogEntry>({
    // Keeps the original key (predates cloud sync) so any risk log already on this device
    // gets picked up by the legacy-record bootstrap in useCloudSyncedList instead of orphaned.
    storageKey: 'modena-efb-risk-log-v1',
    pendingKey: 'modena-efb-risk-log-pending-ops-v1',
    apiPath: '/api/risk-log',
    pin: syncPin,
    onAuthError,
    normalize: React.useCallback((items: RiskLogEntry[]) => [...items].sort(byDateDesc).slice(0, 100), []),
  });

  const routePlansSync = useCloudSyncedList<SavedRoutePlan>({
    // Keeps the original key (predates cloud sync) so any saved routes already on this device
    // get picked up by the legacy-record bootstrap in useCloudSyncedList instead of orphaned.
    storageKey: 'modena-efb-route-plans-v1',
    pendingKey: 'modena-efb-route-plans-pending-ops-v1',
    apiPath: '/api/route-plans',
    pin: syncPin,
    onAuthError,
    normalize: React.useCallback((items: SavedRoutePlan[]) => [...items].sort(byDateDesc).slice(0, 30), []),
  });

  const deleteProfile = React.useCallback((id: string) => {
    crewSync.remove(id);
    setActiveProfileId(prev => (prev === id ? null : prev));
  }, [crewSync]);

  const activeProfile = React.useMemo(
    () => crewSync.items.find(p => p.id === activeProfileId) ?? null,
    [crewSync.items, activeProfileId]
  );

  const addRiskLogEntry = React.useCallback((entry: Omit<RiskLogEntry, 'id' | 'savedAtIso'>) => {
    riskLogSync.upsert({ ...entry, id: `risk-${Date.now()}`, savedAtIso: new Date().toISOString() });
  }, [riskLogSync]);

  const syncAllNow = React.useCallback(() => {
    crewSync.syncNow();
    flightLogsSync.syncNow();
    riskLogSync.syncNow();
    routePlansSync.syncNow();
  }, [crewSync, flightLogsSync, riskLogSync, routePlansSync]);

  // One combined indicator for the whole app instead of four independent badges — "syncing"
  // takes priority (something's actively happening), then "error"/"offline" (something needs
  // attention), then "synced" only once every resource agrees, else "idle" (no PIN yet).
  const syncStatus: SyncStatus = React.useMemo(() => {
    const statuses = [crewSync.status, flightLogsSync.status, riskLogSync.status, routePlansSync.status];
    if (statuses.includes('syncing')) return 'syncing';
    if (statuses.includes('error')) return 'error';
    if (statuses.includes('offline')) return 'offline';
    if (statuses.every(s => s === 'synced')) return 'synced';
    return 'idle';
  }, [crewSync.status, flightLogsSync.status, riskLogSync.status, routePlansSync.status]);

  const syncError = crewSync.error ?? flightLogsSync.error ?? riskLogSync.error ?? routePlansSync.error;
  const syncPendingCount = crewSync.pendingCount + flightLogsSync.pendingCount + riskLogSync.pendingCount + routePlansSync.pendingCount;

  const value = React.useMemo(
    () => ({
      stations, setStations,
      performanceInput, setPerformanceInput,
      mission, setMission,
      profiles: crewSync.items, upsertProfile: crewSync.upsert, deleteProfile, activeProfileId, setActiveProfileId, activeProfile,
      flightLogs: flightLogsSync.items, upsertFlightLog: flightLogsSync.upsert, deleteFlightLog: flightLogsSync.remove,
      routePoints, setRoutePoints,
      savedRoutePlans: routePlansSync.items, upsertRoutePlan: routePlansSync.upsert, deleteRoutePlan: routePlansSync.remove,
      riskLog: riskLogSync.items, addRiskLogEntry,
      syncPin, setSyncPin, syncStatus, syncError, syncPendingCount, syncAllNow,
    }),
    [
      stations, performanceInput, mission,
      crewSync.items, crewSync.upsert, deleteProfile, activeProfileId, activeProfile,
      flightLogsSync.items, flightLogsSync.upsert, flightLogsSync.remove,
      routePoints, routePlansSync.items, routePlansSync.upsert, routePlansSync.remove,
      riskLogSync.items, addRiskLogEntry,
      syncPin, setSyncPin, syncStatus, syncError, syncPendingCount, syncAllNow,
    ]
  );

  return <EfbDataContext.Provider value={value}>{children}</EfbDataContext.Provider>;
};

export function useEfbData(): EfbDataContextValue {
  const ctx = React.useContext(EfbDataContext);
  if (!ctx) throw new Error('useEfbData debe usarse dentro de <EfbDataProvider>');
  return ctx;
}
