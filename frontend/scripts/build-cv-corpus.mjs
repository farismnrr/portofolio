import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), 'content');
const out = path.resolve(process.cwd(), 'public/cv-corpus.json');

function parseFrontmatter(source) {
  const match = source.match(/^---\\s*\\n([\\s\\S]*?)\\n---\\s*\\n?([\\s\\S]*)$/);
  if (!match) return { meta: {}, body: source };
  const meta = {};
  for (const line of match[1].split(/\\r?\\n/)) {
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    meta[key] = value;
  }
  return { meta, body: match[2].trim() };
}

function inlineList(value = '') {
  const trimmed = String(value).trim();
  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) return [];
  return trimmed.slice(1, -1).split(',').map((item) => item.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
}

function cleanMarkdown(value) {
  return value
    .replace(/```[\\s\\S]*?```/g, ' ')
    .replace(/!\\[[^\\]]*\\]\\([^\\)]+\\)/g, ' ')
    .replace(/\\[([^\\]]+)\\]\\([^\\)]+\\)/g, '$1')
    .replace(/[*_#>~]/g, ' ')
    .replace(/^[-+]\\s+/gm, '')
    .replace(/\\s+/g, ' ')
    .trim();
}

function sections(body) {
  const lines = body.split(/\\r?\\n/);
  const result = [];
  let title = 'overview';
  let buffer = [];
  const flush = () => {
    const content = cleanMarkdown(buffer.join('\\n'));
    if (content) result.push({ title, content });
    buffer = [];
  };
  for (const line of lines) {
    const heading = line.match(/^##\\s+(.+)$/);
    if (heading) {
      flush();
      title = cleanMarkdown(heading[1]).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
    } else {
      buffer.push(line);
    }
  }
  flush();
  return result;
}

async function readDir(name) {
  const dir = path.join(root, name);
  const files = (await fs.readdir(dir)).filter((file) => file.endsWith('.md')).sort();
  return Promise.all(files.map(async (file) => ({ file, source: await fs.readFile(path.join(dir, file), 'utf8') })));
}

const chunks = [];

for (const { file, source } of await readDir('projects')) {
  const { meta, body } = parseFrontmatter(source);
  const slug = meta.slug || path.basename(file, '.md');
  const tech = inlineList(meta.tech);
  const base = [meta.title, meta.cardTitle, meta.subtitle, meta.description, meta.role, meta.category, tech.join(', ')].filter(Boolean).join('. ');

  chunks.push({
    id: 'project:' + slug + ':summary',
    sourceType: 'project',
    sourceId: slug,
    section: 'summary',
    company: '',
    skills: tech,
    roleTags: [meta.role, meta.category].filter(Boolean),
    content: cleanMarkdown(base)
  });

  for (const section of sections(body)) {
    chunks.push({
      id: 'project:' + slug + ':' + section.title,
      sourceType: 'project',
      sourceId: slug,
      section: section.title,
      company: '',
      skills: tech,
      roleTags: [meta.role, meta.category].filter(Boolean),
      content: (meta.title || meta.cardTitle || slug) + '. ' + section.content
    });
  }
}

for (const { file, source } of await readDir('experience')) {
  const { meta, body } = parseFrontmatter(source);
  const id = String(meta.order || path.basename(file, '.md'));
  const tech = inlineList(meta.tech);
  const projects = inlineList(meta.projects);
  const content = cleanMarkdown([
    meta.role,
    meta.company,
    meta.year,
    meta.location,
    meta.summary,
    body,
    projects.length ? 'Linked projects: ' + projects.join(', ') : ''
  ].filter(Boolean).join('. '));

  chunks.push({
    id: 'experience:' + id + ':summary',
    sourceType: 'experience',
    sourceId: id,
    section: 'summary',
    company: meta.company || '',
    skills: tech,
    roleTags: [meta.role].filter(Boolean),
    content
  });
}

for (const { file, source } of await readDir('skills')) {
  const { meta, body } = parseFrontmatter(source);
  const id = String(meta.order || path.basename(file, '.md'));
  const items = inlineList(meta.items);
  chunks.push({
    id: 'skill:' + id + ':summary',
    sourceType: 'skill',
    sourceId: id,
    section: meta.title || 'skills',
    company: '',
    skills: items,
    roleTags: [meta.title].filter(Boolean),
    content: cleanMarkdown((meta.title || 'Skills') + ': ' + items.join(', ') + '. ' + body)
  });
}

for (const { file, source } of await readDir('education')) {
  const { meta, body } = parseFrontmatter(source);
  const id = String(meta.order || path.basename(file, '.md'));
  chunks.push({
    id: 'education:' + id + ':summary',
    sourceType: 'education',
    sourceId: id,
    section: 'summary',
    company: '',
    skills: [],
    roleTags: ['education'],
    content: cleanMarkdown([meta.institution, meta.program, meta.year, body].filter(Boolean).join('. '))
  });
}

for (const { file, source } of await readDir('profile')) {
  const { meta, body } = parseFrontmatter(source);
  chunks.push({
    id: 'profile:' + path.basename(file, '.md') + ':summary',
    sourceType: 'profile',
    sourceId: path.basename(file, '.md'),
    section: 'summary',
    company: '',
    skills: [],
    roleTags: [meta.role, meta.specialties].filter(Boolean),
    content: cleanMarkdown([meta.name, meta.role, meta.headline, meta.specialties, meta.intro, meta.availability, body].filter(Boolean).join('. '))
  });
}

await fs.writeFile(out, JSON.stringify(chunks, null, 2) + '\\n');
console.log('Generated ' + chunks.length + ' grounded CV evidence chunks -> ' + path.relative(process.cwd(), out));
