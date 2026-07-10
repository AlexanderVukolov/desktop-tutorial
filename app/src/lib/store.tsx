import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type {
  ActivityFactor,
  Biometrics,
  BodyComposition,
  CareerLead,
  ChatMessage,
  Client,
  CommunityPost,
  DiaryEntry,
  EnergyExpenditure,
  FoodFrequencyEntry,
  Goal,
  KbjuCalculation,
  KbjuInput,
  KbjuResult,
  KnowledgeArticle,
  LabResult,
  LeadStatus,
  LeaderboardPeer,
  MessageSender,
  PartnerOrg,
  PartnerStatus,
  PaymentMethod,
  ReferralEntry,
  RevenuePoint,
  Specialist,
  SubscriptionPlan,
  Webinar,
} from './types';
import { getLevel } from './career';
import {
  CAREER_LEADS_SEED,
  CLIENTS_SEED,
  COMMUNITY_POSTS_SEED,
  DIARY_SEED,
  HH_LEAD_POOL,
  KNOWLEDGE_ARTICLES_SEED,
  LEADERBOARD_SEED,
  MESSAGES_SEED,
  PARTNER_ORGS_SEED,
  REFERRALS_SEED,
  REVENUE_SEED,
  SPECIALIST_SEED,
  WEBINARS_SEED,
} from './seed';

const STORAGE_KEY = 'nutrios:v1';

interface AppData {
  specialist: Specialist;
  clients: Client[];
  referrals: ReferralEntry[];
  revenue: RevenuePoint[];
  calculations: KbjuCalculation[];
  diary: DiaryEntry[];
  messages: ChatMessage[];
  careerLeads: CareerLead[];
  partners: PartnerOrg[];
  articles: KnowledgeArticle[];
  webinars: Webinar[];
  communityPosts: CommunityPost[];
  leaderboard: LeaderboardPeer[];
  labResults: LabResult[];
  favoriteWellness: string[];
}

function defaultData(): AppData {
  return {
    specialist: SPECIALIST_SEED,
    clients: CLIENTS_SEED,
    referrals: REFERRALS_SEED,
    revenue: REVENUE_SEED,
    calculations: [],
    diary: DIARY_SEED,
    messages: MESSAGES_SEED,
    careerLeads: CAREER_LEADS_SEED,
    partners: PARTNER_ORGS_SEED,
    articles: KNOWLEDGE_ARTICLES_SEED,
    webinars: WEBINARS_SEED,
    communityPosts: COMMUNITY_POSTS_SEED,
    leaderboard: LEADERBOARD_SEED,
    labResults: [],
    favoriteWellness: [],
  };
}

function addDays(n: number): string {
  return new Date(Date.now() + n * 86_400_000).toISOString();
}

// Backfills fields that didn't exist in older persisted localStorage snapshots,
// so a returning visitor's saved state doesn't crash on newly-added required fields.
function migrateClient(c: Client): Client {
  return {
    ...c,
    nextPaymentDate: c.nextPaymentDate ?? addDays(30),
    allergies: c.allergies ?? '',
    conditions: c.conditions ?? '',
    preferences: c.preferences ?? '',
  };
}

function migrateSpecialist(s: Specialist): Specialist {
  return {
    ...s,
    plan: s.plan ?? 'none',
    paymentMethod: s.paymentMethod ?? null,
    nextChargeDate: s.nextChargeDate ?? null,
    cmeHoursTarget: s.cmeHoursTarget ?? 20,
  };
}

function migrateCareerLead(l: CareerLead): CareerLead {
  return { ...l, source: l.source ?? 'school' };
}

function migrate(data: AppData): AppData {
  return {
    ...data,
    clients: (data.clients ?? []).map(migrateClient),
    specialist: migrateSpecialist(data.specialist),
    careerLeads: (data.careerLeads ?? []).map(migrateCareerLead),
    labResults: data.labResults ?? [],
    favoriteWellness: data.favoriteWellness ?? [],
  };
}

function loadInitial(): AppData {
  if (typeof window !== 'undefined') {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return migrate({ ...defaultData(), ...(JSON.parse(raw) as Partial<AppData>) });
      } catch {
        /* fall through to seed */
      }
    }
  }
  return defaultData();
}

interface AppDataContextValue extends AppData {
  addClient: (input: { name: string; goal: Goal; monthlyFee: number; weightKg?: number }) => Client;
  addWeightPoint: (clientId: string, weightKg: number) => void;
  updateNotes: (clientId: string, notes: string) => void;
  setClientStatus: (clientId: string, status: Client['status']) => void;
  setPaymentDate: (clientId: string, date: string) => void;
  renewPayment: (clientId: string) => void;
  setClientPhoto: (clientId: string, photo: string) => void;
  updateHealthProfile: (
    clientId: string,
    patch: Partial<{
      allergies: string;
      conditions: string;
      preferences: string;
      activityLevel: ActivityFactor;
      bodyComposition: BodyComposition;
      energyExpenditure: EnergyExpenditure;
      biometrics: Biometrics;
    }>,
  ) => void;
  setFoodFrequency: (clientId: string, groupId: string, entry: FoodFrequencyEntry) => void;
  addLabResult: (clientId: string, result: Omit<LabResult, 'id' | 'clientId'>) => void;
  removeLabResult: (labId: string) => void;
  addKbjuCalculation: (input: KbjuInput, result: KbjuResult, clientId: string | null) => KbjuCalculation;
  inviteReferral: (name: string) => void;
  withdraw: () => void;
  addDiaryEntry: (clientId: string, entry: Omit<DiaryEntry, 'id' | 'clientId' | 'createdAt'>) => void;
  addMessage: (clientId: string, from: MessageSender, text: string) => void;
  setLeadStatus: (leadId: string, status: LeadStatus) => void;
  setPartnerStatus: (partnerId: string, status: PartnerStatus) => void;
  refreshHhLeads: () => void;
  toggleArticleRead: (articleId: string) => void;
  toggleWebinarWatched: (webinarId: string) => void;
  addCommunityPost: (text: string) => void;
  toggleLikePost: (postId: string) => void;
  updateSpecialist: (patch: Partial<Pick<Specialist, 'name' | 'role' | 'photo' | 'birthDate' | 'country' | 'city'>>) => void;
  subscribeToPlan: (plan: SubscriptionPlan, method: PaymentMethod) => void;
  cancelSubscription: () => void;
  toggleWellnessFavorite: (articleId: string) => void;
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
          nextPaymentDate: new Date(Date.now() + 30 * 86_400_000).toISOString(),
          notes: '',
          allergies: '',
          conditions: '',
          preferences: '',
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
      setPaymentDate: (clientId, date) => {
        setData((prev) => ({
          ...prev,
          clients: prev.clients.map((c) => (c.id === clientId ? { ...c, nextPaymentDate: date } : c)),
        }));
      },
      renewPayment: (clientId) => {
        const next = new Date(Date.now() + 30 * 86_400_000).toISOString();
        setData((prev) => ({
          ...prev,
          clients: prev.clients.map((c) => (c.id === clientId ? { ...c, nextPaymentDate: next } : c)),
        }));
      },
      setClientPhoto: (clientId, photo) => {
        setData((prev) => ({
          ...prev,
          clients: prev.clients.map((c) => (c.id === clientId ? { ...c, photo } : c)),
        }));
      },
      updateHealthProfile: (clientId, patch) => {
        setData((prev) => ({
          ...prev,
          clients: prev.clients.map((c) => (c.id === clientId ? { ...c, ...patch } : c)),
        }));
      },
      setFoodFrequency: (clientId, groupId, entry) => {
        setData((prev) => ({
          ...prev,
          clients: prev.clients.map((c) =>
            c.id === clientId ? { ...c, foodFrequency: { ...c.foodFrequency, [groupId]: entry } } : c,
          ),
        }));
      },
      addLabResult: (clientId, result) => {
        const item: LabResult = { id: makeId('lab'), clientId, ...result };
        setData((prev) => ({ ...prev, labResults: [item, ...prev.labResults] }));
      },
      removeLabResult: (labId) => {
        setData((prev) => ({ ...prev, labResults: prev.labResults.filter((l) => l.id !== labId) }));
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
      addDiaryEntry: (clientId, entry) => {
        const item: DiaryEntry = {
          id: makeId('d'),
          clientId,
          createdAt: new Date().toISOString(),
          ...entry,
        };
        setData((prev) => ({ ...prev, diary: [item, ...prev.diary] }));
      },
      addMessage: (clientId, from, text) => {
        const message: ChatMessage = {
          id: makeId('m'),
          clientId,
          from,
          text,
          createdAt: new Date().toISOString(),
        };
        setData((prev) => ({ ...prev, messages: [...prev.messages, message] }));
      },
      setLeadStatus: (leadId, status) => {
        setData((prev) => ({
          ...prev,
          careerLeads: prev.careerLeads.map((l) => (l.id === leadId ? { ...l, status } : l)),
        }));
      },
      setPartnerStatus: (partnerId, status) => {
        setData((prev) => ({
          ...prev,
          partners: prev.partners.map((p) => (p.id === partnerId ? { ...p, status } : p)),
        }));
      },
      refreshHhLeads: () => {
        setData((prev) => {
          const existingIds = new Set(prev.careerLeads.map((l) => l.id));
          const candidate = HH_LEAD_POOL.find((l) => !existingIds.has(l.id));
          if (!candidate) return prev;
          const fresh: CareerLead = { ...candidate, postedAt: new Date().toISOString() };
          const hhLeads = prev.careerLeads.filter((l) => l.source === 'hh');
          const nonHhLeads = prev.careerLeads.filter((l) => l.source !== 'hh');
          const keptHh = hhLeads.length >= 3 ? hhLeads.slice(1) : hhLeads;
          return { ...prev, careerLeads: [...nonHhLeads, ...keptHh, fresh] };
        });
      },
      toggleArticleRead: (articleId) => {
        setData((prev) => ({
          ...prev,
          articles: prev.articles.map((a) => (a.id === articleId ? { ...a, read: !a.read } : a)),
        }));
      },
      toggleWebinarWatched: (webinarId) => {
        setData((prev) => ({
          ...prev,
          webinars: prev.webinars.map((w) => (w.id === webinarId ? { ...w, watched: !w.watched } : w)),
        }));
      },
      addCommunityPost: (text) => {
        const post: CommunityPost = {
          id: makeId('p'),
          authorName: data.specialist.name,
          authorLevel: getLevel(data.specialist.rating),
          text,
          createdAt: new Date().toISOString(),
          likes: 0,
          likedByMe: false,
          replies: 0,
        };
        setData((prev) => ({ ...prev, communityPosts: [post, ...prev.communityPosts] }));
      },
      toggleLikePost: (postId) => {
        setData((prev) => ({
          ...prev,
          communityPosts: prev.communityPosts.map((p) =>
            p.id === postId ? { ...p, likedByMe: !p.likedByMe, likes: p.likes + (p.likedByMe ? -1 : 1) } : p,
          ),
        }));
      },
      updateSpecialist: (patch) => {
        setData((prev) => ({ ...prev, specialist: { ...prev.specialist, ...patch } }));
      },
      subscribeToPlan: (plan, method) => {
        const next = new Date(Date.now() + 30 * 86_400_000).toISOString();
        setData((prev) => ({
          ...prev,
          specialist: { ...prev.specialist, plan, paymentMethod: method, nextChargeDate: next },
        }));
      },
      cancelSubscription: () => {
        setData((prev) => ({
          ...prev,
          specialist: { ...prev.specialist, plan: 'none', paymentMethod: null, nextChargeDate: null },
        }));
      },
      toggleWellnessFavorite: (articleId) => {
        setData((prev) => ({
          ...prev,
          favoriteWellness: prev.favoriteWellness.includes(articleId)
            ? prev.favoriteWellness.filter((id) => id !== articleId)
            : [...prev.favoriteWellness, articleId],
        }));
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
