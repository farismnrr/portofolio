import { getArticleByPath } from './blog-content';
import { getProjectByPath } from './project-content';

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

const cache = new Map<string, Promise<PageModule>>();

function normalizePath(path: string) {
  return path === '/' ? '/' : path.replace(/\/+$/, '');
}

function keyForPath(path: string) {
  const cleanPath = normalizePath(path);
  if (cleanPath === '/') return 'home';
  if (cleanPath === '/about') return 'about';
  if (cleanPath === '/experience') return 'experience';
  if (cleanPath === '/skills') return 'skills';
  if (cleanPath === '/projects') return 'projects';
  if (cleanPath.startsWith('/projects/')) return getProjectByPath(cleanPath) ? 'projectDetail' : 'notFound';
  if (cleanPath === '/blog') return 'blog';
  if (cleanPath.startsWith('/blog/')) return getArticleByPath(cleanPath) ? 'article' : 'notFound';
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
