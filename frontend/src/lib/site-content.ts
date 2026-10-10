import { parseFrontmatter, parseInlineList, requireKeys, unquote } from './content';

export interface ProfileContent {
  name: string;
  role: string;
  location: string;
  languages: string;
  image: string;
  github: string;
  linkedin: string;
  googleCloudSkills: string;
  email: string;
  resume: string;
  specialties: string;
  headline: string;
  intro: string;
  availability: string;
  quote: string;
}

export interface NavigationItem {
  order: number;
  label: string;
  href: string;
  matches: string[];
}

const profileModules = import.meta.glob('../../content/profile/*.md', {
  eager: true,
  query: '?meta',
  import: 'default'
}) as Record<string, string>;

const navigationModules = import.meta.glob('../../content/navigation/*.md', {
  eager: true,
  query: '?meta',
  import: 'default'
}) as Record<string, string>;

function int(path: string, value: string | undefined) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) throw new Error(`${path}: order must be an integer`);
  return parsed;
}

const profileSource = Object.entries(profileModules)[0];
if (!profileSource) throw new Error('content/profile must contain a profile Markdown document.');
const profileParsed = parseFrontmatter(profileSource[0], profileSource[1]);
requireKeys(profileSource[0], profileParsed.values, [
  'name','role','location','languages','image','github','linkedin','googleCloudSkills','email','resume','specialties','headline','intro','availability','quote'
]);

export const profile: ProfileContent = {
  name: unquote(profileParsed.values.get('name') ?? ''),
  role: unquote(profileParsed.values.get('role') ?? ''),
  location: unquote(profileParsed.values.get('location') ?? ''),
  languages: unquote(profileParsed.values.get('languages') ?? ''),
  image: unquote(profileParsed.values.get('image') ?? ''),
  github: unquote(profileParsed.values.get('github') ?? ''),
  linkedin: unquote(profileParsed.values.get('linkedin') ?? ''),
  googleCloudSkills: unquote(profileParsed.values.get('googleCloudSkills') ?? ''),
  email: unquote(profileParsed.values.get('email') ?? ''),
  resume: unquote(profileParsed.values.get('resume') ?? ''),
  specialties: unquote(profileParsed.values.get('specialties') ?? ''),
  headline: unquote(profileParsed.values.get('headline') ?? ''),
  intro: unquote(profileParsed.values.get('intro') ?? ''),
  availability: unquote(profileParsed.values.get('availability') ?? ''),
  quote: unquote(profileParsed.values.get('quote') ?? '')
};

export const navigation: NavigationItem[] = Object.entries(navigationModules)
  .map(([path, source]) => {
    const { values } = parseFrontmatter(path, source);
    requireKeys(path, values, ['order','label','href','matches']);
    return {
      order: int(path, values.get('order')),
      label: unquote(values.get('label') ?? ''),
      href: unquote(values.get('href') ?? ''),
      matches: parseInlineList(values.get('matches') ?? '')
    };
  })
  .sort((a, b) => a.order - b.order);

export function resolveActiveNavigation(path: string) {
  if (path === '/') return navigation.find((item) => item.href === '/')?.href ?? '/';
  return navigation.find((item) =>
    item.matches.filter((prefix) => prefix !== '/').some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
  )?.href ?? '/';
}
