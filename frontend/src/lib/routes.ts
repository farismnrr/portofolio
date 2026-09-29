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
  gallery: () => import('../pages/GalleryPage.svelte')
};

const cache = new Map<string, Promise<PageModule>>();

function keyForPath(path: string) {
  if (path === '/') return 'home';
  if (path === '/about') return 'about';
  if (path === '/experience') return 'experience';
  if (path === '/skills') return 'skills';
  if (path === '/projects') return 'projects';
  if (path.startsWith('/projects/')) return 'projectDetail';
  if (path === '/blog') return 'blog';
  if (path.startsWith('/blog/')) return 'article';
  if (path === '/certifications') return 'certifications';
  if (path === '/gallery') return 'gallery';
  return 'home';
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
