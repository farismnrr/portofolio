import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import {
  certifications,
  education,
  experiences,
  profile
} from './structured-content';
import { projects } from './project-content';

export type CvTarget = 'general' | 'software-engineer' | 'ai-engineer' | 'devops';

interface Evidence {
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
  label: string;
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
  const response = await fetch('/api/cv/retrieve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      target: state.target,
      limit: 10
    })
  });

  if (!response.ok) {
    throw new Error(`CV retrieval failed with status ${response.status}`);
  }

  const payload = (await response.json()) as RetrieveResponse;
  return {
    evidence: payload.evidence,
    retrievalBackend: payload.backend
  };
}

function draftPrompt(target: CvTarget, evidence: Evidence[]) {
  const isGeneral = target === 'general';
  const targetLabel = isGeneral
    ? 'general software engineering CV'
    : target
        .split('-')
        .map((part) => part[0]?.toUpperCase() + part.slice(1))
        .join(' ');

  return [
    `You are writing content for a ${isGeneral ? 'maximum two-page' : 'one-page'} ATS-friendly CV for Faris Munir Mahdi.`,
    `Target: ${targetLabel}.`,
    '',
    'Use ONLY the EVIDENCE records below.',
    'Never invent employers, dates, projects, credentials, technologies, metrics, responsibilities, or outcomes.',
    'Every generated narrative must cite the exact evidence IDs it used.',
    '',
    ...(isGeneral
      ? [
          'GENERAL CV BALANCE RULES:',
          '- This is NOT an AI Engineer CV. Present Faris first as a broad Software Engineer.',
          '- Balance backend engineering, APIs and databases, product/full-stack work, cloud/platform/DevOps, IoT/system integration, and applied AI.',
          '- AI/RAG/agents may appear as one capability among several, never as the dominant identity.',
          '- Prefer breadth and evidence of end-to-end engineering ownership over specialization.',
          '- Use the available two-page budget for readable spacing and useful detail. Do not compress everything into one dense page.'
        ]
      : []),
    '',
    'Return ONLY valid JSON matching this schema:',
    JSON.stringify({
      profileSummary: {
        text: isGeneral
          ? '70-100 word balanced software engineering summary'
          : '45-65 word role-focused professional summary',
        evidenceIds: ['id']
      },
      technicalScope: [
        { label: 'Software Engineering', text: 'broad engineering capabilities', evidenceIds: ['id'] },
        { label: 'Backend & Data', text: 'backend, API, database capabilities', evidenceIds: ['id'] },
        { label: 'Cloud & Platform', text: 'cloud, CI/CD, observability, infrastructure capabilities', evidenceIds: ['id'] },
        { label: 'Applied Systems', text: 'IoT and AI only where supported', evidenceIds: ['id'] }
      ],
      projects: [
        {
          sourceId: 'real project slug',
          narrative: isGeneral
            ? '60-95 word narrative explaining problem, ownership, architecture, and engineering evidence'
            : '45-75 word role-focused narrative',
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
    'Writing rules:',
    '- PROJECTS and WORK EXPERIENCE are separate sections.',
    '- Projects should contain the detailed technical narratives.',
    '- Work Experience should stay concise and factual; linked projects are only referenced by name when a real mapping exists.',
    '- Do not force a project relationship for experiences that have no linked projects.',
    '- Experience summaries and bullets are attached deterministically from source Markdown, not written by the model.',
    `- Select ${isGeneral ? '4-5' : '3-4'} projects.`,
    `- Select ${isGeneral ? '4-5' : '2-3'} experience entries when evidence exists.`,
    `- Select ${isGeneral ? '4' : '2-3'} certifications that best support the target.`,
    '- Do not invent titles, companies, dates, certificate names, or URLs; those are attached deterministically later.',
    '- Project narrative is the main proof of work. Do NOT output Stack lines or URLs.',
    `- Technical Scope must contain exactly ${isGeneral ? '4' : '3'} lines.`,
    '- Avoid generic filler such as passionate, results-driven, hardworking, cutting-edge, innovative.',
    '- No markdown, no comments, no prose outside JSON.',
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
        content: item.content
      }))
    )
  ].join('\n');
}

function parseAiJson(raw: string): unknown {
  const cleaned = raw.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('AI CV writer did not return JSON.');
  return JSON.parse(cleaned.slice(start, end + 1));
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function groundedText(value: unknown): GroundedText {
  const item = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    text: typeof item.text === 'string' ? item.text.trim() : '',
    evidenceIds: stringArray(item.evidenceIds)
  };
}

function normalizeDraft(value: unknown, target: CvTarget): CvDraft {
  const item = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const expectedScopes = target === 'general' ? 4 : 3;

  const technicalScope = Array.isArray(item.technicalScope)
    ? item.technicalScope.slice(0, expectedScopes).map((raw) => {
        const scope = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
        return {
          label: typeof scope.label === 'string' ? scope.label.trim() : '',
          text: typeof scope.text === 'string' ? scope.text.trim() : '',
          evidenceIds: stringArray(scope.evidenceIds)
        };
      })
    : [];

  const projectsDraft = Array.isArray(item.projects)
    ? item.projects.slice(0, target === 'general' ? 5 : 4).map((raw) => {
        const project = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
        return {
          sourceId: typeof project.sourceId === 'string' ? project.sourceId.trim() : '',
          narrative: typeof project.narrative === 'string' ? project.narrative.trim() : '',
          evidenceIds: stringArray(project.evidenceIds)
        };
      })
    : [];

  const experiencesDraft = Array.isArray(item.experiences)
    ? item.experiences.slice(0, target === 'general' ? 5 : 3).map((raw) => {
        const experience = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
        return {
          sourceId: typeof experience.sourceId === 'string' ? experience.sourceId.trim() : '',
          evidenceIds: stringArray(experience.evidenceIds)
        };
      })
    : [];

  const certificationDraft = Array.isArray(item.certifications)
    ? item.certifications.slice(0, target === 'general' ? 4 : 3).map((raw) => {
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
    profileSummary: groundedText(item.profileSummary),
    technicalScope,
    projects: projectsDraft,
    experiences: experiencesDraft,
    certifications: certificationDraft
  };
}

async function draftNode(state: CvStateType) {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: draftPrompt(state.target, state.evidence),
      reasoning_effort: 'medium',
      metadata: {
        target: state.target,
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
    draft: normalizeDraft(parseAiJson(payload.message), state.target)
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

function validateNode(state: CvStateType) {
  const errors: string[] = [];
  const evidenceMap = new Map(state.evidence.map((item) => [item.id, item]));
  const expectedScopes = state.target === 'general' ? 4 : 3;

  validateEvidenceIds(
    state.draft.profileSummary.evidenceIds,
    evidenceMap,
    'profile summary',
    errors
  );

  if (state.draft.technicalScope.length !== expectedScopes) {
    errors.push(`technical scope must contain exactly ${expectedScopes} lines`);
  }

  for (const [index, scope] of state.draft.technicalScope.entries()) {
    if (!scope.label || !scope.text) errors.push(`technical scope ${index + 1} is incomplete`);
    validateEvidenceIds(scope.evidenceIds, evidenceMap, `technical scope ${index + 1}`, errors);
  }

  if (!state.draft.projects.length) errors.push('no grounded projects selected');
  for (const project of state.draft.projects) {
    if (!projects.some((item) => item.slug === project.sourceId)) {
      errors.push(`unknown project source: ${project.sourceId}`);
    }
    if (!project.narrative) errors.push(`project ${project.sourceId} has no narrative`);
    validateEvidenceIds(project.evidenceIds, evidenceMap, `project ${project.sourceId}`, errors);

    for (const id of project.evidenceIds) {
      const source = evidenceMap.get(id);
      if (source && (source.sourceType !== 'project' || source.sourceId !== project.sourceId)) {
        errors.push(`project ${project.sourceId} cites unrelated evidence ${id}`);
      }
    }
  }

  if (!state.draft.experiences.length) errors.push('no grounded experiences selected');
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

    for (const id of experience.evidenceIds) {
      const source = evidenceMap.get(id);
      if (
        source &&
        (source.sourceType !== 'experience' || source.sourceId !== experience.sourceId)
      ) {
        errors.push(`experience ${experience.sourceId} cites unrelated evidence ${id}`);
      }
    }
  }

  if (!state.draft.certifications.length) errors.push('no grounded certifications selected');
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

    for (const id of certification.evidenceIds) {
      const source = evidenceMap.get(id);
      if (
        source &&
        (source.sourceType !== 'certification' || source.sourceId !== certification.sourceId)
      ) {
        errors.push(`certification ${certification.sourceId} cites unrelated evidence ${id}`);
      }
    }
  }

  return { validationErrors: errors };
}

const workflow = new StateGraph(CvState)
  .addNode('retrieve', retrieveNode)
  .addNode('composeCv', draftNode)
  .addNode('validate', validateNode)
  .addEdge(START, 'retrieve')
  .addEdge('retrieve', 'composeCv')
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
  return (
    project.productUrl ||
    project.repoUrl ||
    `https://farismnrr.com/projects/${encodeURIComponent(project.slug)}`
  );
}

function projectMeta(slug: string) {
  const project = projects.find((item) => item.slug === slug);
  if (!project) return '';
  const company = experiences.find((item) => item.projects.includes(slug))?.company;
  return [company, project.year].filter(Boolean).join(' | ');
}

async function renderPdf(draft: CvDraft, target: CvTarget) {
  const headline =
    target === 'general'
      ? 'Software Engineer'
      : target
          .split('-')
          .map((part) => part[0]?.toUpperCase() + part.slice(1))
          .join(' ');

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

  const response = await fetch('/api/cv/render', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: profile.name,
      headline,
      contact: contactLine(),
      profileSummary: draft.profileSummary.text,
      technicalScope: draft.technicalScope.map(({ label, text }) => ({ label, text })),
      projects: selectedProjects,
      experiences: selectedExperiences,
      certifications: selectedCertifications,
      educationLines,
      maxPages: target === 'general' ? 2 : 1
    })
  });

  if (!response.ok) {
    throw new Error(`CV renderer failed with status ${response.status}`);
  }

  const blob = await response.blob();
  if (blob.size < 5_000) throw new Error('CV renderer returned an unexpectedly small PDF.');

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'Faris_Munir_Mahdi_CV.pdf';
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

export async function generateGeneralCv() {
  return generateCv('general');
}
