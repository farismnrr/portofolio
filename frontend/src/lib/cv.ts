import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { profile } from './structured-content';

export type CvTarget = 'general' | 'software-engineer' | 'ai-engineer' | 'devops';

interface Evidence {
  id: string;
  sourceType: 'project' | 'experience' | 'skill' | 'education' | 'profile';
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
  title: string;
  meta: string;
  narrative: string;
  evidenceIds: string[];
}

interface ExperienceDraft {
  sourceId: string;
  title: string;
  narrative: string;
  evidenceIds: string[];
}

interface CvDraft {
  profileSummary: GroundedText;
  technicalScope: ScopeDraft[];
  projects: ProjectDraft[];
  primaryExperience: ExperienceDraft;
  earlierExperience: GroundedText;
  educationLine: GroundedText;
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
      limit: 24
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
  const targetLabel =
    target === 'general'
      ? 'general Software Engineer'
      : target
          .split('-')
          .map((part) => part[0]?.toUpperCase() + part.slice(1))
          .join(' ');

  return [
    'You are writing a one-page ATS-friendly CV for Faris Munir Mahdi.',
    `Target: ${targetLabel}.`,
    '',
    'The visual template is already fixed. Your job is content selection and concise grounded writing.',
    'Use ONLY the EVIDENCE records below. Never invent employers, projects, dates, technologies, metrics, responsibilities, or outcomes.',
    'Every generated section must cite the exact evidence IDs it used.',
    '',
    'Return ONLY valid JSON matching this schema:',
    JSON.stringify({
      profileSummary: { text: '45-65 word professional summary', evidenceIds: ['id'] },
      technicalScope: [
        { label: 'Engineering', text: 'comma-separated scope', evidenceIds: ['id'] },
        { label: 'AI & retrieval', text: 'comma-separated scope', evidenceIds: ['id'] },
        { label: 'Inference, IoT & platform', text: 'comma-separated scope', evidenceIds: ['id'] }
      ],
      projects: [
        {
          sourceId: 'real-project-slug',
          title: 'Project Name - concise descriptor',
          meta: 'Company if evidenced | Year if evidenced',
          narrative: '45-75 word narrative explaining ownership, system, and concrete engineering evidence',
          evidenceIds: ['project evidence id']
        }
      ],
      primaryExperience: {
        sourceId: 'real experience source id',
        title: 'Role | Company | Date range',
        narrative: 'one compact sentence, ideally referring to selected work above',
        evidenceIds: ['experience evidence id']
      },
      earlierExperience: {
        text: 'one compact sentence covering only earlier roles supported by evidence',
        evidenceIds: ['experience evidence id']
      },
      educationLine: {
        text: 'Institution | Degree | Years | honors only if evidenced',
        evidenceIds: ['education evidence id']
      }
    }),
    '',
    'Writing rules:',
    '- Match a dense, polished engineering CV, not a database export.',
    '- Prefer 4 selected projects. Use at most 4.',
    '- Project narrative is the main proof of work. Do NOT output separate Stack lines or raw project URLs.',
    '- Prefer end-to-end ownership, architecture, RAG/agents, backend, infrastructure, IoT, reliability, and product evidence when supported.',
    '- Keep Technical Scope to exactly 3 compact lines.',
    '- Primary Experience should be the most recent/current relevant role when evidence supports it.',
    '- Earlier Experience must stay compact and must not invent project linkage.',
    '- Avoid generic filler such as passionate, results-driven, hardworking, cutting-edge, innovative.',
    '- No markdown, no comments, no prose outside JSON.',
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

function normalizeDraft(value: unknown): CvDraft {
  const item = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const technicalScope = Array.isArray(item.technicalScope)
    ? item.technicalScope.slice(0, 3).map((raw) => {
        const scope = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
        return {
          label: typeof scope.label === 'string' ? scope.label.trim() : '',
          text: typeof scope.text === 'string' ? scope.text.trim() : '',
          evidenceIds: stringArray(scope.evidenceIds)
        };
      })
    : [];

  const projects = Array.isArray(item.projects)
    ? item.projects.slice(0, 4).map((raw) => {
        const project = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
        return {
          sourceId: typeof project.sourceId === 'string' ? project.sourceId.trim() : '',
          title: typeof project.title === 'string' ? project.title.trim() : '',
          meta: typeof project.meta === 'string' ? project.meta.trim() : '',
          narrative: typeof project.narrative === 'string' ? project.narrative.trim() : '',
          evidenceIds: stringArray(project.evidenceIds)
        };
      })
    : [];

  const primary =
    item.primaryExperience && typeof item.primaryExperience === 'object'
      ? (item.primaryExperience as Record<string, unknown>)
      : {};

  return {
    profileSummary: groundedText(item.profileSummary),
    technicalScope,
    projects,
    primaryExperience: {
      sourceId: typeof primary.sourceId === 'string' ? primary.sourceId.trim() : '',
      title: typeof primary.title === 'string' ? primary.title.trim() : '',
      narrative: typeof primary.narrative === 'string' ? primary.narrative.trim() : '',
      evidenceIds: stringArray(primary.evidenceIds)
    },
    earlierExperience: groundedText(item.earlierExperience),
    educationLine: groundedText(item.educationLine)
  };
}

async function draftNode(state: CvStateType) {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: draftPrompt(state.target, state.evidence),
      reasoning_effort: 'medium'
    })
  });

  if (!response.ok) {
    throw new Error(`AI CV writer failed with status ${response.status}`);
  }

  const payload = (await response.json()) as AiResponse;
  return {
    draft: normalizeDraft(parseAiJson(payload.message))
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

  validateEvidenceIds(
    state.draft.profileSummary.evidenceIds,
    evidenceMap,
    'profile summary',
    errors
  );

  if (state.draft.technicalScope.length !== 3) {
    errors.push('technical scope must contain exactly 3 lines');
  }
  for (const [index, scope] of state.draft.technicalScope.entries()) {
    if (!scope.label || !scope.text) errors.push(`technical scope ${index + 1} is incomplete`);
    validateEvidenceIds(scope.evidenceIds, evidenceMap, `technical scope ${index + 1}`, errors);
  }

  if (!state.draft.projects.length) errors.push('no grounded projects selected');
  for (const project of state.draft.projects) {
    if (!project.sourceId || !project.title || !project.narrative) {
      errors.push('a selected project is incomplete');
      continue;
    }
    validateEvidenceIds(project.evidenceIds, evidenceMap, `project ${project.sourceId}`, errors);
    for (const id of project.evidenceIds) {
      const source = evidenceMap.get(id);
      if (source && (source.sourceType !== 'project' || source.sourceId !== project.sourceId)) {
        errors.push(`project ${project.sourceId} cites unrelated evidence ${id}`);
      }
    }
  }

  validateEvidenceIds(
    state.draft.primaryExperience.evidenceIds,
    evidenceMap,
    'primary experience',
    errors
  );
  for (const id of state.draft.primaryExperience.evidenceIds) {
    const source = evidenceMap.get(id);
    if (
      source &&
      (source.sourceType !== 'experience' ||
        source.sourceId !== state.draft.primaryExperience.sourceId)
    ) {
      errors.push(`primary experience cites unrelated evidence ${id}`);
    }
  }

  validateEvidenceIds(
    state.draft.earlierExperience.evidenceIds,
    evidenceMap,
    'earlier experience',
    errors
  );
  validateEvidenceIds(
    state.draft.educationLine.evidenceIds,
    evidenceMap,
    'education',
    errors
  );
  for (const id of state.draft.educationLine.evidenceIds) {
    const source = evidenceMap.get(id);
    if (source && source.sourceType !== 'education') {
      errors.push(`education cites unrelated evidence ${id}`);
    }
  }

  return { validationErrors: errors };
}

const workflow = new StateGraph(CvState)
  .addNode('retrieve', retrieveNode)
  .addNode('draft', draftNode)
  .addNode('validate', validateNode)
  .addEdge(START, 'retrieve')
  .addEdge('retrieve', 'draft')
  .addEdge('draft', 'validate')
  .addEdge('validate', END)
  .compile();

async function renderPdf(draft: CvDraft, target: CvTarget) {
  const headline =
    target === 'general'
      ? 'Software Engineer | AI Systems, Product Engineering & IoT'
      : target
          .split('-')
          .map((part) => part[0]?.toUpperCase() + part.slice(1))
          .join(' ');

  const response = await fetch('/api/cv/render', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: profile.name,
      headline,
      contact: contactLine(),
      profileSummary: draft.profileSummary.text,
      technicalScope: draft.technicalScope.map(({ label, text }) => ({ label, text })),
      projects: draft.projects.map(({ title, meta, narrative }) => ({
        title,
        meta,
        narrative
      })),
      primaryExperience: {
        title: draft.primaryExperience.title,
        narrative: draft.primaryExperience.narrative
      },
      earlierExperience: draft.earlierExperience.text,
      educationLine: draft.educationLine.text
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
