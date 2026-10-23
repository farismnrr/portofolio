import { parseFrontmatter, parseInlineList, requireKeys, unquote } from './content';

export interface CvEditorialProject {
  sourceId: string;
  cvTitle: string;
  narrative: string;
  techStack: string;
}

export interface CvEditorialCertification {
  sourceId: string;
}

export interface CvEditorial {
  profileSummary: { text: string };
  projects: CvEditorialProject[];
  certifications: CvEditorialCertification[];
  excludeExperienceOrders: number[];
  experienceDescriptions: Record<string, string>;
  experienceTitles: Record<string, string>;
  educationNote: string;
}

const modules = import.meta.glob('../../content/cv/editorial/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>;

function orderOf(path: string, value: string | undefined) {
  const order = Number(value);
  if (!Number.isInteger(order)) throw new Error(`${path}: order must be an integer`);
  return order;
}

const entries = Object.entries(modules).map(([path, source]) => {
  const { values, body } = parseFrontmatter(path, source);
  requireKeys(path, values, ['order', 'kind']);
  return {
    path,
    order: orderOf(path, values.get('order')),
    kind: unquote(values.get('kind') ?? ''),
    sourceId: unquote(values.get('sourceId') ?? ''),
    cvTitle: unquote(values.get('cvTitle') ?? ''),
    techStack: unquote(values.get('techStack') ?? ''),
    excludeExperienceOrders: parseInlineList(values.get('excludeExperienceOrders') ?? '')
      .map(Number),
    educationNote: unquote(values.get('educationNote') ?? ''),
    body
  };
}).sort((left, right) => left.order - right.order);

const profileSummary = entries.find((entry) => entry.kind === 'profile-summary');
const settings = entries.find((entry) => entry.kind === 'settings');
if (!profileSummary?.body) throw new Error('CV editorial Markdown needs a profile summary.');
if (!settings) throw new Error('CV editorial Markdown needs a settings entry.');

const projects = entries.filter((entry) => entry.kind === 'project');
const certifications = entries.filter((entry) => entry.kind === 'certification');
const experiences = entries.filter((entry) => entry.kind === 'experience');
for (const entry of [...projects, ...certifications, ...experiences]) {
  requireKeys(entry.path, new Map([['sourceId', entry.sourceId]]), ['sourceId']);
  if (entry.kind !== 'certification' && !entry.body) {
    throw new Error(`${entry.path}: CV narrative must not be empty`);
  }
}

export const cvEditorial: CvEditorial = {
  profileSummary: { text: profileSummary.body },
  projects: projects.map((entry) => ({
    sourceId: entry.sourceId,
    cvTitle: entry.cvTitle,
    narrative: entry.body,
    techStack: entry.techStack
  })),
  certifications: certifications.map(({ sourceId }) => ({ sourceId })),
  excludeExperienceOrders: settings.excludeExperienceOrders,
  experienceDescriptions: Object.fromEntries(experiences.map((entry) => [entry.sourceId, entry.body])),
  experienceTitles: Object.fromEntries(experiences
    .filter((entry) => entry.cvTitle)
    .map((entry) => [entry.sourceId, entry.cvTitle])),
  educationNote: settings.educationNote
};
