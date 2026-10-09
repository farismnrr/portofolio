import { hydrate } from 'svelte';
import App from './App.svelte';
import { loadRoute } from './lib/routes';
import './app.css';

const target = document.getElementById('app')!;
const initialPath = window.location.pathname;
const initialPage = (await loadRoute(initialPath)).default;

hydrate(App, {
  target,
  props: { initialPage, initialPath }
});
