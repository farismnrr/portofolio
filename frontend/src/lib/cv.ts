import { certifications, education, experiences, profile } from './structured-content';
import { projects } from './project-content';
import { CV_CONTRACT_VERSION, getCvProfile, type CvTarget } from './cv-profiles';
import editorial from '../../content/cv-editorial.json';

interface CvDraft {
  profileSummary: { text: string };
  projects: { sourceId: string; narrative: string; techStack?: string }[];
  certifications: { sourceId: string }[];
  excludeExperienceOrders?: number[];
  professionalExperienceOrders?: number[];
  experienceDescriptions?: Record<string, string>;
  educationNote?: string;
}

function contactLine() {
  const email = profile.email.replace(/^mailto:/, '');
  return [
    email,
    '+62 852-1565-2903',
    'Portfolio: https://farismnrr.com',
    profile.github.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    profile.linkedin.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')
  ].join(' | ');
}

function absolutePortfolioUrl(value: string) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `https://farismnrr.com${value.startsWith('/') ? value : `/${value}`}`;
}

function projectMeta(slug: string) {
  const project = projects.find((item) => item.slug === slug);
  if (!project) return '';
  if (project.productUrl.toLowerCase() === 'nda') return 'Private project, under NDA';
  const publicUrl = [project.productUrl, project.repoUrl].find((url) => /^https?:\/\//i.test(url));
  return publicUrl?.replace(/^https?:\/\//i, '').replace(/\/$/, '') ?? '';
}

function projectCvTitle(slug: string, title: string) {
  const names: Record<string, string> = {
    'sensio-notes': 'Sensio Notes',
    'sensio-iot': 'Sensio IoT',
    'portfolio-website': 'Personal Portfolio',
    'ai-workspace': 'Masih Awam Workspace',
    iotnet: 'IoTNet'
  };
  return names[slug] ?? title;
}

function cvDate(value: string) {
  return value
    .replace(/\bJan\b/g, 'January')
    .replace(/\bFeb\b/g, 'February')
    .replace(/\bMar\b/g, 'March')
    .replace(/\bApr\b/g, 'April')
    .replace(/\bJun\b/g, 'June')
    .replace(/\bJul\b/g, 'July')
    .replace(/\bAug\b/g, 'August')
    .replace(/\bSep\b/g, 'September')
    .replace(/\bOct\b/g, 'October')
    .replace(/\bNov\b/g, 'November')
    .replace(/\bDec\b/g, 'December')
    .replace(/\s*[—–-]\s*/g, ' – ');
}

function experienceCvTitle(order: number, role: string, company: string) {
  const programTitles: Record<number, string> = {
    2: 'Machine Learning Track',
    3: 'Full Stack Development',
    4: 'Backend Engineering Program',
    5: 'SEO Trainee',
    6: 'Cloud Computing'
  };
  return `${programTitles[order] ?? role} | ${company}`;
}

export function buildCvRenderRequest(draft: CvDraft, target: CvTarget) {
  const cvProfile = getCvProfile(target);

  const selectedExperiences = experiences
    .filter((source) => !draft.excludeExperienceOrders?.includes(source.order))
    .map((source) => {

      const professional = source.kind === 'employment' || Boolean(draft.professionalExperienceOrders?.includes(source.order));

      return {
        kind: professional ? 'employment' : source.kind,
        title: experienceCvTitle(source.order, source.role, source.company),
        meta: cvDate(source.year),
        summary: draft.experienceDescriptions?.[String(source.order)] ?? '',
        relatedProjects: [],
        bullets: []
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const selectedProjects = draft.projects
    .map((item) => {
      const source = projects.find((project) => project.slug === item.sourceId);
      if (!source) return null;

      return {
        title: projectCvTitle(source.slug, source.title),
        kind: source.kind,
        meta: projectMeta(source.slug),
        narrative: item.narrative,
        techStack: item.techStack ?? [...new Set(source.tech)].join(', '),
        url: ''
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
        title: source.group === 'BNSP' ? `BNSP: ${source.title}` : source.title,
        meta: [source.issuer, cvDate(source.year)].filter(Boolean).join(' | '),
        url: absolutePortfolioUrl(source.url)
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const degreeNote = draft.educationNote ? ` | ${draft.educationNote}` : '';
  const educationLines = education.filter((item) => !education.some((entry) => /bachelor|master|doctor/i.test(entry.program)) || /bachelor|master|doctor/i.test(item.program)).map((item) =>
    [item.institution, item.program, item.year].filter(Boolean).join(' | ') + (/bachelor|master|doctor/i.test(item.program) ? degreeNote : '')
  );


  return {
      contractVersion: CV_CONTRACT_VERSION,
      profileId: cvProfile.id,
      name: profile.name,
      headline: cvProfile.headline,
      contact: contactLine(),
      profileSummary: draft.profileSummary.text,
      technicalScope: cvProfile.technicalScopes.map((scope) => ({
        label: scope.label,
        text: scope.guidance
      })),
      projects: selectedProjects,
      experiences: selectedExperiences,
      certifications: selectedCertifications,
      educationLines,
      maxPages: cvProfile.maxPages
    };
}


export function buildLatestCv() {
  return buildCvRenderRequest(editorial, 'general');
}
