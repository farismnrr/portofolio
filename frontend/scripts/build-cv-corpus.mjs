import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  coveredMonths,
  durationMonths,
  formatMonthKey,
  parseExperiencePeriod
} from './lib/experience-duration.mjs';

const root = path.resolve(process.cwd(), 'content');
const out = path.resolve(process.cwd(), 'public/cv-corpus.json');
const buildNow = new Date();

function parseFrontmatter(source) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: source };

  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    meta[key] = value;
  }

  return { meta, body: match[2].trim() };
}

function inlineList(value = '') {
  const trimmed = String(value).trim();
  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) return [];

  return trimmed
    .slice(1, -1)
    .split(',')
    .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}

function cleanMarkdown(value) {
  return value
    .replace(/\x60{3}[\s\S]*?\x60{3}/g, ' ')
    .replace(/!\[[^\]]*\]\([^\)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/[*_#>~]/g, ' ')
    .replace(/^[-+]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function sections(body) {
  const lines = body.split(/\r?\n/);
  const result = [];
  let title = 'overview';
  let buffer = [];

  const flush = () => {
    const content = cleanMarkdown(buffer.join('\n'));
    if (content) result.push({ title, content });
    buffer = [];
  };

  for (const line of lines) {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      flush();
      title =
        cleanMarkdown(heading[1])
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || 'section';
    } else {
      buffer.push(line);
    }
  }

  flush();
  return result;
}

async function readDir(name) {
  const dir = path.join(root, name);
  const files = (await fs.readdir(dir))
    .filter((file) => file.endsWith('.md'))
    .sort();

  return Promise.all(
    files.map(async (file) => ({
      file,
      source: await fs.readFile(path.join(dir, file), 'utf8')
    }))
  );
}

const chunks = [];

const experienceSources = await readDir('experience');
const experienceEntries = experienceSources.map(({ file, source }) => {
  const parsed = parseFrontmatter(source);
  if (!parsed.meta.year) throw new Error(`${file}: experience year is required`);
  let period;
  try {
    period = parseExperiencePeriod(parsed.meta.year, buildNow);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${file}: ${message}`);
  }
  return { file, ...parsed, period };
});

const projectCompanies = new Map();
for (const { meta } of experienceEntries) {
  for (const slug of inlineList(meta.projects)) {
    const companies = projectCompanies.get(slug) ?? new Set();
    if (meta.company) companies.add(meta.company);
    projectCompanies.set(slug, companies);
  }
}

for (const { file, source } of await readDir('projects')) {
  const { meta, body } = parseFrontmatter(source);
  const slug = meta.slug || path.basename(file, '.md');
  const tech = inlineList(meta.tech);
  const base = [
    meta.title,
    meta.cardTitle,
    meta.subtitle,
    meta.description,
    meta.role,
    meta.category,
    meta.year,
    Array.from(projectCompanies.get(slug) ?? []).join(', '),
    tech.join(', ')
  ]
    .filter(Boolean)
    .join('. ');

  chunks.push({
    id: 'project:' + slug + ':summary',
    sourceType: 'project',
    sourceId: slug,
    section: 'summary',
    company: Array.from(projectCompanies.get(slug) ?? []).join(', '),
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
      company: Array.from(projectCompanies.get(slug) ?? []).join(', '),
      skills: tech,
      roleTags: [meta.role, meta.category].filter(Boolean),
      content: (meta.title || meta.cardTitle || slug) + '. ' + section.content
    });
  }
}

for (const { file, meta, body, period } of experienceEntries) {
  const id = String(meta.order || path.basename(file, '.md'));
  const tech = inlineList(meta.tech);
  const projects = inlineList(meta.projects);
  const durationLabel = period.isPresent
    ? `Calculated duration through ${formatMonthKey(period.end)}: ${durationMonths(period)} calendar months`
    : `Calculated duration: ${durationMonths(period)} calendar months`;
  const content = cleanMarkdown(
    [
      meta.role,
      meta.company,
      meta.year,
      durationLabel,
      meta.location,
      meta.summary,
      body,
      projects.length ? 'Linked projects: ' + projects.join(', ') : ''
    ]
      .filter(Boolean)
      .join('. ')
  );

  chunks.push({
    id: 'experience:' + id + ':summary',
    sourceType: 'experience',
    kind: meta.kind || 'employment',
    sourceId: id,
    section: 'summary',
    company: meta.company || '',
    skills: tech,
    roleTags: [meta.role].filter(Boolean),
    content
  });
}

const employmentEntries = experienceEntries.filter(({ meta }) => (meta.kind || 'employment') === 'employment');
const programEntries = experienceEntries.filter(({ meta }) => meta.kind === 'program');
const asOf = formatMonthKey(Math.max(...experienceEntries.map(({ period }) => period.end)));
const individualDurations = experienceEntries
  .map(({ meta, period }) => `${meta.role || 'Experience'} at ${meta.company || 'Unknown'} (${meta.kind || 'employment'}, ${meta.year}): ${durationMonths(period)} calendar months`)
  .join('; ');

chunks.push({
  id: 'experience:duration-summary',
  sourceType: 'experience',
  kind: 'computed-duration',
  sourceId: 'duration-summary',
  section: 'computed-duration',
  company: '',
  skills: [],
  roleTags: ['experience duration'],
  content: cleanMarkdown(
    [
      `Deterministic calendar-month duration summary as of ${asOf}`,
      `Employment history covers ${coveredMonths(employmentEntries.map(({ period }) => period))} calendar months after overlapping employment periods are counted once. This is role-agnostic employment-history arithmetic; role relevance must be assessed separately`,
      `Structured program history covers ${coveredMonths(programEntries.map(({ period }) => period))} calendar months after overlaps are counted once. Program time is not professional employment tenure`,
      `Combined dated employment and structured programs cover ${coveredMonths(experienceEntries.map(({ period }) => period))} calendar months after overlaps are counted once. This broader dated coverage must not be described as professional employment tenure`,
      `Individual dated records: ${individualDurations}`
    ].join('. ')
  )
});

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
    content: cleanMarkdown(
      (meta.title || 'Skills') + ': ' + items.join(', ') + '. ' + body
    )
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
    content: cleanMarkdown(
      [meta.institution, meta.program, meta.year, body].filter(Boolean).join('. ')
    )
  });
}

for (const { file, source } of await readDir('certifications')) {
  const { meta } = parseFrontmatter(source);
  const id = String(meta.order || path.basename(file, '.md'));

  chunks.push({
    id: 'certification:' + id + ':summary',
    sourceType: 'certification',
    sourceId: id,
    section: 'summary',
    company: meta.issuer || '',
    skills: [],
    roleTags: [meta.group, meta.issuer].filter(Boolean),
    content: cleanMarkdown(
      [
        meta.title,
        meta.issuer,
        meta.group,
        meta.year,
        meta.credentialId
      ]
        .filter(Boolean)
        .join('. ')
    )
  });
}

for (const { file, source } of await readDir('publications')) {
  const { meta, body } = parseFrontmatter(source);
  const id = String(meta.order || path.basename(file, '.md'));
  chunks.push({
    id: 'publication:' + id + ':summary', sourceType: 'publication', sourceId: id,
    section: meta.type || 'publication', company: meta.venue || '', skills: [], roleTags: ['research'],
    content: cleanMarkdown([meta.title, meta.year, meta.venue, meta.doi, body].filter(Boolean).join('. '))
  });
}

for (const { file, source } of await readDir('blog')) {
  const { meta, body } = parseFrontmatter(source);
  const id = meta.slug || path.basename(file, '.md');
  chunks.push({ id: 'blog:' + id + ':article', sourceType: 'blog', sourceId: id,
    section: 'article', company: '', skills: [], roleTags: [meta.category].filter(Boolean),
    content: cleanMarkdown([meta.title, meta.excerpt, body].filter(Boolean).join('. ')) });
}
for (const { file, source } of await readDir('principles')) {
  const { meta, body } = parseFrontmatter(source);
  const id = String(meta.order || path.basename(file, '.md'));
  chunks.push({ id: 'principle:' + id + ':summary', sourceType: 'principle', sourceId: id,
    section: 'engineering principle', company: '', skills: [], roleTags: ['engineering approach'],
    content: cleanMarkdown([meta.title, body].filter(Boolean).join('. ')) });
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
    content: cleanMarkdown(
      [
        meta.name,
        meta.role,
        meta.headline,
        meta.specialties,
        meta.intro,
        meta.availability,
        body
      ]
        .filter(Boolean)
        .join('. ')
    )
  });
}

await fs.writeFile(out, JSON.stringify(chunks, null, 2) + '\n');
console.log(
  'Generated ' +
    chunks.length +
    ' grounded CV evidence chunks -> ' +
    path.relative(process.cwd(), out)
);
