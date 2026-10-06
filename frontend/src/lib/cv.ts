import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import {
  certifications,
  education,
  experiences,
  profile
} from './structured-content';
import { projects } from './project-content';
import {
  CV_CONTRACT_VERSION,
  getCvProfile,
  type CvProfile,
  type CvTarget
} from './cv-profiles';

export type { CvTarget } from './cv-profiles';

export interface Evidence {
  id: string;
  sourceType:
    | 'project'
    | 'experience'
    | 'skill'
    | 'education'
    | 'profile'
    | 'certification';
  sourceId: string;
  section: string;
  company: string;
  skills: string[];
  roleTags: string[];
  content: string;
  score: number;
}

interface RetrieveResponse {
  evidence: Evidence[];
  backend: string;
}

interface AiResponse {
  message: string;
  requestId: string;
}

interface AiErrorResponse {
  error?: string;
  requestId?: string;
}

interface GroundedText {
  text: string;
  evidenceIds: string[];
}

interface ScopeDraft extends GroundedText {
  key: string;
}

interface ProjectDraft {
  sourceId: string;
  narrative: string;
  evidenceIds: string[];
}

interface ExperienceDraft {
  sourceId: string;
  evidenceIds: string[];
}

interface CertificationDraft {
  sourceId: string;
  evidenceIds: string[];
}

interface CvDraft {
  contractVersion: string;
  profileSummary: GroundedText;
  technicalScope: ScopeDraft[];
  projects: ProjectDraft[];
  experiences: ExperienceDraft[];
  certifications: CertificationDraft[];
}

const CvState = Annotation.Root({
  target: Annotation<CvTarget>(),
  evidence: Annotation<Evidence[]>(),
  retrievalBackend: Annotation<string>(),
  draft: Annotation<CvDraft>(),
  validationErrors: Annotation<string[]>()
});

type CvStateType = typeof CvState.State;

function contactLine() {
  const email = profile.email.replace(/^mailto:/, '');
  return [
    email,
    'farismnrr.com',
    profile.github.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    profile.linkedin.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')
  ].join(' | ');
}

async function retrieveNode(state: CvStateType) {
  const cvProfile = getCvProfile(state.target);
  const response = await fetch('/api/cv/retrieve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      target: cvProfile.id,
      query: cvProfile.retrievalQuery,
      limit: 10
    })
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(
      `CV retrieval failed with status ${response.status}${message ? `: ${message.slice(0, 240)}` : ''}`
    );
  }

  const payload = (await response.json()) as RetrieveResponse;
  return {
    evidence: payload.evidence,
    retrievalBackend: payload.backend
  };
}

function planEvidenceNode(state: CvStateType) {
  const cvProfile = getCvProfile(state.target);
  const candidates = [...state.evidence];
  const planned: Evidence[] = [];
  const selectedIds = new Set<string>();
  const projectCounts = new Map<string, number>();

  const addCandidate = (candidate: Evidence) => {
    if (selectedIds.has(candidate.id)) return;
    if (candidate.sourceType === 'project') {
      const count = projectCounts.get(candidate.sourceId) ?? 0;
      if (count >= cvProfile.projectChunkCap) return;
      projectCounts.set(candidate.sourceId, count + 1);
    }
    selectedIds.add(candidate.id);
    planned.push(candidate);
  };

  const sourceTypes = Object.entries(cvProfile.sourceTypeWeights)
    .sort((left, right) => right[1] - left[1])
    .map(([sourceType]) => sourceType);

  // Cover each available source type once before filling the remaining context.
  for (const sourceType of sourceTypes) {
    const candidate = candidates
      .filter((item) => item.sourceType === sourceType && !selectedIds.has(item.id))
      .sort((left, right) => right.score - left.score)[0];
    if (candidate) addCandidate(candidate);
  }

  candidates
    .sort((left, right) => right.score - left.score)
    .forEach(addCandidate);

  return { evidence: planned };
}

function draftPrompt(cvProfile: CvProfile, evidence: Evidence[]) {
  const scopeSchema = cvProfile.technicalScopes.map((scope) => ({
    key: scope.key,
    text: scope.guidance,
    evidenceIds: ['id']
  }));

  return [
    `You are writing a ${cvProfile.maxPages === 2 ? 'maximum two-page' : 'one-page'} ATS-friendly CV for Faris Munir Mahdi.`,
    `Contract version: ${CV_CONTRACT_VERSION}.`,
    `Profile: ${cvProfile.label} (${cvProfile.id}).`,
    `Deterministic headline: ${cvProfile.headline}.`,
    '',
    'Use ONLY the EVIDENCE records below.',
    'Never invent employers, dates, projects, credentials, technologies, metrics, responsibilities, or outcomes.',
    'Every generated narrative must cite the exact evidence IDs it used.',
    'A generated number, percentage, date, or named technology must appear in the evidence it cites.',
    'Return ONLY strict JSON. Do not return Markdown, code fences, comments, or prose outside JSON.',
    '',
    'PROFILE WRITING POLICY:',
    `- Identity: ${cvProfile.writingPolicy.identity}`,
    `- Focus: ${cvProfile.writingPolicy.focus}`,
    `- Avoid: ${cvProfile.writingPolicy.avoid.join('; ')}.`,
    `- Prefer these signals when selecting evidence: ${cvProfile.preferredSignals.join(', ')}.`,
    `- Use these as secondary signals: ${cvProfile.secondarySignals.join(', ')}.`,
    `- Target ${cvProfile.maxPages} page(s) with readable typography; never pad with unsupported claims.`,
    '',
    'Return ONLY valid JSON matching this cv-contract/v1 schema:',
    JSON.stringify({
      contractVersion: CV_CONTRACT_VERSION,
      profileSummary: {
        text: `${cvProfile.writingPolicy.summaryRange} role-focused professional summary`,
        evidenceIds: ['id']
      },
      technicalScope: scopeSchema,
      projects: [
        {
          sourceId: 'real project slug',
          narrative: `${cvProfile.writingPolicy.projectRange} narrative explaining problem, ownership, architecture, engineering decision, and grounded behavior or outcome`,
          evidenceIds: ['project evidence id']
        }
      ],
      experiences: [
        {
          sourceId: 'real experience source id',
          evidenceIds: ['experience evidence id']
        }
      ],
      certifications: [
        {
          sourceId: 'real certification source id',
          evidenceIds: ['certification evidence id']
        }
      ]
    }),
    '',
    'Selection and writing rules:',
    '- PROJECTS and WORK EXPERIENCE are separate sections.',
    '- Projects contain the detailed technical narratives and are the main proof of technical work.',
    '- Work Experience stays concise and factual; summaries and bullets are attached deterministically from source Markdown.',
    '- Related projects are attached only when the source Markdown contains an actual mapping. Never force a relationship.',
    `- Select at most ${cvProfile.budgets.projects} projects, ${cvProfile.budgets.experiences} experience entries, and ${cvProfile.budgets.certifications} certifications.`,
    '- Select at least one grounded project, experience, and certification. Education is attached deterministically and cannot be removed.',
    '- Order selected records strongest or most relevant first because the renderer may trim lower-priority optional records.',
    '- Do not invent titles, companies, dates, certificate names, URLs, or stack lines; those are attached deterministically later.',
    '- Do not output scope labels. The technical scope keys and labels are deterministic from the profile registry.',
    `- technicalScope must contain exactly these keys in this order: ${cvProfile.technicalScopes.map((scope) => scope.key).join(', ')}.`,
    '- Avoid generic filler such as passionate, results-driven, hardworking, cutting-edge, or innovative.',
    '',
    'WORK_PROJECT_LINKS:',
    JSON.stringify(
      experiences.map((item) => ({
        experienceSourceId: String(item.order),
        role: item.role,
        company: item.company,
        projectSlugs: item.projects
      }))
    ),
    '',
    'EVIDENCE:',
    JSON.stringify(
      evidence.map((item) => ({
        id: item.id,
        sourceType: item.sourceType,
        sourceId: item.sourceId,
        section: item.section,
        company: item.company,
        skills: item.skills,
        roleTags: item.roleTags,
        content: item.content,
        relevanceScore: Number(item.score.toFixed(4))
      }))
    )
  ].join('\n');
}

function parseAiJson(raw: string): unknown {
  const cleaned = raw.trim();
  if (cleaned.startsWith('```') || !cleaned.startsWith('{') || !cleaned.endsWith('}')) {
    throw new Error('AI CV writer did not return strict JSON.');
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error('AI CV writer returned invalid JSON.');
  }
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string').map((item) => item.trim())
    : [];
}

function groundedText(value: unknown): GroundedText {
  const item = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    text: typeof item.text === 'string' ? item.text.trim() : '',
    evidenceIds: stringArray(item.evidenceIds)
  };
}

function normalizeDraft(value: unknown, cvProfile: CvProfile): CvDraft {
  const item = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

  const technicalScope = Array.isArray(item.technicalScope)
    ? item.technicalScope.map((raw) => {
        const scope = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
        return {
          key: typeof scope.key === 'string' ? scope.key.trim() : '',
          text: typeof scope.text === 'string' ? scope.text.trim() : '',
          evidenceIds: stringArray(scope.evidenceIds)
        };
      })
    : [];

  const projectsDraft = Array.isArray(item.projects)
    ? item.projects.slice(0, cvProfile.budgets.projects).map((raw) => {
        const project = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
        return {
          sourceId: typeof project.sourceId === 'string' ? project.sourceId.trim() : '',
          narrative: typeof project.narrative === 'string' ? project.narrative.trim() : '',
          evidenceIds: stringArray(project.evidenceIds)
        };
      })
    : [];

  const experiencesDraft = Array.isArray(item.experiences)
    ? item.experiences.slice(0, cvProfile.budgets.experiences).map((raw) => {
        const experience = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
        return {
          sourceId: typeof experience.sourceId === 'string' ? experience.sourceId.trim() : '',
          evidenceIds: stringArray(experience.evidenceIds)
        };
      })
    : [];

  const certificationDraft = Array.isArray(item.certifications)
    ? item.certifications.slice(0, cvProfile.budgets.certifications).map((raw) => {
        const certification =
          raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
        return {
          sourceId:
            typeof certification.sourceId === 'string' ? certification.sourceId.trim() : '',
          evidenceIds: stringArray(certification.evidenceIds)
        };
      })
    : [];

  return {
    contractVersion:
      typeof item.contractVersion === 'string' ? item.contractVersion.trim() : '',
    profileSummary: groundedText(item.profileSummary),
    technicalScope,
    projects: projectsDraft,
    experiences: experiencesDraft,
    certifications: certificationDraft
  };
}

async function draftNode(state: CvStateType) {
  const cvProfile = getCvProfile(state.target);
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: draftPrompt(cvProfile, state.evidence),
      reasoning_effort: 'medium',
      metadata: {
        contractVersion: CV_CONTRACT_VERSION,
        target: cvProfile.id,
        evidenceCount: state.evidence.length
      }
    })
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => ({}))) as AiErrorResponse;
    const errorCode = errorPayload.error ?? `http_${response.status}`;
    const requestId = errorPayload.requestId ? ` [${errorPayload.requestId}]` : '';
    throw new Error(`AI CV writer failed: ${errorCode}${requestId}`);
  }

  const payload = (await response.json()) as AiResponse;
  return {
    draft: normalizeDraft(parseAiJson(payload.message), cvProfile)
  };
}

function validateEvidenceIds(
  ids: string[],
  evidenceMap: Map<string, Evidence>,
  label: string,
  errors: string[]
) {
  if (!ids.length) {
    errors.push(`${label} has no evidence IDs`);
    return;
  }

  for (const id of ids) {
    if (!evidenceMap.has(id)) errors.push(`${label} references unknown evidence: ${id}`);
  }
}

function normalizeClaim(value: string) {
  return value
    .replace(/[—–]/g, '-')
    .toLowerCase()
    .replace(/,/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractNumericClaims(text: string) {
  return [...new Set(text.match(/\b\d[\d,.]*(?:\s*%)?\b/g) ?? [])];
}

function hasClaim(text: string, claim: string) {
  return normalizeClaim(text).replace(/\s+/g, '').includes(normalizeClaim(claim).replace(/\s+/g, ''));
}

function hasKnownTerm(text: string, term: string) {
  const normalizedText = ` ${text.toLowerCase()} `;
  const normalizedTerm = term.toLowerCase().trim();
  if (!normalizedTerm || normalizedTerm.length < 3) return false;
  return normalizedText.includes(` ${normalizedTerm} `) || normalizedText.includes(normalizedTerm);
}

function validateGroundedClaims(
  text: string,
  evidenceIds: string[],
  evidenceMap: Map<string, Evidence>,
  allEvidence: Evidence[],
  label: string,
  errors: string[]
) {
  if (!text) return;
  if (/```|^\s*#{1,6}\s/m.test(text)) {
    errors.push(`${label} contains Markdown instead of plain text`);
  }

  const citedEvidence = evidenceIds
    .map((id) => evidenceMap.get(id))
    .filter((item): item is Evidence => Boolean(item));
  const citedText = citedEvidence
    .map((item) => [item.content, item.company, ...item.skills, ...item.roleTags].join(' '))
    .join(' ');

  for (const claim of extractNumericClaims(text)) {
    if (!hasClaim(citedText, claim)) {
      errors.push(`${label} contains an ungrounded numeric claim: ${claim}`);
    }
  }

  const knownTechnicalTerms = new Set(
    allEvidence.flatMap((item) => item.skills).filter((term) => term.trim().length >= 3)
  );
  for (const term of knownTechnicalTerms) {
    if (hasKnownTerm(text, term) && !hasKnownTerm(citedText, term)) {
      errors.push(`${label} contains an uncited technology or system: ${term}`);
    }
  }
}

function validateMatchingSource(
  ids: string[],
  evidenceMap: Map<string, Evidence>,
  sourceType: Evidence['sourceType'],
  sourceId: string,
  label: string,
  errors: string[]
) {
  let matchingEvidence = 0;
  const linkedExperienceIds =
    sourceType === 'project'
      ? new Set(
          experiences
            .filter((experience) => experience.projects.includes(sourceId))
            .map((experience) => String(experience.order))
        )
      : new Set<string>();

  for (const id of ids) {
    const source = evidenceMap.get(id);
    if (!source) continue;

    const directMatch = source.sourceType === sourceType && source.sourceId === sourceId;
    const linkedExperienceSupport =
      sourceType === 'project' &&
      source.sourceType === 'experience' &&
      linkedExperienceIds.has(source.sourceId);

    if (directMatch) {
      matchingEvidence += 1;
    } else if (!linkedExperienceSupport) {
      errors.push(`${label} cites unrelated evidence ${id}`);
    }
  }

  if (!matchingEvidence) {
    errors.push(`${label} must cite ${sourceType} evidence from source ${sourceId}`);
  }
}

function validateNode(state: CvStateType) {
  const cvProfile = getCvProfile(state.target);
  const errors: string[] = [];
  const evidenceMap = new Map(state.evidence.map((item) => [item.id, item]));

  if (state.draft.contractVersion !== CV_CONTRACT_VERSION) {
    errors.push(`unsupported CV contract version: ${state.draft.contractVersion || 'missing'}`);
  }

  validateEvidenceIds(
    state.draft.profileSummary.evidenceIds,
    evidenceMap,
    'profile summary',
    errors
  );
  if (!state.draft.profileSummary.text) errors.push('profile summary has no text');
  validateGroundedClaims(
    state.draft.profileSummary.text,
    state.draft.profileSummary.evidenceIds,
    evidenceMap,
    state.evidence,
    'profile summary',
    errors
  );

  if (state.draft.technicalScope.length !== cvProfile.technicalScopes.length) {
    errors.push(
      `technical scope must contain exactly ${cvProfile.technicalScopes.length} lines for ${cvProfile.id}`
    );
  }

  for (const [index, scope] of state.draft.technicalScope.entries()) {
    const expected = cvProfile.technicalScopes[index];
    if (!expected || scope.key !== expected.key) {
      errors.push(
        `technical scope ${index + 1} must use deterministic key ${expected?.key ?? 'none'}`
      );
    }
    if (!scope.text) errors.push(`technical scope ${index + 1} is incomplete`);
    validateEvidenceIds(scope.evidenceIds, evidenceMap, `technical scope ${index + 1}`, errors);
    validateGroundedClaims(
      scope.text,
      scope.evidenceIds,
      evidenceMap,
      state.evidence,
      `technical scope ${index + 1}`,
      errors
    );
  }

  if (!state.draft.projects.length) errors.push('no grounded projects selected');
  if (state.draft.projects.length > cvProfile.budgets.projects) {
    errors.push(`projects exceed the ${cvProfile.budgets.projects}-item profile budget`);
  }
  for (const project of state.draft.projects) {
    if (!projects.some((item) => item.slug === project.sourceId)) {
      errors.push(`unknown project source: ${project.sourceId}`);
    }
    if (!project.narrative) errors.push(`project ${project.sourceId} has no narrative`);
    validateEvidenceIds(project.evidenceIds, evidenceMap, `project ${project.sourceId}`, errors);
    validateMatchingSource(
      project.evidenceIds,
      evidenceMap,
      'project',
      project.sourceId,
      `project ${project.sourceId}`,
      errors
    );
    validateGroundedClaims(
      project.narrative,
      project.evidenceIds,
      evidenceMap,
      state.evidence,
      `project ${project.sourceId}`,
      errors
    );
  }

  if (!state.draft.experiences.length) errors.push('no grounded experiences selected');
  if (state.draft.experiences.length > cvProfile.budgets.experiences) {
    errors.push(`experiences exceed the ${cvProfile.budgets.experiences}-item profile budget`);
  }
  for (const experience of state.draft.experiences) {
    if (!experiences.some((item) => String(item.order) === experience.sourceId)) {
      errors.push(`unknown experience source: ${experience.sourceId}`);
    }
    validateEvidenceIds(
      experience.evidenceIds,
      evidenceMap,
      `experience ${experience.sourceId}`,
      errors
    );
    validateMatchingSource(
      experience.evidenceIds,
      evidenceMap,
      'experience',
      experience.sourceId,
      `experience ${experience.sourceId}`,
      errors
    );
  }

  if (!state.draft.certifications.length) errors.push('no grounded certifications selected');
  if (state.draft.certifications.length > cvProfile.budgets.certifications) {
    errors.push(`certifications exceed the ${cvProfile.budgets.certifications}-item profile budget`);
  }
  for (const certification of state.draft.certifications) {
    if (!certifications.some((item) => String(item.order) === certification.sourceId)) {
      errors.push(`unknown certification source: ${certification.sourceId}`);
    }
    validateEvidenceIds(
      certification.evidenceIds,
      evidenceMap,
      `certification ${certification.sourceId}`,
      errors
    );
    validateMatchingSource(
      certification.evidenceIds,
      evidenceMap,
      'certification',
      certification.sourceId,
      `certification ${certification.sourceId}`,
      errors
    );
  }

  return { validationErrors: errors };
}

const workflow = new StateGraph(CvState)
  .addNode('retrieve', retrieveNode)
  .addNode('planEvidence', planEvidenceNode)
  .addNode('composeCv', draftNode)
  .addNode('validate', validateNode)
  .addEdge(START, 'retrieve')
  .addEdge('retrieve', 'planEvidence')
  .addEdge('planEvidence', 'composeCv')
  .addEdge('composeCv', 'validate')
  .addEdge('validate', END)
  .compile();

function absolutePortfolioUrl(value: string) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `https://farismnrr.com${value.startsWith('/') ? value : `/${value}`}`;
}

function projectWebUrl(slug: string) {
  const project = projects.find((item) => item.slug === slug);
  if (!project) return '';
  return `https://farismnrr.com/projects/${encodeURIComponent(project.slug)}`;
}

function projectMeta(slug: string) {
  const project = projects.find((item) => item.slug === slug);
  if (!project) return '';
  const company = experiences.find((item) => item.projects.includes(slug))?.company;
  return [company, project.year].filter(Boolean).join(' | ');
}

async function renderPdf(draft: CvDraft, target: CvTarget) {
  const cvProfile = getCvProfile(target);

  const selectedExperiences = draft.experiences
    .map((item) => {
      const source = experiences.find((experience) => String(experience.order) === item.sourceId);
      if (!source) return null;

      const relatedProjects = source.projects
        .map((slug) => {
          const project = projects.find((candidate) => candidate.slug === slug);
          if (!project) return null;

          return {
            title: project.title,
            url: projectWebUrl(project.slug)
          };
        })
        .filter((project): project is NonNullable<typeof project> => Boolean(project));

      return {
        title: `${source.role} | ${source.company}`,
        meta: [source.year, source.location].filter(Boolean).join(' | '),
        summary: source.summary,
        relatedProjects,
        bullets: relatedProjects.length ? [] : source.bullets.slice(0, 2)
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const selectedProjects = draft.projects
    .map((item) => {
      const source = projects.find((project) => project.slug === item.sourceId);
      if (!source) return null;

      return {
        title: source.title,
        meta: projectMeta(source.slug),
        narrative: item.narrative,
        url: projectWebUrl(source.slug)
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const selectedCertifications = draft.certifications
    .map((item) => {
      const source = certifications.find(
        (certification) => String(certification.order) === item.sourceId
      );
      if (!source) return null;

      return {
        title: source.title,
        meta: [source.issuer, source.year].filter(Boolean).join(' | '),
        url: absolutePortfolioUrl(source.url)
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const educationLines = education.map((item) =>
    [item.institution, item.program, item.year].filter(Boolean).join(' | ')
  );
  const scopeByKey = new Map(draft.technicalScope.map((scope) => [scope.key, scope.text]));

  const response = await fetch('/api/cv/render', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contractVersion: CV_CONTRACT_VERSION,
      profileId: cvProfile.id,
      name: profile.name,
      headline: cvProfile.headline,
      contact: contactLine(),
      profileSummary: draft.profileSummary.text,
      technicalScope: cvProfile.technicalScopes.map((scope) => ({
        label: scope.label,
        text: scopeByKey.get(scope.key) ?? ''
      })),
      projects: selectedProjects,
      experiences: selectedExperiences,
      certifications: selectedCertifications,
      educationLines,
      maxPages: cvProfile.maxPages
    })
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(
      `CV renderer failed with status ${response.status}${message ? `: ${message.slice(0, 360)}` : ''}`
    );
  }

  const blob = await response.blob();
  if (blob.size < 5_000) throw new Error('CV renderer returned an unexpectedly small PDF.');

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = cvProfile.filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function generateCv(target: CvTarget = 'general') {
  const result = await workflow.invoke({ target });

  if (!result.draft) throw new Error('CV workflow completed without a grounded draft.');
  if (result.validationErrors?.length) {
    throw new Error(`CV grounding validation failed: ${result.validationErrors.join('; ')}`);
  }

  await renderPdf(result.draft, target);
}

export function generateGeneralCv() {
  return generateCv('general');
}
