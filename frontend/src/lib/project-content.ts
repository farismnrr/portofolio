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
  images: string[];
  tech: string[];
  productUrl: string;
  repoUrl: string;
  site: string;
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
  const required = ['id','order','slug','year','title','cardTitle','subtitle','role','kind','category','description','image','tech','productUrl','repoUrl'];
  requireKeys(path, values, required);

  const order = Number(values.get('order'));
  if (!Number.isInteger(order)) throw new Error(`${path}: order must be an integer`);

  const tech = parseInlineList(values.get('tech') ?? '');
  if (!tech.length) throw new Error(`${path}: tech must contain at least one item`);

  const kind = unquote(values.get('kind') ?? '');
  if (kind !== 'Personal' && kind !== 'Professional') {
    throw new Error(`${path}: kind must be Personal or Professional`);
  }

  const image = optimizedProjectImage(unquote(values.get('image') ?? ''));
  const declaredImages = parseInlineList(values.get('images') ?? '');
  const images = (declaredImages.length ? declaredImages : [unquote(values.get('image') ?? '')])
    .map(optimizedProjectImage);
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
    images,
    tech,
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
