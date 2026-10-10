import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark';

function initialTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export const theme = writable<Theme>(initialTheme());

function applyTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  document.documentElement.style.colorScheme = next;
}

export function initializeTheme() {
  if (typeof window === 'undefined') return;
  const stored = window.localStorage.getItem('theme');
  const next: Theme = stored === 'light' || stored === 'dark'
    ? stored
    : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(next);
  theme.set(next);
}

export function setTheme(next: Theme) {
  if (typeof window === 'undefined') return;
  applyTheme(next);
  window.localStorage.setItem('theme', next);
  theme.set(next);
}

export function toggleTheme(current: Theme) {
  setTheme(current === 'dark' ? 'light' : 'dark');
}
