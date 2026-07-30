'use client';

import React from 'react';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

type PendingOp<T> = { type: 'upsert'; item: T } | { type: 'delete' };

interface Options<T extends { id: string; updatedAt?: string }> {
  storageKey: string;
  pendingKey: string;
  apiPath: string;
  pin: string | null;
  /** Called when the shared PIN turns out to be wrong, so the caller can drop it app-wide. */
  onAuthError: () => void;
  /** Optional re-sort/cap applied after every local mutation and every server pull. */
  normalize?: (items: T[]) => T[];
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

// One device-local cache + one pending-ops queue + one PIN-gated Neon endpoint, shared by
// every EFB list that's meant to be visible to the whole crew (roster, bitácora, matriz de
// riesgo, planes de ruta). Reads/writes always hit the local cache first — the PIN only
// controls whether/when that cache gets pushed to and reconciled with the shared table.
// `id` is always client-generated so an item created offline never needs remapping once it
// reaches the server; `updatedAt` (stamped on every upsert) is what "never synced yet" checks
// against to bootstrap pre-existing local data into the queue exactly once.
export function useCloudSyncedList<T extends { id: string; updatedAt?: string }>(opts: Options<T>) {
  const { storageKey, pendingKey, apiPath, pin, onAuthError, normalize } = opts;

  const [items, setItems] = React.useState<T[]>([]);
  const [pendingOps, setPendingOps] = React.useState<Record<string, PendingOp<T>>>({});
  const pendingOpsRef = React.useRef(pendingOps);
  React.useEffect(() => { pendingOpsRef.current = pendingOps; }, [pendingOps]);

  const [status, setStatus] = React.useState<SyncStatus>('idle');
  const [error, setError] = React.useState<string | null>(null);
  const [hydrated, setHydrated] = React.useState(false);

  // Backs off a few automatic retries on a transient failure before leaving it to the manual
  // "Sincronizar ahora" button — Neon (and serverless backends generally) scale compute to
  // zero after a few idle minutes, so the first request after a gap routinely 500s with a
  // "Couldn't connect to compute node" error that succeeds on immediate retry. Refs (not
  // state) so scheduling a retry never itself triggers a re-render/re-schedule loop.
  const retryCountRef = React.useRef(0);
  const retryTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  // Indirection so the retry scheduled inside syncNow's own catch block can call the latest
  // syncNow without referencing the `syncNow` binding before its declaration completes.
  const syncNowRef = React.useRef<() => void>(() => {});
  React.useEffect(() => () => { if (retryTimerRef.current) clearTimeout(retryTimerRef.current); }, []);

  React.useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time load from localStorage on mount, not a render loop */
    setItems(loadJson(storageKey, [] as T[]));
    setPendingOps(loadJson(pendingKey, {} as Record<string, PendingOp<T>>));
    /* eslint-enable react-hooks/set-state-in-effect */
    setHydrated(true);
    // storageKey/pendingKey are effectively constants per hook instance — this must only run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(storageKey, JSON.stringify(items)); } catch { /* storage unavailable */ }
  }, [items, hydrated, storageKey]);

  React.useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(pendingKey, JSON.stringify(pendingOps)); } catch { /* storage unavailable */ }
  }, [pendingOps, hydrated, pendingKey]);

  const syncNow = React.useCallback(async () => {
    if (retryTimerRef.current) { clearTimeout(retryTimerRef.current); retryTimerRef.current = null; }
    if (!pin) { setStatus('idle'); return; }

    setStatus('syncing');
    setError(null);

    try {
      for (const [id, op] of Object.entries(pendingOpsRef.current)) {
        const res = op.type === 'delete'
          ? await fetch(`${apiPath}?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'x-crew-pin': pin } })
          : await fetch(apiPath, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'x-crew-pin': pin },
              body: JSON.stringify(op.item),
            });

        if (res.status === 401) throw new Error('PIN incorrecto');
        if (!res.ok && res.status !== 404) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || `No se pudo sincronizar (HTTP ${res.status})`);
        }
        setPendingOps(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }

      const res = await fetch(apiPath, { headers: { 'x-crew-pin': pin } });
      if (res.status === 401) throw new Error('PIN incorrecto');
      if (!res.ok) throw new Error('No se pudo cargar desde la nube');
      const data = await res.json();
      const pulled = data.items as T[];
      setItems(normalize ? normalize(pulled) : pulled);
      setStatus('synced');
      retryCountRef.current = 0;
    } catch (err: unknown) {
      const message = (err as Error).message;
      if (message === 'PIN incorrecto') {
        onAuthError();
        setError('PIN incorrecto — volvé a ingresarlo para sincronizar.');
        setStatus('error');
        retryCountRef.current = 0;
      } else {
        // fetch() throws a bare TypeError on network failure — that's just "no connection
        // right now". Either way (network-down or a transient backend error), schedule a
        // few backed-off retries before giving up and waiting for a manual click.
        const isNetworkFailure = err instanceof TypeError;
        setStatus(isNetworkFailure ? 'offline' : 'error');
        if (!isNetworkFailure) setError(message);

        const backoffMs = [3000, 8000, 20000];
        if (retryCountRef.current < backoffMs.length) {
          const delay = backoffMs[retryCountRef.current];
          retryCountRef.current += 1;
          retryTimerRef.current = setTimeout(() => { syncNowRef.current(); }, delay);
        }
      }
    }
  }, [pin, apiPath, onAuthError, normalize]);

  React.useEffect(() => { syncNowRef.current = syncNow; }, [syncNow]);

  // Kick off a sync whenever a PIN becomes available (pulls the shared list even if there's
  // nothing local pending), and again whenever something gets queued while a PIN is set —
  // debounced so a burst of edits collapses into one round trip.
  React.useEffect(() => {
    if (!hydrated || !pin) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fires once per PIN change (pull the shared list), not a render loop
    syncNow();
  }, [hydrated, pin, syncNow]);

  React.useEffect(() => {
    if (!hydrated || !pin) return;
    if (Object.keys(pendingOps).length === 0) return;
    const timer = setTimeout(() => { syncNow(); }, 600);
    return () => clearTimeout(timer);
  }, [pendingOps, hydrated, pin, syncNow]);

  React.useEffect(() => {
    const handleOnline = () => syncNow();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncNow]);

  // Bootstraps pre-existing local-only items (created before online sync existed, or added
  // while offline) into the pending queue exactly once — an item without `updatedAt` has
  // never round-tripped through the server.
  React.useEffect(() => {
    if (!hydrated) return;
    const unsynced = items.filter(i => !i.updatedAt);
    if (unsynced.length === 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time bootstrap of legacy local records into the sync queue, not a render loop
    setPendingOps(prev => {
      let changed = false;
      const next = { ...prev };
      for (const it of unsynced) {
        if (next[it.id]) continue;
        next[it.id] = { type: 'upsert', item: { ...it, updatedAt: new Date().toISOString() } };
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [hydrated, items]);

  const upsert = React.useCallback((item: T) => {
    const stamped = { ...item, updatedAt: new Date().toISOString() } as T;
    setItems(prev => {
      const exists = prev.some(i => i.id === stamped.id);
      const next = exists ? prev.map(i => (i.id === stamped.id ? stamped : i)) : [stamped, ...prev];
      return normalize ? normalize(next) : next;
    });
    setPendingOps(prev => ({ ...prev, [stamped.id]: { type: 'upsert', item: stamped } }));
  }, [normalize]);

  const remove = React.useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setPendingOps(prev => ({ ...prev, [id]: { type: 'delete' } }));
  }, []);

  return { items, upsert, remove, syncNow, status, error, pendingCount: Object.keys(pendingOps).length };
}
