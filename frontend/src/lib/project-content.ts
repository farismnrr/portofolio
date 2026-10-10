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
  category: string;
  description: string;
  image: string;
  tech: string[];
  productUrl: string;
  repoUrl: string;
  markdown: string;
}

const modules = import.meta.glob('../../content/projects/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>;

function optimizedProjectImage(value: string) {
  if (!value.startsWith('/images/projects/')) return value;
  return value.replace(/\.(?:png|jpe?g)$/i, '-1280.webp');
}

export function projectImageSrcset(value: string) {
  const match = value.match(/^(.*)-1280\.webp$/);
  if (!match) return '';
  return [640, 1280].map((width) => `${match[1]}-${width}.webp ${width}w`).join(', ');
}

function parseProject(path: string, source: string): ProjectDocument {
  const { values, body } = parseFrontmatter(path, source);
  const required = ['id','order','slug','year','title','cardTitle','subtitle','role','category','description','image','tech','productUrl','repoUrl'];
  requireKeys(path, values, required);

  const order = Number(values.get('order'));
  if (!Number.isInteger(order)) throw new Error(`${path}: order must be an integer`);

  const tech = parseInlineList(values.get('tech') ?? '');
  if (!tech.length) throw new Error(`${path}: tech must contain at least one item`);

  return {
    id: unquote(values.get('id') ?? ''),
    order,
    slug: unquote(values.get('slug') ?? ''),
    year: unquote(values.get('year') ?? ''),
    title: unquote(values.get('title') ?? ''),
    cardTitle: unquote(values.get('cardTitle') ?? ''),
    subtitle: unquote(values.get('subtitle') ?? ''),
    role: unquote(values.get('role') ?? ''),
    category: unquote(values.get('category') ?? ''),
    description: unquote(values.get('description') ?? ''),
    image: optimizedProjectImage(unquote(values.get('image') ?? '')),
    tech,
    productUrl: unquote(values.get('productUrl') ?? ''),
    repoUrl: unquote(values.get('repoUrl') ?? ''),
    markdown: body
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

export function getProjectByPath(path: string) {
  const slug = path.split('/').filter(Boolean).at(-1) ?? '';
  return getProjectBySlug(slug);
}
