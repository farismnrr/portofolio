import rawProfiles from '../../content/cv-profiles.json';

export type CvTarget = 'general';

export const CV_CONTRACT_VERSION = 'cv-contract/v1';

export interface CvScopePolicy {
  key: string;
  label: string;
  guidance: string;
}

export interface CvBudget {
  projects: number;
  experiences: number;
  certifications: number;
}

export interface CvWritingPolicy {
  identity: string;
  focus: string;
  summaryRange: string;
  projectRange: string;
  avoid: string[];
}

export interface CvLayoutPolicy {
  minSecondPageFill: number;
  minBodySizePt: number;
  minimumItems: CvBudget;
}

export interface CvProfile {
  id: CvTarget;
  label: string;
  headline: string;
  maxPages: 1 | 2;
  filename: string;
  retrievalQuery: string;
  preferredSignals: string[];
  secondarySignals: string[];
  sourceTypeWeights: Record<string, number>;
  projectChunkCap: number;
  enrichmentCaps: Record<string, number>;
  technicalScopes: CvScopePolicy[];
  budgets: CvBudget;
  writingPolicy: CvWritingPolicy;
  layoutPolicy: CvLayoutPolicy;
}

export const CV_PROFILES = rawProfiles as unknown as Record<CvTarget, CvProfile>;

export const CV_PROFILE_OPTIONS = Object.values(CV_PROFILES);

export function getCvProfile(target: CvTarget = 'general'): CvProfile {
  const profile = CV_PROFILES[target] ?? CV_PROFILES.general;
  if (!profile) throw new Error(`Unknown CV profile: ${target}`);
  return profile;
}
