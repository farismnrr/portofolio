import { hydrate } from 'svelte';
import App from './App.svelte';
import { loadRoute } from './lib/routes';
import './app.css';

async function bootstrap() {
  const target = document.getElementById('app');
  if (!target) throw new Error('Missing #app mount target.');

  const initialPath = window.location.pathname;
  const initialPage = (await loadRoute(initialPath)).default;

  hydrate(App, {
    target,
    props: { initialPage, initialPath }
  });
}

void bootstrap();
