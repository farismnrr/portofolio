import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { projects, type ProjectDocument } from './project-content';
import {
  education,
  experiences,
  profile,
  skillGroups,
  type EducationEntry,
  type ExperienceEntry,
  type SkillGroup
} from './structured-content';
import { renderGeneralCvPdf, triggerPdfDownload } from './cv-pdf';

export type CvTarget = 'general' | 'software-engineer' | 'ai-engineer' | 'devops';

export interface CvFacts {
  profile: typeof profile;
  experiences: ExperienceEntry[];
  projects: ProjectDocument[];
  skillGroups: SkillGroup[];
  education: EducationEntry[];
}

export interface CvSelection {
  projectSlugs: string[];
  experienceOrders: number[];
  experienceBulletIndexes: Record<string, number[]>;
  skillGroupOrders: number[];
}

export interface CvProjectSection {
  slug: string;
  title: string;
  year: string;
  role: string;
  description: string;
  tech: string[];
  url: string;
}

export interface CvExperienceSection {
  order: number;
  year: string;
  company: string;
  role: string;
  summary: string;
  bullets: string[];
  evidence: CvProjectSection[];
}

export interface CvDocument {
  target: CvTarget;
  pageBudget: number;
  name: string;
  headline: string;
  contact: string;
  profileSummary: string;
  skillGroups: SkillGroup[];
  projects: CvProjectSection[];
  experiences: CvExperienceSection[];
  education: EducationEntry[];
}

interface AiResponse {
  message: string;
}

const CvState = Annotation.Root({
  target: Annotation<CvTarget>(),
  facts: Annotation<CvFacts>(),
  selection: Annotation<CvSelection>(),
  document: Annotation<CvDocument>(),
  validationErrors: Annotation<string[]>()
});

type CvStateType = typeof CvState.State;

function collectFacts(): CvFacts {
  return {
    profile,
    experiences,
    projects,
    skillGroups,
    education
  };
}

function stripMailto(value: string) {
  return value.replace(/^mailto:/, '');
}

function portfolioBaseUrl(facts: CvFacts) {
  return facts.projects.find((project) => project.slug === 'portfolio-website')?.productUrl || 'https://farismnrr.com';
}

function compactFactsForModel(facts: CvFacts) {
  return {
    profile: {
      role: facts.profile.role,
      headline: facts.profile.headline,
      specialties: facts.profile.specialties,
      intro: facts.profile.intro
    },
    experiences: facts.experiences.map((item) => ({
      order: item.order,
      year: item.year,
      company: item.company,
      role: item.role,
      summary: item.summary,
      tech: item.tech,
      projects: item.projects,
      bulletCount: item.bullets.length
    })),
    projects: facts.projects.map((project) => ({
      slug: project.slug,
      year: project.year,
      title: project.title,
      role: project.role,
      category: project.category,
      description: project.description,
      tech: project.tech
    })),
    skillGroups: facts.skillGroups.map((group) => ({
      order: group.order,
      title: group.title,
      items: group.items
    }))
  };
}

function selectionPrompt(facts: CvFacts, target: CvTarget) {
  const targetInstruction =
    target === 'general'
      ? 'Build a broad general Software Engineer CV that demonstrates range across backend, AI systems, infrastructure, IoT, product engineering, and frontend only where useful.'
      : `Build a focused CV for the target role: ${target}.`;

  return [
    'You are a resume evidence selector. Do not write resume prose and do not invent facts.',
    targetInstruction,
    'Return ONLY one valid JSON object with exactly these keys:',
    '{"projectSlugs":["slug"],"experienceOrders":[1],"experienceBulletIndexes":{"1":[0,1]},"skillGroupOrders":[1]}',
    '',
    'Rules:',
    '- Every project slug must come from the provided project list.',
    '- Every experience order must come from the provided experience list.',
    '- Every bullet index must be within that experience bulletCount, using zero-based indexes.',
    '- Every skill group order must come from the provided skillGroups list.',
    '- Prefer current/recent experience and the strongest concrete project evidence.',
    '- For general CV choose 4-5 projects, 3-4 experiences, at most 2 bullets per experience, and 4-6 skill groups.',
    '- If an experience has linked project slugs, prioritize those projects so its claims have visible evidence.',
    '- Older experience without linked projects may still be selected, but only its existing source bullets can be used.',
    '- Do not output markdown fences, explanations, prose, or keys beyond the schema.',
    '',
    'SOURCE FACTS:',
    JSON.stringify(compactFactsForModel(facts))
  ].join('\n');
}

async function callAiSelector(facts: CvFacts, target: CvTarget) {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: selectionPrompt(facts, target),
      reasoning_effort: 'low'
    })
  });

  if (!response.ok) {
    throw new Error(`AI selector failed with status ${response.status}`);
  }

  const payload = (await response.json()) as AiResponse;
  return payload.message;
}

function parseAiJson(raw: string): unknown {
  const cleaned = raw.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');

  if (start < 0 || end <= start) {
    throw new Error('AI selector did not return JSON.');
  }

  return JSON.parse(cleaned.slice(start, end + 1));
}

function numberArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is number => Number.isInteger(item))
    : [];
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function normalizeSelection(raw: unknown, facts: CvFacts): CvSelection {
  const value =
    raw && typeof raw === 'object'
      ? (raw as Record<string, unknown>)
      : {};

  const validProjectSlugs = new Set(facts.projects.map((project) => project.slug));
  const validExperienceOrders = new Set(facts.experiences.map((item) => item.order));
  const validSkillOrders = new Set(facts.skillGroups.map((item) => item.order));

  let projectSlugs = stringArray(value.projectSlugs).filter((slug) => validProjectSlugs.has(slug));
  let experienceOrders = numberArray(value.experienceOrders).filter((order) =>
    validExperienceOrders.has(order)
  );
  let skillGroupOrders = numberArray(value.skillGroupOrders).filter((order) =>
    validSkillOrders.has(order)
  );

  if (!experienceOrders.length) {
    experienceOrders = facts.experiences.slice(0, 4).map((item) => item.order);
  }

  const linkedEvidence = experienceOrders.flatMap(
    (order) => facts.experiences.find((item) => item.order === order)?.projects ?? []
  );

  projectSlugs = [...new Set([...linkedEvidence, ...projectSlugs])].filter((slug) =>
    validProjectSlugs.has(slug)
  );

  if (!projectSlugs.length) {
    projectSlugs = facts.projects.slice(0, 5).map((project) => project.slug);
  }

  projectSlugs = projectSlugs.slice(0, 5);

  if (!skillGroupOrders.length) {
    skillGroupOrders = facts.skillGroups.slice(0, 6).map((group) => group.order);
  }
  skillGroupOrders = [...new Set(skillGroupOrders)].slice(0, 6);

  const rawBulletMap =
    value.experienceBulletIndexes && typeof value.experienceBulletIndexes === 'object'
      ? (value.experienceBulletIndexes as Record<string, unknown>)
      : {};

  const experienceBulletIndexes: Record<string, number[]> = {};
  for (const order of experienceOrders.slice(0, 4)) {
    const experience = facts.experiences.find((item) => item.order === order);
    if (!experience) continue;

    let indexes = numberArray(rawBulletMap[String(order)])
      .filter((index) => index >= 0 && index < experience.bullets.length)
      .slice(0, 2);

    if (!indexes.length && experience.bullets.length) {
      indexes = experience.bullets.slice(0, 2).map((_, index) => index);
    }

    experienceBulletIndexes[String(order)] = [...new Set(indexes)];
  }

  return {
    projectSlugs,
    experienceOrders: experienceOrders.slice(0, 4),
    experienceBulletIndexes,
    skillGroupOrders
  };
}

function projectSection(project: ProjectDocument, baseUrl: string): CvProjectSection {
  return {
    slug: project.slug,
    title: project.cardTitle || project.title,
    year: project.year,
    role: project.role,
    description: project.description,
    tech: project.tech,
    url: `${baseUrl.replace(/\/$/, '')}/projects/${project.slug}`
  };
}

function buildDocument(
  facts: CvFacts,
  selection: CvSelection,
  target: CvTarget
): CvDocument {
  const baseUrl = portfolioBaseUrl(facts);

  const selectedProjects = selection.projectSlugs
    .map((slug) => facts.projects.find((project) => project.slug === slug))
    .filter((project): project is ProjectDocument => Boolean(project))
    .map((project) => projectSection(project, baseUrl));

  const selectedExperiences = selection.experienceOrders
    .map((order) => facts.experiences.find((item) => item.order === order))
    .filter((item): item is ExperienceEntry => Boolean(item))
    .map((item) => ({
      order: item.order,
      year: item.year,
      company: item.company,
      role: item.role,
      summary: item.summary,
      bullets: (selection.experienceBulletIndexes[String(item.order)] ?? [])
        .map((index) => item.bullets[index])
        .filter(Boolean),
      evidence: item.projects
        .map((slug) => facts.projects.find((project) => project.slug === slug))
        .filter((project): project is ProjectDocument => Boolean(project))
        .map((project) => projectSection(project, baseUrl))
    }));

  const selectedSkills = selection.skillGroupOrders
    .map((order) => facts.skillGroups.find((group) => group.order === order))
    .filter((group): group is SkillGroup => Boolean(group));

  const roleLabel =
    target === 'general'
      ? 'Software Engineer | AI Systems, Product Engineering & IoT'
      : target
          .split('-')
          .map((part) => part[0]?.toUpperCase() + part.slice(1))
          .join(' ');

  const contact = [
    stripMailto(facts.profile.email),
    baseUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    facts.profile.github.replace(/^https?:\/\//, ''),
    facts.profile.linkedin.replace(/^https?:\/\//, '')
  ].join(' | ');

  return {
    target,
    pageBudget: target === 'general' ? 2 : 1,
    name: facts.profile.name,
    headline: roleLabel,
    contact,
    profileSummary: facts.profile.intro,
    skillGroups: selectedSkills,
    projects: selectedProjects,
    experiences: selectedExperiences,
    education: facts.education.slice(0, 1)
  };
}

function validateDocument(document: CvDocument, facts: CvFacts) {
  const errors: string[] = [];
  const projectMap = new Map(facts.projects.map((project) => [project.slug, project]));
  const experienceMap = new Map(facts.experiences.map((item) => [item.order, item]));

  for (const project of document.projects) {
    const source = projectMap.get(project.slug);
    if (!source) errors.push(`Unknown project: ${project.slug}`);
    if (source && project.description !== source.description) {
      errors.push(`Project copy is not grounded: ${project.slug}`);
    }
  }

  for (const experience of document.experiences) {
    const source = experienceMap.get(experience.order);
    if (!source) {
      errors.push(`Unknown experience: ${experience.order}`);
      continue;
    }

    for (const bullet of experience.bullets) {
      if (!source.bullets.includes(bullet)) {
        errors.push(`Ungrounded experience bullet: ${experience.company}`);
      }
    }

    for (const evidence of experience.evidence) {
      if (!source.projects.includes(evidence.slug) || !projectMap.has(evidence.slug)) {
        errors.push(`Invalid project evidence mapping: ${experience.company} -> ${evidence.slug}`);
      }
    }
  }

  return errors;
}

async function collectNode() {
  return { facts: collectFacts() };
}

async function selectNode(state: CvStateType) {
  const raw = await callAiSelector(state.facts, state.target);
  const parsed = parseAiJson(raw);
  return { selection: normalizeSelection(parsed, state.facts) };
}

async function draftNode(state: CvStateType) {
  return {
    document: buildDocument(state.facts, state.selection, state.target)
  };
}

async function validateNode(state: CvStateType) {
  return {
    validationErrors: validateDocument(state.document, state.facts)
  };
}

const workflow = new StateGraph(CvState)
  .addNode('collect', collectNode)
  .addNode('select', selectNode)
  .addNode('draft', draftNode)
  .addNode('validate', validateNode)
  .addEdge(START, 'collect')
  .addEdge('collect', 'select')
  .addEdge('select', 'draft')
  .addEdge('draft', 'validate')
  .addEdge('validate', END)
  .compile();

export async function generateCv(target: CvTarget = 'general') {
  const result = await workflow.invoke({ target });

  if (!result.document) {
    throw new Error('CV workflow completed without a document.');
  }

  if (result.validationErrors?.length) {
    throw new Error(`CV grounding validation failed: ${result.validationErrors.join('; ')}`);
  }

  if (result.document.pageBudget !== 2) {
    throw new Error('Only the two-page general CV is enabled in this phase.');
  }

  const bytes = await renderGeneralCvPdf(result.document);
  triggerPdfDownload(bytes, 'Faris_Munir_Mahdi_General_CV.pdf');
}

export async function generateGeneralCv() {
  return generateCv('general');
}
