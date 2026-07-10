import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type {
  CareerLead,
  ChatMessage,
  Client,
  CommunityPost,
  DiaryEntry,
  Goal,
  KbjuCalculation,
  KbjuInput,
  KbjuResult,
  KnowledgeArticle,
  LeadStatus,
  LeaderboardPeer,
  MessageSender,
  PartnerOrg,
  PartnerStatus,
  ReferralEntry,
  RevenuePoint,
  Specialist,
  Webinar,
} from './types';
import { getLevel } from './career';
import {
  CAREER_LEADS_SEED,
  CLIENTS_SEED,
  COMMUNITY_POSTS_SEED,
  DIARY_SEED,
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
  };
}

function loadInitial(): AppData {
  if (typeof window !== 'undefined') {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return { ...defaultData(), ...(JSON.parse(raw) as Partial<AppData>) };
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
  addKbjuCalculation: (input: KbjuInput, result: KbjuResult, clientId: string | null) => KbjuCalculation;
  inviteReferral: (name: string) => void;
  withdraw: () => void;
  addDiaryEntry: (clientId: string, entry: Omit<DiaryEntry, 'id' | 'clientId' | 'createdAt'>) => void;
  addMessage: (clientId: string, from: MessageSender, text: string) => void;
  setLeadStatus: (leadId: string, status: LeadStatus) => void;
  setPartnerStatus: (partnerId: string, status: PartnerStatus) => void;
  toggleArticleRead: (articleId: string) => void;
  toggleWebinarWatched: (webinarId: string) => void;
  addCommunityPost: (text: string) => void;
  toggleLikePost: (postId: string) => void;
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
