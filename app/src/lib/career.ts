import type { LeadFormat, PartnerKind, SpecialistLevel } from './types';

export type { SpecialistLevel };

const LEVEL_THRESHOLDS: { level: SpecialistLevel; minRating: number }[] = [
  { level: 'expert', minRating: 4.8 },
  { level: 'senior', minRating: 4.3 },
  { level: 'junior', minRating: 0 },
];

export function getLevel(rating: number): SpecialistLevel {
  return LEVEL_THRESHOLDS.find((t) => rating >= t.minRating)!.level;
}

export const LEVEL_LABEL: Record<SpecialistLevel, string> = {
  junior: 'Junior',
  senior: 'Senior',
  expert: 'Expert',
};

export const LEAD_FORMAT_LABEL: Record<LeadFormat, string> = {
  online: 'Онлайн',
  offline: 'Офлайн',
};

export const PARTNER_KIND_LABEL: Record<PartnerKind, string> = {
  fitness: 'Фитнес-клуб',
  wellness: 'Wellness-центр',
  clinic: 'Клиника',
  corporate: 'Корпоративный ДМС',
};
