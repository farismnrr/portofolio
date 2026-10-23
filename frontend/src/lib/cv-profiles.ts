import { parseFrontmatter, parseInlineList, requireKeys, unquote } from './content';

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

const profileModules = import.meta.glob('../../content/cv-profiles/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>;

function numberValue(path: string, values: Map<string, string>, key: string) {
  const value = Number(values.get(key));
  if (!Number.isFinite(value)) throw new Error(`${path}: ${key} must be a number`);
  return value;
}

function numberMap(path: string, value: string, key: string) {
  return Object.fromEntries(parseInlineList(value).map((item) => {
    const [name, rawNumber] = item.split('=');
    const number = Number(rawNumber);
    if (!name || !Number.isFinite(number)) throw new Error(`${path}: invalid ${key} entry "${item}"`);
    return [name, number];
  }));
}

function parseScope(path: string, line: string): CvScopePolicy {
  const [key, label, ...guidance] = line.replace(/^-\s+/, '').split(' | ');
  if (!key || !label || !guidance.length) throw new Error(`${path}: invalid technical scope "${line}"`);
  return { key, label, guidance: guidance.join(' | ') };
}

function parseProfile(path: string, source: string): CvProfile {
  const { values, body } = parseFrontmatter(path, source);
  requireKeys(path, values, [
    'id', 'label', 'headline', 'maxPages', 'filename', 'retrievalQuery', 'preferredSignals',
    'secondarySignals', 'sourceTypeWeights', 'projectChunkCap', 'enrichmentCaps', 'budgets',
    'minSecondPageFill', 'minBodySizePt', 'minimumItems'
  ]);

  const [scopeSection = '', ...policySections] = body.split(/^## /m).slice(1);
  const scopes = scopeSection.replace(/^[^\n]*\n/, '').trim().split(/\r?\n/).filter(Boolean);
  const policySource = policySections.join('## ');
  const section = (heading: string) => {
    const match = policySource.match(new RegExp(`### ${heading}\\n\\n([\\s\\S]*?)(?=\\n### |$)`));
    return match?.[1]?.trim() ?? '';
  };
  const avoid = section('Avoid').split(/\r?\n/).filter(Boolean).map((line) => line.replace(/^-\s+/, ''));
  const budgets = numberMap(path, values.get('budgets') ?? '', 'budgets');
  const minimumItems = numberMap(path, values.get('minimumItems') ?? '', 'minimumItems');

  return {
    id: unquote(values.get('id') ?? '') as CvTarget,
    label: unquote(values.get('label') ?? ''),
    headline: unquote(values.get('headline') ?? ''),
    maxPages: numberValue(path, values, 'maxPages') as 1 | 2,
    filename: unquote(values.get('filename') ?? ''),
    retrievalQuery: unquote(values.get('retrievalQuery') ?? ''),
    preferredSignals: parseInlineList(values.get('preferredSignals') ?? ''),
    secondarySignals: parseInlineList(values.get('secondarySignals') ?? ''),
    sourceTypeWeights: numberMap(path, values.get('sourceTypeWeights') ?? '', 'sourceTypeWeights'),
    projectChunkCap: numberValue(path, values, 'projectChunkCap'),
    enrichmentCaps: numberMap(path, values.get('enrichmentCaps') ?? '', 'enrichmentCaps'),
    technicalScopes: scopes.map((line) => parseScope(path, line)),
    budgets: { projects: budgets.projects, experiences: budgets.experiences, certifications: budgets.certifications },
    writingPolicy: {
      identity: section('Identity'),
      focus: section('Focus'),
      summaryRange: section('Summary range'),
      projectRange: section('Project range'),
      avoid
    },
    layoutPolicy: {
      minSecondPageFill: numberValue(path, values, 'minSecondPageFill'),
      minBodySizePt: numberValue(path, values, 'minBodySizePt'),
      minimumItems: {
        projects: minimumItems.projects,
        experiences: minimumItems.experiences,
        certifications: minimumItems.certifications
      }
    }
  };
}

export const CV_PROFILES = Object.fromEntries(
  Object.entries(profileModules).map(([path, source]) => {
    const profile = parseProfile(path, source);
    return [profile.id, profile];
  })
) as Record<CvTarget, CvProfile>;

export const CV_PROFILE_OPTIONS = Object.values(CV_PROFILES);

export function getCvProfile(target: CvTarget = 'general'): CvProfile {
  const profile = CV_PROFILES[target] ?? CV_PROFILES.general;
  if (!profile) throw new Error(`Unknown CV profile: ${target}`);
  return profile;
}
