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

function unquote(value: string) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) return trimmed.slice(1, -1);
  return trimmed;
}

function parseList(value: string) {
  const trimmed = value.trim();
  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) return [];
  return trimmed.slice(1, -1).split(',').map((item) => unquote(item)).filter(Boolean);
}

function parseProject(path: string, source: string): ProjectDocument {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`${path}: missing project frontmatter`);
  const values = new Map<string, string>();
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const separator = line.indexOf(':');
    if (separator < 1) throw new Error(`${path}: invalid frontmatter line "${line}"`);
    values.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
  }
  const required = ['id','order','slug','year','title','cardTitle','subtitle','role','category','description','image','tech','productUrl','repoUrl'];
  for (const key of required) if (!values.has(key)) throw new Error(`${path}: missing frontmatter key "${key}"`);
  const order = Number(values.get('order'));
  if (!Number.isInteger(order)) throw new Error(`${path}: order must be an integer`);
  const tech = parseList(values.get('tech') ?? '');
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
    image: unquote(values.get('image') ?? ''),
    tech,
    productUrl: unquote(values.get('productUrl') ?? ''),
    repoUrl: unquote(values.get('repoUrl') ?? ''),
    markdown: match[2].trim()
  };
}

export const projects = Object.entries(modules).map(([path, source]) => parseProject(path, source)).sort((a, b) => a.order - b.order);
export function getProjectBySlug(slug: string) { return projects.find((project) => project.slug === slug); }
export function getProjectByPath(path: string) { const slug = path.split('/').filter(Boolean).at(-1) ?? ''; return getProjectBySlug(slug); }
