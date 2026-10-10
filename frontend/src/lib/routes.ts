type PageModule = { default: any };
type PageLoader = () => Promise<PageModule>;

const loaders: Record<string, PageLoader> = {
  home: () => import('../pages/HomePage.svelte'),
  about: () => import('../pages/AboutPage.svelte'),
  experience: () => import('../pages/ExperiencePage.svelte'),
  skills: () => import('../pages/SkillsPage.svelte'),
  projects: () => import('../pages/ProjectsPage.svelte'),
  projectDetail: () => import('../pages/ProjectDetailPage.svelte'),
  blog: () => import('../pages/BlogPage.svelte'),
  article: () => import('../pages/ArticlePage.svelte'),
  certifications: () => import('../pages/CertificationsPage.svelte'),
  gallery: () => import('../pages/GalleryPage.svelte'),
  notFound: () => import('../pages/NotFoundPage.svelte')
};

const projectDocuments = import.meta.glob('../../content/projects/*.md', {
  query: '?raw',
  import: 'default'
});
const articleDocuments = import.meta.glob('../../content/blog/*.md', {
  query: '?raw',
  import: 'default'
});

const projectSlugs = slugsFromDocuments(projectDocuments);
const articleSlugs = slugsFromDocuments(articleDocuments);
const cache = new Map<string, Promise<PageModule>>();

function slugsFromDocuments(documents: Record<string, unknown>) {
  return new Set(
    Object.keys(documents).map((path) => path.split('/').at(-1)?.replace(/\.md$/, '') ?? '')
  );
}

function normalizePath(path: string) {
  return path === '/' ? '/' : path.replace(/\/+$/, '');
}

function dynamicSlug(path: string, prefix: string) {
  const value = path.slice(prefix.length);
  return value && !value.includes('/') ? decodeURIComponent(value) : '';
}

function keyForPath(path: string) {
  const cleanPath = normalizePath(path);
  if (cleanPath === '/') return 'home';
  if (cleanPath === '/about') return 'about';
  if (cleanPath === '/experience') return 'experience';
  if (cleanPath === '/skills') return 'skills';
  if (cleanPath === '/projects') return 'projects';
  if (cleanPath.startsWith('/projects/')) {
    return projectSlugs.has(dynamicSlug(cleanPath, '/projects/')) ? 'projectDetail' : 'notFound';
  }
  if (cleanPath === '/blog') return 'blog';
  if (cleanPath.startsWith('/blog/')) {
    return articleSlugs.has(dynamicSlug(cleanPath, '/blog/')) ? 'article' : 'notFound';
  }
  if (cleanPath === '/certifications') return 'certifications';
  if (cleanPath === '/gallery') return 'gallery';
  return 'notFound';
}

export function loadRoute(path: string) {
  const key = keyForPath(path);
  const cached = cache.get(key);
  if (cached) return cached;
  const pending = loaders[key]();
  cache.set(key, pending);
  return pending;
}

export function prefetchRoute(path: string) {
  void loadRoute(path);
}
