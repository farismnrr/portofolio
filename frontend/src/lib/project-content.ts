import { parseFrontmatter, parseInlineList, requireKeys, unquote } from './content';

export interface ProjectDocument {
  id: string;
  order: number;
  slug: string;
  year: string;
  title: string;
  cardTitle: string;
  subtitle: string;
  role: string;
  kind: 'Personal' | 'Professional';
  category: string;
  description: string;
  image: string;
  imageAlt: string;
  images: string[];
  imageAlts: string[];
  tech: string[];
  techGroups?: ProjectTechGroup[];
  productUrl: string;
  repoUrl: string;
  site: string;
}

export interface ProjectTechGroup {
  label: string;
  items: string[];
}

const modules = import.meta.glob('../../content/projects/*.md', {
  eager: true,
  query: '?meta',
  import: 'default'
}) as Record<string, string>;

function optimizedProjectImage(value: string) {
  if (!value.startsWith('/images/projects/')) return value;
  return value.replace(/\.(?:png|jpe?g)$/i, '-1280.webp');
}

function parseTechGroups(path: string, value: string): ProjectTechGroup[] {
  return parseInlineList(value).map((entry) => {
    const separator = entry.indexOf('::');
    if (separator < 1) throw new Error(`${path}: techGroups entries must have a label and technologies`);

    const label = entry.slice(0, separator).trim();
    const items = entry.slice(separator + 2).split('|').map((item) => item.trim()).filter(Boolean);
    if (!label || !items.length) throw new Error(`${path}: techGroups entries must have a label and technologies`);
    return { label, items };
  });
}

/** Covers that are screenshots of a whole screen and must be shown without cropping. */
const uncroppedCovers = ['parentify', 'ai-workspace'];

export function isUncroppedCover(slug: string) {
  return uncroppedCovers.includes(slug);
}

export function projectImageSrcset(value: string) {
  const match = value.match(/^(.*)-1280\.webp$/);
  if (!match) return '';
  return [640, 1280].map((width) => `${match[1]}-${width}.webp ${width}w`).join(', ');
}

function parseProject(path: string, source: string): ProjectDocument {
  const { values } = parseFrontmatter(path, source);
  const required = ['id','order','slug','year','title','cardTitle','subtitle','role','kind','category','description','image','productUrl','repoUrl'];
  requireKeys(path, values, required);

  const order = Number(values.get('order'));
  if (!Number.isInteger(order)) throw new Error(`${path}: order must be an integer`);

  const techGroups = parseTechGroups(path, values.get('techGroups') ?? '');
  const tech = techGroups.length
    ? techGroups.flatMap((group) => group.items)
    : parseInlineList(values.get('tech') ?? '');
  if (!tech.length) throw new Error(`${path}: tech must contain at least one item`);

  const kind = unquote(values.get('kind') ?? '');
  if (kind !== 'Personal' && kind !== 'Professional') {
    throw new Error(`${path}: kind must be Personal or Professional`);
  }

  const image = optimizedProjectImage(unquote(values.get('image') ?? ''));
  const declaredImages = parseInlineList(values.get('images') ?? '');
  const sourceImages = declaredImages.length ? declaredImages : [unquote(values.get('image') ?? '')];
  const images = sourceImages
    .map(optimizedProjectImage);
  const imageAlts = parseInlineList(values.get('imageAlts') ?? '');
  if (imageAlts.length && imageAlts.length !== images.length) {
    throw new Error(`${path}: imageAlts must have one entry for each image`);
  }
  const productUrl = unquote(values.get('productUrl') ?? '');
  const repoUrl = unquote(values.get('repoUrl') ?? '');

  return {
    id: unquote(values.get('id') ?? ''),
    order,
    slug: unquote(values.get('slug') ?? ''),
    year: unquote(values.get('year') ?? ''),
    title: unquote(values.get('title') ?? ''),
    cardTitle: unquote(values.get('cardTitle') ?? ''),
    subtitle: unquote(values.get('subtitle') ?? ''),
    role: unquote(values.get('role') ?? ''),
    kind,
    category: unquote(values.get('category') ?? ''),
    description: unquote(values.get('description') ?? ''),
    image,
    imageAlt: unquote(values.get('imageAlt') ?? `${unquote(values.get('cardTitle') ?? '')} project cover`),
    images,
    imageAlts,
    tech,
    ...(techGroups.length ? { techGroups } : {}),
    productUrl,
    repoUrl,
    site: productUrl || repoUrl || '-'
  };
}

export const projects = Object.entries(modules)
  .map(([path, source]) => parseProject(path, source))
  .sort((a, b) => a.order - b.order);

export function getLatestProjects(limit: number) {
  return [...projects]
    .sort((a, b) => Number(b.year) - Number(a.year) || a.order - b.order)
    .slice(0, limit);
}

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}
