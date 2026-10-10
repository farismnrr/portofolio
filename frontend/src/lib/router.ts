import { writable } from 'svelte/store';

const initialPath = typeof window === 'undefined' ? '/' : window.location.pathname;
export const path = writable(initialPath);

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => path.set(window.location.pathname));
}

function anchorForEvent(event: MouseEvent) {
  if (event.currentTarget instanceof HTMLAnchorElement) return event.currentTarget;
  return event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
}

export function navigate(event: MouseEvent | null, href: string) {
  if (typeof window === 'undefined') return;

  const url = new URL(href, window.location.href);

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
    if (url.hash) {
      document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView();
    }
    return;
  }

  history.pushState({}, '', nextLocation);
  path.set(url.pathname);

  if (url.hash) {
    requestAnimationFrame(() => {
      document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView();
    });
    return;
  }

  window.scrollTo({ top: 0, behavior: 'instant' });
}
