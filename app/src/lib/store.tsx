import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Client, Goal, KbjuCalculation, KbjuInput, KbjuResult, ReferralEntry, RevenuePoint, Specialist } from './types';
import { CLIENTS_SEED, REFERRALS_SEED, REVENUE_SEED, SPECIALIST_SEED } from './seed';

const STORAGE_KEY = 'nutrios:v1';

interface AppData {
  specialist: Specialist;
  clients: Client[];
  referrals: ReferralEntry[];
  revenue: RevenuePoint[];
  calculations: KbjuCalculation[];
}

function loadInitial(): AppData {
  if (typeof window !== 'undefined') {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw) as AppData;
      } catch {
        /* fall through to seed */
      }
    }
  }
  return {
    specialist: SPECIALIST_SEED,
    clients: CLIENTS_SEED,
    referrals: REFERRALS_SEED,
    revenue: REVENUE_SEED,
    calculations: [],
  };
}

interface AppDataContextValue extends AppData {
  addClient: (input: { name: string; goal: Goal; monthlyFee: number; weightKg?: number }) => Client;
  addWeightPoint: (clientId: string, weightKg: number) => void;
  updateNotes: (clientId: string, notes: string) => void;
  setClientStatus: (clientId: string, status: Client['status']) => void;
  addKbjuCalculation: (input: KbjuInput, result: KbjuResult, clientId: string | null) => KbjuCalculation;
  inviteReferral: (name: string) => void;
  withdraw: () => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

const CLIENT_COLORS = ['var(--c-edu)', 'var(--c-saas)', 'var(--c-know)', 'var(--c-comm)', 'var(--c-career)'];

function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadInitial);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      ...data,
      addClient: ({ name, goal, monthlyFee, weightKg }) => {
        const client: Client = {
          id: makeId('c'),
          name,
          color: CLIENT_COLORS[data.clients.length % CLIENT_COLORS.length],
          goal,
          status: 'new',
          startedAt: new Date().toISOString(),
          monthlyFee,
          notes: '',
          weightHistory: weightKg ? [{ date: new Date().toISOString(), weightKg }] : [],
        };
        setData((prev) => ({ ...prev, clients: [client, ...prev.clients] }));
        return client;
      },
      addWeightPoint: (clientId, weightKg) => {
        setData((prev) => ({
          ...prev,
          clients: prev.clients.map((c) =>
            c.id === clientId
              ? { ...c, weightHistory: [...c.weightHistory, { date: new Date().toISOString(), weightKg }] }
              : c,
          ),
        }));
      },
      updateNotes: (clientId, notes) => {
        setData((prev) => ({
          ...prev,
          clients: prev.clients.map((c) => (c.id === clientId ? { ...c, notes } : c)),
        }));
      },
      setClientStatus: (clientId, status) => {
        setData((prev) => ({
          ...prev,
          clients: prev.clients.map((c) => (c.id === clientId ? { ...c, status } : c)),
        }));
      },
      addKbjuCalculation: (input, result, clientId) => {
        const calc: KbjuCalculation = {
          id: makeId('k'),
          clientId,
          createdAt: new Date().toISOString(),
          ...input,
          ...result,
        };
        setData((prev) => ({ ...prev, calculations: [calc, ...prev.calculations] }));
        return calc;
      },
      inviteReferral: (name) => {
        const entry: ReferralEntry = {
          id: makeId('r'),
          name,
          status: 'invited',
          joinedAt: new Date().toISOString(),
          earned: 0,
        };
        setData((prev) => ({ ...prev, referrals: [entry, ...prev.referrals] }));
      },
      withdraw: () => {
        setData((prev) => ({ ...prev, specialist: { ...prev.specialist, balance: 0 } }));
      },
    }),
    [data],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
