import { render } from 'svelte/server';
import App from '../App.svelte';
import { path } from './router';
import { loadRoute } from './routes';

export async function renderRoute(url: string) {
  path.set(url);
  const initialPage = (await loadRoute(url)).default;
  const rendered = await render(App, {
    props: { initialPage, initialPath: url }
  });

  return {
    body: rendered.body,
    head: rendered.head
  };
}
