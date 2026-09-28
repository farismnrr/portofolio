import { writable } from 'svelte/store';

const initialPath = typeof window === 'undefined' ? '/' : window.location.pathname;
export const path = writable(initialPath);

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => path.set(window.location.pathname));
}

export function navigate(event: MouseEvent | null, href: string) {
  if (event) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
  }
  if (window.location.pathname !== href) {
    history.pushState({}, '', href);
    path.set(href);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}
