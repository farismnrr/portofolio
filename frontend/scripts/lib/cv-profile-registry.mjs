import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const profilesDirectory = path.join(scriptsDirectory, '..', 'content', 'cv-profiles');

function unquote(value) {
  return value.replace(/^['"]|['"]$/g, '');
}

function parseList(value) {
  const match = value.match(/^\[(.*)\]$/);
  if (!match) return [];
  return match[1].split(',').map((item) => unquote(item.trim())).filter(Boolean);
}

function parseNumberMap(file, value, key) {
  return Object.fromEntries(parseList(value).map((item) => {
    const [name, rawNumber] = item.split('=');
    const number = Number(rawNumber);
    if (!name || !Number.isFinite(number)) {
      throw new Error(`${file}: invalid ${key} entry "${item}"`);
    }
    return [name, number];
  }));
}

function parseProfile(file, source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`${file}: missing Markdown frontmatter`);

  const values = Object.fromEntries(match[1].split(/\r?\n/).map((line) => {
    const separator = line.indexOf(':');
    if (separator < 0) throw new Error(`${file}: invalid frontmatter line "${line}"`);
    return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
  }));
  const body = match[2];
  const section = (heading) => body.match(
    new RegExp(`### ${heading}\\n\\n([\\s\\S]*?)(?=\\n### |$)`)
  )?.[1]?.trim() ?? '';
  const technicalScopes = body.match(
    /^## Technical scopes[ \t]*\r?\n([\s\S]*?)(?=\r?\n## |$)/
  )?.[1].split(/\r?\n/).filter((line) => line.startsWith('- ')).map((line) => {
    const [key, label, ...guidance] = line.replace(/^-\s+/, '').split(' | ');
    if (!key || !label || !guidance.length) {
      throw new Error(`${file}: invalid technical scope "${line}"`);
    }
    return { key, label, guidance: guidance.join(' | ') };
  }) ?? [];
  const budgets = parseNumberMap(file, values.budgets ?? '', 'budgets');
  const minimumItems = parseNumberMap(file, values.minimumItems ?? '', 'minimumItems');

  return {
    id: unquote(values.id ?? ''),
    label: unquote(values.label ?? ''),
    headline: unquote(values.headline ?? ''),
    maxPages: Number(values.maxPages),
    filename: unquote(values.filename ?? ''),
    retrievalQuery: unquote(values.retrievalQuery ?? ''),
    preferredSignals: parseList(values.preferredSignals ?? ''),
    secondarySignals: parseList(values.secondarySignals ?? ''),
    sourceTypeWeights: parseNumberMap(file, values.sourceTypeWeights ?? '', 'sourceTypeWeights'),
    projectChunkCap: Number(values.projectChunkCap),
    enrichmentCaps: parseNumberMap(file, values.enrichmentCaps ?? '', 'enrichmentCaps'),
    technicalScopes,
    budgets: {
      projects: budgets.projects,
      experiences: budgets.experiences,
      certifications: budgets.certifications
    },
    writingPolicy: {
      identity: section('Identity'),
      focus: section('Focus'),
      summaryRange: section('Summary range'),
      projectRange: section('Project range'),
      avoid: section('Avoid').split(/\r?\n/).filter(Boolean)
        .map((line) => line.replace(/^-\s+/, ''))
    },
    layoutPolicy: {
      minSecondPageFill: Number(values.minSecondPageFill),
      minBodySizePt: Number(values.minBodySizePt),
      minimumItems: {
        projects: minimumItems.projects,
        experiences: minimumItems.experiences,
        certifications: minimumItems.certifications
      }
    }
  };
}

export async function readCvProfileRegistry() {
  const files = (await readdir(profilesDirectory)).filter((file) => file.endsWith('.md')).sort();
  const profiles = await Promise.all(files.map(async (file) => {
    const source = await readFile(path.join(profilesDirectory, file), 'utf8');
    return parseProfile(file, source);
  }));

  return Object.fromEntries(profiles.map((profile) => [profile.id, profile]));
}

export const cvProfileDirectory = profilesDirectory;
export const cvProfileScriptsDirectory = scriptsDirectory;
