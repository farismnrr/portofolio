import { parseFrontmatter, parseInlineList, requireKeys, unquote } from './content';

export interface ExperienceEntry {
  kind: 'employment' | 'program'; order: number; year: string; company: string; role: string; location: string; summary: string; tech: string[]; projects: string[]; certificationGroups: string[]; bullets: string[];
}
export interface EducationEntry { order: number; year: string; institution: string; program: string; description: string; }
export interface SkillGroup { order: number; title: string; description: string; items: string[]; }
export interface Principle { order: number; index: string; title: string; description: string; }
export interface Certification { order: number; group: string; issuer: string; title: string; year: string; credentialId: string; url: string; image: string; }
export interface Publication { order: number; type: 'journal'|'thesis'|'project-report'; title: string; year: string; venue: string; url: string; doi: string; summary: string; }
export interface GalleryItem { order: number; image: string; caption: string; size: 'wide'|'tall'|'large'|'normal'; }
export interface PageCopy {
  slug: string; eyebrow: string; title: string; subtitle: string; description: string; body: string;
  primaryAction?: string; secondaryAction?: string; experienceLabel?: string; experienceAction?: string;
  projectsLabel?: string; projectsAction?: string; aboutLabel?: string; aboutAction?: string;
}
export interface ProfileContent {
  name: string; role: string; location: string; languages: string; image: string;
  github: string; linkedin: string; googleCloudSkills: string; email: string; resume: string;
  specialties: string; headline: string; intro: string; availability: string; quote: string;
}
export interface NavigationItem { order: number; label: string; href: string; matches: string[]; }

const experienceModules = import.meta.glob('../../content/experience/*.md', { eager:true, query:'?raw', import:'default' }) as Record<string,string>;
const educationModules = import.meta.glob('../../content/education/*.md', { eager:true, query:'?raw', import:'default' }) as Record<string,string>;
const skillModules = import.meta.glob('../../content/skills/*.md', { eager:true, query:'?raw', import:'default' }) as Record<string,string>;
const principleModules = import.meta.glob('../../content/principles/*.md', { eager:true, query:'?raw', import:'default' }) as Record<string,string>;
const certModules = import.meta.glob('../../content/certifications/*.md', { eager:true, query:'?raw', import:'default' }) as Record<string,string>;
const publicationModules = import.meta.glob('../../content/publications/*.md', { eager:true, query:'?raw', import:'default' }) as Record<string,string>;
const galleryModules = import.meta.glob('../../content/gallery/*.md', { eager:true, query:'?raw', import:'default' }) as Record<string,string>;
const pageModules = import.meta.glob('../../content/pages/*.md', { eager:true, query:'?raw', import:'default' }) as Record<string,string>;
const profileModules = import.meta.glob('../../content/profile/*.md', { eager:true, query:'?raw', import:'default' }) as Record<string,string>;
const navigationModules = import.meta.glob('../../content/navigation/*.md', { eager:true, query:'?raw', import:'default' }) as Record<string,string>;

function int(path:string, value:string|undefined){ const n=Number(value); if(!Number.isInteger(n)) throw new Error(`${path}: order must be an integer`); return n; }
function bullets(body:string){ return body.split(/\r?\n/).map(x=>x.trim()).filter(x=>x.startsWith('- ')).map(x=>x.slice(2)); }

export const experiences: ExperienceEntry[] = Object.entries(experienceModules).map(([path,src])=>{
  const {values,body}=parseFrontmatter(path,src); requireKeys(path,values,['order','year','company','role','location','summary','tech','projects']);
  return {kind:unquote(values.get('kind')??'employment') as ExperienceEntry['kind'],order:int(path,values.get('order')),year:unquote(values.get('year')??''),company:unquote(values.get('company')??''),role:unquote(values.get('role')??''),location:unquote(values.get('location')??''),summary:unquote(values.get('summary')??''),tech:parseInlineList(values.get('tech')??''),projects:parseInlineList(values.get('projects')??''),certificationGroups:parseInlineList(values.get('certificationGroups')??'[]'),bullets:bullets(body)};
}).sort((a,b)=>a.order-b.order);

export const education: EducationEntry[] = Object.entries(educationModules).map(([path,src])=>{
  const {values,body}=parseFrontmatter(path,src); requireKeys(path,values,['order','year','institution','program']);
  return {order:int(path,values.get('order')),year:unquote(values.get('year')??''),institution:unquote(values.get('institution')??''),program:unquote(values.get('program')??''),description:body};
}).sort((a,b)=>a.order-b.order);

export const skillGroups: SkillGroup[] = Object.entries(skillModules).map(([path,src])=>{
  const {values,body}=parseFrontmatter(path,src); requireKeys(path,values,['order','title','items']);
  return {order:int(path,values.get('order')),title:unquote(values.get('title')??''),description:body,items:parseInlineList(values.get('items')??'')};
}).sort((a,b)=>a.order-b.order);

export const principles: Principle[] = Object.entries(principleModules).map(([path,src])=>{
  const {values,body}=parseFrontmatter(path,src); requireKeys(path,values,['order','index','title']);
  return {order:int(path,values.get('order')),index:unquote(values.get('index')??''),title:unquote(values.get('title')??''),description:body};
}).sort((a,b)=>a.order-b.order);

export const certifications: Certification[] = Object.entries(certModules).map(([path,src])=>{
  const {values}=parseFrontmatter(path,src); requireKeys(path,values,['order','group','issuer','title','year','credentialId','url','image']);
  return {order:int(path,values.get('order')),group:unquote(values.get('group')??''),issuer:unquote(values.get('issuer')??''),title:unquote(values.get('title')??''),year:unquote(values.get('year')??''),credentialId:unquote(values.get('credentialId')??''),url:unquote(values.get('url')??''),image:unquote(values.get('image')??'')};
}).sort((a,b)=>a.order-b.order);

export const publications: Publication[] = Object.entries(publicationModules).map(([path,src])=>{
  const {values,body}=parseFrontmatter(path,src);
  requireKeys(path,values,['order','type','title','year','venue','url','doi']);
  const type=unquote(values.get('type')??'') as Publication['type'];
  if(!['journal','thesis','project-report'].includes(type)) throw new Error(`${path}: unsupported publication type`);
  return {order:int(path,values.get('order')),type,title:unquote(values.get('title')??''),year:unquote(values.get('year')??''),venue:unquote(values.get('venue')??''),url:unquote(values.get('url')??''),doi:unquote(values.get('doi')??''),summary:body};
}).sort((a,b)=>a.order-b.order);

export const certificationGroups = [...new Set(certifications.map(x=>x.group))].map(group=>({group,items:certifications.filter(x=>x.group===group)}));

export function certificationGroupId(group:string){
  return group.toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-');
}

export const gallery: GalleryItem[] = Object.entries(galleryModules).map(([path,src])=>{
  const {values}=parseFrontmatter(path,src); requireKeys(path,values,['order','image','caption','size']);
  const size=unquote(values.get('size')??'normal') as GalleryItem['size'];
  return {order:int(path,values.get('order')),image:unquote(values.get('image')??''),caption:unquote(values.get('caption')??''),size};
}).sort((a,b)=>a.order-b.order);

export const pageCopy: Record<string, PageCopy> = Object.fromEntries(Object.entries(pageModules).map(([path,src])=>{
  const {values,body}=parseFrontmatter(path,src); requireKeys(path,values,['slug','eyebrow','title','subtitle','description']);
  const item={
    slug:unquote(values.get('slug')??''),
    eyebrow:unquote(values.get('eyebrow')??''),
    title:unquote(values.get('title')??''),
    subtitle:unquote(values.get('subtitle')??''),
    description:unquote(values.get('description')??''),
    body,
    primaryAction:values.has('primaryAction')?unquote(values.get('primaryAction')??''):undefined,
    secondaryAction:values.has('secondaryAction')?unquote(values.get('secondaryAction')??''):undefined,
    experienceLabel:values.has('experienceLabel')?unquote(values.get('experienceLabel')??''):undefined,
    experienceAction:values.has('experienceAction')?unquote(values.get('experienceAction')??''):undefined,
    projectsLabel:values.has('projectsLabel')?unquote(values.get('projectsLabel')??''):undefined,
    projectsAction:values.has('projectsAction')?unquote(values.get('projectsAction')??''):undefined,
    aboutLabel:values.has('aboutLabel')?unquote(values.get('aboutLabel')??''):undefined,
    aboutAction:values.has('aboutAction')?unquote(values.get('aboutAction')??''):undefined
  };
  return [item.slug,item];
}));

export function getLatestExperiences(limit:number){
  const score=(value:string)=>value.includes('Present')
    ? Number.MAX_SAFE_INTEGER
    : Number(value.match(/\d{4}(?!.*\d{4})/)?.[0] ?? 0);
  return [...experiences].sort((a,b)=>score(b.year)-score(a.year) || a.order-b.order).slice(0,limit);
}

const profileSource = Object.entries(profileModules)[0];
if (!profileSource) throw new Error('content/profile must contain a profile Markdown document.');
const profileParsed = parseFrontmatter(profileSource[0], profileSource[1]);
requireKeys(profileSource[0], profileParsed.values, ['name','role','location','languages','image','github','linkedin','googleCloudSkills','email','resume','specialties','headline','intro','availability','quote']);

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

export const navigation: NavigationItem[] = Object.entries(navigationModules).map(([path,src])=>{
  const {values}=parseFrontmatter(path,src);
  requireKeys(path,values,['order','label','href','matches']);
  return {
    order:int(path,values.get('order')),
    label:unquote(values.get('label')??''),
    href:unquote(values.get('href')??''),
    matches:parseInlineList(values.get('matches')??'')
  };
}).sort((a,b)=>a.order-b.order);

export function resolveActiveNavigation(path:string){
  if(path==='/') return navigation.find(item=>item.href==='/')?.href ?? '/';
  return navigation.find(item=>item.matches.filter(prefix=>prefix!=='/').some(prefix=>path===prefix || path.startsWith(prefix + '/')))?.href ?? '/';
}
