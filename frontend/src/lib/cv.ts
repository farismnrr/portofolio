import { certifications, education, experiences, profile } from './structured-content';
import { projects } from './project-content';
import { CV_CONTRACT_VERSION, getCvProfile, type CvTarget } from './cv-profiles';
import editorial from '../../content/cv-editorial.json';

interface CvDraft {
  profileSummary: { text: string };
  projects: { sourceId: string; narrative: string }[];
  certifications: { sourceId: string }[];
  employmentBullets?: string[];
  excludeExperienceOrders?: number[];
  employmentSummary?: string;
  professionalExperienceOrders?: number[];
  experienceBullets?: Record<string, string[]>;
}

function contactLine() {
  const email = profile.email.replace(/^mailto:/, '');
  return [
    email,
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

function projectWebUrl(slug: string) {
  const project = projects.find((item) => item.slug === slug);
  if (!project) return '';
  return `https://farismnrr.com/projects/${encodeURIComponent(project.slug)}`;
}

function projectMeta(slug: string) {
  const project = projects.find((item) => item.slug === slug);
  if (!project) return '';
  const company = experiences.find((item) => item.projects.includes(slug))?.company;
  const link = (project.productUrl || project.repoUrl).replace(/^https?:\/\//, '').replace(/\/$/, '');
  return [company, link, project.year].filter(Boolean).join(' | ');
}

function cvPlainText(value: string) {
  return value.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*/g, '').replace(/^I work /, 'Works ').replace(/^I build /, 'Builds ').replace(/^I also handle /, 'Handles ');
}

export function buildCvRenderRequest(draft: CvDraft, target: CvTarget) {
  const cvProfile = getCvProfile(target);

  const selectedExperiences = experiences
    .filter((source) => !draft.excludeExperienceOrders?.includes(source.order))
    .map((source) => {

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

      const professional = source.kind === 'employment' || Boolean(draft.professionalExperienceOrders?.includes(source.order));

      return {
        kind: professional ? 'employment' : source.kind,
        title: `${source.role} | ${source.company}`,
        meta: [source.year, source.location].filter(Boolean).join(' | '),
        summary: source.kind === 'program' ? '' : source.order === 1 && draft.employmentSummary ? draft.employmentSummary : cvPlainText(source.summary),
        relatedProjects: [] as typeof relatedProjects,
        bullets: source.kind === 'employment' && source.order === 1 && draft.employmentBullets ? draft.employmentBullets : draft.experienceBullets?.[String(source.order)] ? draft.experienceBullets[String(source.order)] : source.bullets.slice(0, source.kind === 'employment' ? 4 : 1).map(cvPlainText)
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
        title: source.group === 'BNSP' ? `BNSP: ${source.title}` : source.title,
        meta: [source.issuer, source.year].filter(Boolean).join(' | '),
        url: absolutePortfolioUrl(source.url)
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const educationLines = education.filter((item) => !education.some((entry) => /bachelor|master|doctor/i.test(entry.program)) || /bachelor|master|doctor/i.test(item.program)).map((item) =>
    [item.institution, item.program, item.year].filter(Boolean).join(' | ')
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
