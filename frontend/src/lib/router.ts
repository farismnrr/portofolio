import { writable } from 'svelte/store';

function siteBasePath() {
  if (typeof window === 'undefined') return '/';

  const base = (window as Window & { __SITE_BASE__?: string }).__SITE_BASE__;
  if (!base || base === '/') return '/';
  return `/${base.split('/').filter(Boolean).join('/')}/`;
}

function appPath(pathname: string) {
  const base = siteBasePath();
  if (base === '/') return normalizeProjectPath(pathname);
  const prefix = base.slice(0, -1);
  if (pathname === prefix || pathname === base) return '/';
  return normalizeProjectPath(pathname.startsWith(base) ? `/${pathname.slice(base.length)}` : pathname);
}

function normalizeProjectPath(pathname: string) {
  return pathname.startsWith('/projects/') ? '/projects' : pathname;
}

export function siteAssetUrl(path: string) {
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('data:')) return path;

  const relativePath = path.replace(/^\//, '');
  return `${siteBasePath()}${relativePath}`;
}

function browserPath() {
  if (typeof window === 'undefined') return '/';

  const normalizedPath = appPath(window.location.pathname);
  const base = siteBasePath();
  const canonicalPath = base === '/' ? normalizedPath : `${base}${normalizedPath.slice(1)}`;
  if (window.location.pathname !== canonicalPath) {
    history.replaceState({}, '', `${canonicalPath}${window.location.search}${window.location.hash}`);
  }
  return normalizedPath;
}

export const path = writable(browserPath());

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => path.set(browserPath()));
}

function anchorForEvent(event: MouseEvent) {
  if (event.currentTarget instanceof HTMLAnchorElement) return event.currentTarget;
  return event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
}

export function scrollToCurrentHash() {
  if (typeof window === 'undefined' || !window.location.hash) return false;

  const id = decodeURIComponent(window.location.hash.slice(1));
  if (!id) return false;

  const target = document.getElementById(id);
  if (!target) return false;
  target.scrollIntoView();
  return true;
}

export function navigate(event: MouseEvent | null, href: string) {
  if (typeof window === 'undefined') return;

  const base = siteBasePath();
  const appHref = href.startsWith('/') ? `${base}${href.slice(1)}` : href;
  const url = new URL(appHref, window.location.href);

  if (event) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const anchor = anchorForEvent(event);
    if (anchor?.target && anchor.target !== '_self') return;
    if (anchor?.hasAttribute('download')) return;
    if (url.origin !== window.location.origin) return;

    event.preventDefault();
  }

  if (url.origin !== window.location.origin) {
    window.location.assign(url.href);
    return;
  }

  const nextLocation = `${url.pathname}${url.search}${url.hash}`;
  const currentLocation = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (nextLocation === currentLocation) {
    if (url.hash) scrollToCurrentHash();
    return;
  }

  history.pushState({}, '', nextLocation);
  path.set(appPath(url.pathname));

  if (url.hash) {
    requestAnimationFrame(() => scrollToCurrentHash());
    return;
  }

  window.scrollTo({ top: 0, behavior: 'instant' });
}
