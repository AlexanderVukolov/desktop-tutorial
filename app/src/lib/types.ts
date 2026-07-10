export type Goal = 'loss' | 'maintenance' | 'gain';
export type Gender = 'female' | 'male';
export type ActivityFactor = 1.2 | 1.375 | 1.55 | 1.725 | 1.9;
export type ClientStatus = 'active' | 'paused' | 'new';
export type ReferralStatus = 'invited' | 'trial' | 'paid';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type MessageSender = 'client' | 'specialist';
export type LeadKind = 'client' | 'partner';
export type LeadFormat = 'online' | 'offline';
export type LeadStatus = 'new' | 'responded' | 'declined';
export type PartnerKind = 'fitness' | 'wellness' | 'clinic' | 'corporate';
export type PartnerStatus = 'available' | 'pending' | 'partnered';
export type SpecialistLevel = 'junior' | 'senior' | 'expert';
export type LeadSource = 'school' | 'hh';
export type SocialPlatform = 'vk' | 'telegram';
export type SubscriptionPlan = 'none' | 'lite' | 'pro';
export type PaymentMethod = 'card' | 'sbp';
export type FrequencyLevel = 'daily' | 'few_week' | 'weekly' | 'rarely' | 'never';
export type PortionSize = 'small' | 'medium' | 'large';

export interface KbjuInput {
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: ActivityFactor;
  goal: Goal;
}

export interface KbjuResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  bmi: number;
}

export interface KbjuCalculation extends KbjuInput, KbjuResult {
  id: string;
  clientId: string | null;
  createdAt: string;
}

export interface WeightPoint {
  date: string;
  weightKg: number;
}

export interface BodyComposition {
  fatPercent: number;
  muscleMassKg: number;
  visceralFat: number;
  measuredAt: string;
}

export interface EnergyExpenditure {
  restingKcal: number;
  totalKcal: number;
  measuredAt: string;
}

export interface Biometrics {
  heightCm: number;
  waistCm: number;
  hipCm: number;
  systolic: number;
  diastolic: number;
  pulse: number;
  measuredAt: string;
}

export interface LabResult {
  id: string;
  clientId: string;
  title: string;
  date: string;
  fileName: string;
  fileData: string;
}

export interface FoodFrequencyEntry {
  frequency: FrequencyLevel;
  portion: PortionSize;
}

export interface Client {
  id: string;
  name: string;
  color: string;
  goal: Goal;
  status: ClientStatus;
  startedAt: string;
  monthlyFee: number;
  nextPaymentDate: string;
  weightHistory: WeightPoint[];
  notes: string;
  photo?: string;
  allergies: string;
  conditions: string;
  preferences: string;
  activityLevel?: ActivityFactor;
  bodyComposition?: BodyComposition;
  energyExpenditure?: EnergyExpenditure;
  biometrics?: Biometrics;
  foodFrequency?: Record<string, FoodFrequencyEntry>;
}

export interface AiEstimate {
  label: string;
  kcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
}

export interface DiaryEntry {
  id: string;
  clientId: string;
  createdAt: string;
  mealType: MealType;
  description: string;
  photo?: string;
  aiEstimate?: AiEstimate;
}

export interface ChatMessage {
  id: string;
  clientId: string;
  from: MessageSender;
  text: string;
  createdAt: string;
}

export interface ReferralEntry {
  id: string;
  name: string;
  status: ReferralStatus;
  joinedAt: string;
  earned: number;
}

export interface RevenuePoint {
  month: string;
  consulting: number;
  referral: number;
}

export interface Specialist {
  name: string;
  role: string;
  since: string;
  rating: number;
  referralCode: string;
  balance: number;
  payoutThreshold: number;
  cmeHoursTarget: number;
  photo?: string;
  plan: SubscriptionPlan;
  paymentMethod: PaymentMethod | null;
  nextChargeDate: string | null;
}

export interface CareerLead {
  id: string;
  kind: LeadKind;
  title: string;
  org: string;
  format: LeadFormat;
  city: string;
  payout: number;
  minRating: number;
  matchReason: string;
  status: LeadStatus;
  postedAt: string;
  source: LeadSource;
  externalUrl?: string;
}

export interface SocialMention {
  id: string;
  platform: SocialPlatform;
  author: string;
  snippet: string;
  foundAt: string;
}

export interface PartnerOrg {
  id: string;
  name: string;
  kind: PartnerKind;
  format: string;
  leadsPerMonth: number;
  status: PartnerStatus;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  author: string;
  readMinutes: number;
  cmeHours: number;
  read: boolean;
}

export interface Webinar {
  id: string;
  title: string;
  speaker: string;
  date: string;
  durationMinutes: number;
  cmeHours: number;
  watched: boolean;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorLevel: SpecialistLevel;
  text: string;
  createdAt: string;
  likes: number;
  likedByMe: boolean;
  replies: number;
}

export interface LeaderboardPeer {
  id: string;
  name: string;
  rating: number;
  clients: number;
}
