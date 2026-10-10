import { parseFrontmatter, requireKeys, unquote } from './content';

export interface Certification {
  order: number;
  group: string;
  issuer: string;
  title: string;
  year: string;
  credentialId: string;
  url: string;
  image: string;
}

export interface Publication {
  order: number;
  type: 'journal' | 'thesis' | 'project-report';
  title: string;
  year: string;
  venue: string;
  url: string;
  doi: string;
  summary: string;
}

const certificationModules = import.meta.glob('../../content/certifications/*.md', {
  eager: true,
  query: '?meta',
  import: 'default'
}) as Record<string, string>;

const publicationModules = import.meta.glob('../../content/publications/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>;

function int(path: string, value: string | undefined) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) throw new Error(`${path}: order must be an integer`);
  return parsed;
}

export const certifications: Certification[] = Object.entries(certificationModules)
  .map(([path, source]) => {
    const { values } = parseFrontmatter(path, source);
    requireKeys(path, values, ['order','group','issuer','title','year','credentialId','url','image']);
    return {
      order: int(path, values.get('order')),
      group: unquote(values.get('group') ?? ''),
      issuer: unquote(values.get('issuer') ?? ''),
      title: unquote(values.get('title') ?? ''),
      year: unquote(values.get('year') ?? ''),
      credentialId: unquote(values.get('credentialId') ?? ''),
      url: unquote(values.get('url') ?? ''),
      image: unquote(values.get('image') ?? '')
    };
  })
  .sort((a, b) => a.order - b.order);

export const publications: Publication[] = Object.entries(publicationModules)
  .map(([path, source]) => {
    const { values, body } = parseFrontmatter(path, source);
    requireKeys(path, values, ['order','type','title','year','venue','url','doi']);
    const type = unquote(values.get('type') ?? '') as Publication['type'];
    if (!['journal','thesis','project-report'].includes(type)) throw new Error(`${path}: unsupported publication type`);
    return {
      order: int(path, values.get('order')),
      type,
      title: unquote(values.get('title') ?? ''),
      year: unquote(values.get('year') ?? ''),
      venue: unquote(values.get('venue') ?? ''),
      url: unquote(values.get('url') ?? ''),
      doi: unquote(values.get('doi') ?? ''),
      summary: body
    };
  })
  .sort((a, b) => a.order - b.order);
