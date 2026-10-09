import { execFileSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import process from 'node:process';

const frontendRoot = resolve(new URL('..', import.meta.url).pathname);
const repoRoot = resolve(frontendRoot, '..');
const contentRoot = resolve(frontendRoot, 'content');

const args = process.argv.slice(2);
const baseIndex = args.indexOf('--base');
const baseRef = baseIndex >= 0 ? args[baseIndex + 1] : null;
if (baseIndex >= 0 && !baseRef) {
  throw new Error('--base requires a Git ref, for example: --base origin/main');
}

// This is an editorial quality guard, not an AI-authorship detector. The phrase
// rules are intentionally conservative and focus on patterns that public
// anti-slop research finds strongly over-represented in model output. Structural
// warnings catch repetitive, over-polished prose without pretending authorship
// can be inferred from punctuation or vocabulary alone.
const hardPhraseRules = [
  ['delve-family', /\bdelv(?:e|es|ed|ing)\b/i, 'replace stock "delve" phrasing with the concrete action'],
  ['testament-to', /\btestament to\b/i, 'state the evidence directly instead of calling it a testament'],
  ['tapestry', /\btapestr(?:y|ies)\b/i, 'avoid decorative metaphor unless it is genuinely necessary'],
  ['symphony', /\bsymphon(?:y|ies)\b/i, 'avoid decorative metaphor unless it is genuinely necessary'],
  ['kaleidoscope', /\bkaleidoscop(?:e|ic)\b/i, 'avoid decorative metaphor unless it is genuinely necessary'],
  ['fast-paced-world', /\bin today'?s fast[- ]paced (?:world|landscape)\b/i, 'name the actual context instead of using a stock opener'],
  ['ever-evolving-landscape', /\bever[- ]evolving landscape\b/i, 'name the concrete change instead of using a stock phrase'],
  ['game-changer', /\bgame[- ]changer\b/i, 'describe the specific effect instead of using marketing language'],
  ['cutting-edge', /\bcutting[- ]edge\b/i, 'describe what is technically new or useful'],
  ['seamlessly', /\bseamlessly\b/i, 'describe the integration or transition directly'],
  ['revolutionary', /\brevolutionary\b/i, 'replace the claim with verifiable detail']
];

const softWords = [
  'robust',
  'scalable',
  'high-performance',
  'comprehensive',
  'pivotal',
  'leverage',
  'unlock',
  'elevate'
];

const cannedTransitions = [
  'the important part is',
  'the interesting part is',
  'the key takeaway is',
  'the goal is simple',
  'that distinction is important',
  'the useful distinction is',
  'at its core',
  'in today\'s world'
];

const frontmatterDashAllowlist = new Set(['year', 'date', 'period', 'venue']);
const findings = [];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const paths = [];
  for (const entry of entries) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) paths.push(...(await walk(path)));
    else if (entry.isFile() && entry.name.endsWith('.md')) paths.push(path);
  }
  return paths.sort();
}

function changedMarkdownFiles(base) {
  const output = execFileSync(
    'git',
    ['diff', '--name-only', `${base}...HEAD`, '--', 'frontend/content'],
    { cwd: repoRoot, encoding: 'utf8' }
  );
  return new Set(
    output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.endsWith('.md'))
  );
}

function addFinding(severity, file, line, rule, message, excerpt) {
  findings.push({ severity, file, line, rule, message, excerpt: excerpt.trim() });
}

function inspectFile(file, source) {
  const repoPath = relative(repoRoot, file).replaceAll('\\', '/');
  const lines = source.split(/\r?\n/);
  let inFrontmatter = false;
  let frontmatterSeen = false;
  let inFence = false;
  const proseLines = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const lineNumber = index + 1;

    if (index === 0 && line.trim() === '---') {
      inFrontmatter = true;
      frontmatterSeen = true;
      continue;
    }
    if (inFrontmatter && line.trim() === '---') {
      inFrontmatter = false;
      continue;
    }
    if (!inFrontmatter && /^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    let text = line;
    if (inFrontmatter) {
      const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
      if (!match) continue;
      const [, key, value] = match;
      if (frontmatterDashAllowlist.has(key)) continue;
      text = value;
    }

    // Markdown list markers and headings are presentation syntax, not prose.
    const prose = text
      .replace(/^\s{0,3}#{1,6}\s+/, '')
      .replace(/^\s*[-*+]\s+/, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/`[^`]*`/g, '')
      .trim();

    if (!prose) continue;
    proseLines.push({ line: lineNumber, text: prose });

    if (prose.includes('—')) {
      addFinding(
        'error',
        repoPath,
        lineNumber,
        'em-dash',
        'avoid em dashes in visible copy; use a period, comma, colon, or rewrite the sentence',
        prose
      );
    }

    for (const [rule, pattern, message] of hardPhraseRules) {
      if (pattern.test(prose)) addFinding('error', repoPath, lineNumber, rule, message, prose);
    }

    const words = prose.split(/\s+/).filter(Boolean);
    if (words.length > 45) {
      addFinding(
        'warning',
        repoPath,
        lineNumber,
        'long-sentence',
        `sentence-like line has ${words.length} words; check whether it is doing too much at once`,
        prose
      );
    }
  }

  if (!frontmatterSeen) {
    addFinding('warning', repoPath, 1, 'frontmatter', 'content file has no YAML frontmatter', lines[0] ?? '');
  }

  const joined = proseLines.map(({ text }) => text.toLowerCase()).join('\n');
  const softHits = softWords.filter((word) => joined.includes(word));
  if (softHits.length >= 3) {
    addFinding(
      'warning',
      repoPath,
      1,
      'marketing-density',
      `multiple vague/marketing terms appear in one document: ${softHits.join(', ')}`,
      softHits.join(', ')
    );
  }

  const repeatedTransitions = cannedTransitions
    .map((phrase) => ({ phrase, count: joined.split(phrase).length - 1 }))
    .filter(({ count }) => count > 1);
  for (const { phrase, count } of repeatedTransitions) {
    addFinding(
      'warning',
      repoPath,
      1,
      'repeated-transition',
      `stock transition "${phrase}" appears ${count} times; vary the structure or remove it`,
      phrase
    );
  }

  const contrastCount = proseLines.reduce((count, { text }) => {
    const lower = text.toLowerCase();
    return count + Number(/\bnot (?:just|only)\b/.test(lower)) + Number(/\brather than\b/.test(lower));
  }, 0);
  if (contrastCount >= 4) {
    addFinding(
      'warning',
      repoPath,
      1,
      'contrast-template',
      `"not just/not only/rather than" contrast framing appears ${contrastCount} times; repeated contrast templates can make prose feel generated`,
      `${contrastCount} contrast templates`
    );
  }
}

const allFiles = await walk(contentRoot);
let files = allFiles;
if (baseRef) {
  const changed = changedMarkdownFiles(baseRef);
  files = allFiles.filter((file) => changed.has(relative(repoRoot, file).replaceAll('\\', '/')));
}

for (const file of files) inspectFile(file, await readFile(file, 'utf8'));

for (const finding of findings) {
  const label = finding.severity === 'error' ? 'ERROR' : 'WARN ';
  process.stdout.write(
    `${label} ${finding.file}:${finding.line} [${finding.rule}] ${finding.message}\n` +
      `      ${finding.excerpt}\n`
  );
}

const errors = findings.filter(({ severity }) => severity === 'error').length;
const warnings = findings.length - errors;
const scope = baseRef ? `changed content since ${baseRef}` : 'all content';
process.stdout.write(
  `Writing-style guard checked ${files.length} Markdown files (${scope}): ${errors} errors, ${warnings} warnings.\n`
);

if (errors > 0) process.exit(1);
