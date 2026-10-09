import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { renderRoute } from '../.ssr/entry-server.js';

const frontendRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const distRoot = join(frontendRoot, 'dist');
const template = await readFile(join(distRoot, 'index.html'), 'utf8');
const routes = (await readFile(join(distRoot, 'routes.txt'), 'utf8'))
  .split(/\r?\n/)
  .map((value) => value.trim())
  .filter(Boolean);

function outputPath(route) {
  if (route === '/') return join(distRoot, 'index.html');
  return join(distRoot, route.slice(1), 'index.html');
}

function applyRenderedHead(document, route, renderedHead) {
  const selectors = [
    'title',
    'meta[name="description"]',
    'meta[name="robots"]',
    'link[rel="canonical"]',
    'meta[property^="og:"]',
    'meta[name^="twitter:"]'
  ];
  for (const selector of selectors) {
    document.head.querySelectorAll(selector).forEach((node) => node.remove());
  }
  if (route !== '/') {
    document.head.querySelectorAll('script[type="application/ld+json"]').forEach((node) => node.remove());
  }
  document.head.insertAdjacentHTML('beforeend', renderedHead);
}

for (const route of routes) {
  const rendered = await renderRoute(route);
  const dom = new JSDOM(template);
  const app = dom.window.document.getElementById('app');
  if (!app) throw new Error('Prerender failed: #app outlet is missing from Vite output.');

  app.innerHTML = rendered.body;
  applyRenderedHead(dom.window.document, route, rendered.head);

  const destination = outputPath(route);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, `<!doctype html>\n${dom.window.document.documentElement.outerHTML}\n`, 'utf8');
}

await rm(join(frontendRoot, '.ssr'), { recursive: true, force: true });
process.stdout.write(`Prerendered ${routes.length} routes with crawlable HTML.\n`);
