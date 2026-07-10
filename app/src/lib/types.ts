export type Goal = 'loss' | 'maintenance' | 'gain';
export type Gender = 'female' | 'male';
export type ActivityFactor = 1.2 | 1.375 | 1.55 | 1.725 | 1.9;
export type ClientStatus = 'active' | 'paused' | 'new';
export type ReferralStatus = 'invited' | 'trial' | 'paid';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type MessageSender = 'client' | 'specialist';

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

export interface Client {
  id: string;
  name: string;
  color: string;
  goal: Goal;
  status: ClientStatus;
  startedAt: string;
  monthlyFee: number;
  weightHistory: WeightPoint[];
  notes: string;
}

export interface DiaryEntry {
  id: string;
  clientId: string;
  createdAt: string;
  mealType: MealType;
  description: string;
  photo?: string;
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
}
