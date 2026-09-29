export interface ParsedContent {
  values: Map<string, string>;
  body: string;
}

export function unquote(value: string) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function parseInlineList(value: string) {
  const trimmed = value.trim();
  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) return [];
  return trimmed.slice(1, -1).split(',').map((item) => unquote(item)).filter(Boolean);
}

export function parseBoolean(value: string) {
  return unquote(value).toLowerCase() === 'true';
}

export function parseFrontmatter(path: string, source: string): ParsedContent {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`${path}: missing frontmatter`);

  const values = new Map<string, string>();
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const separator = line.indexOf(':');
    if (separator < 1) throw new Error(`${path}: invalid frontmatter line "${line}"`);
    values.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
  }

  return { values, body: match[2].trim() };
}

export function requireKeys(path: string, values: Map<string, string>, keys: string[]) {
  for (const key of keys) {
    if (!values.has(key)) throw new Error(`${path}: missing frontmatter key "${key}"`);
  }
}
