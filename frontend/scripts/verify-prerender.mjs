import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const siteUrl = 'https://farismnrr.com';
const frontendRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const distRoot = join(frontendRoot, 'dist');
const routes = (await readFile(join(distRoot, 'routes.txt'), 'utf8'))
  .split(/\r?\n/)
  .map((value) => value.trim())
  .filter(Boolean);

function documentPath(route) {
  return route === '/' ? join(distRoot, 'index.html') : join(distRoot, route.slice(1), 'index.html');
}

function expectedCanonical(route) {
  return `${siteUrl}${route === '/' ? '/' : route}`;
}

function assert(condition, message) {
  if (!condition) throw new Error(`Prerender verification failed: ${message}`);
}

const sitemap = await readFile(join(distRoot, 'sitemap.xml'), 'utf8');
const feed = await readFile(join(distRoot, 'feed.xml'), 'utf8');
assert(feed.includes('<rss') && feed.includes('<channel>'), 'feed.xml is not a valid RSS document');

for (const route of routes) {
  const html = await readFile(documentPath(route), 'utf8');
  const dom = new JSDOM(html);
  const { document } = dom.window;
  const canonical = expectedCanonical(route);
  const title = document.querySelector('title')?.textContent?.trim() ?? '';
  const description = document.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ?? '';
  const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content')?.toLowerCase() ?? '';
  const canonicalNodes = [...document.querySelectorAll('link[rel="canonical"]')];
  const appText = document.getElementById('app')?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  const structuredData = [...document.querySelectorAll('script[type="application/ld+json"]')];

  assert(title.length > 3, `${route} is missing a meaningful title`);
  assert(!title.toLowerCase().includes('alex morgan'), `${route} still contains placeholder title metadata`);
  assert(description.length >= 40, `${route} description is too short or missing`);
  assert(robots.includes('index') && robots.includes('follow'), `${route} is not explicitly indexable`);
  assert(canonicalNodes.length === 1, `${route} must contain exactly one canonical link`);
  assert(canonicalNodes[0]?.getAttribute('href') === canonical, `${route} canonical does not match ${canonical}`);
  assert(document.querySelector('h1'), `${route} is missing an H1 in prerendered HTML`);
  assert(appText.length >= 80, `${route} prerendered body is not meaningful enough`);
  assert(structuredData.length >= 1, `${route} is missing JSON-LD in prerendered HTML`);
  assert(sitemap.includes(`<loc>${canonical}</loc>`), `${route} is missing from sitemap.xml`);

  for (const node of structuredData) {
    try {
      JSON.parse(node.textContent ?? '');
    } catch {
      throw new Error(`Prerender verification failed: ${route} contains invalid JSON-LD`);
    }
  }
}

const notFound = new JSDOM(await readFile(join(distRoot, '404.html'), 'utf8')).window.document;
const notFoundRobots = notFound.querySelector('meta[name="robots"]')?.getAttribute('content')?.toLowerCase() ?? '';
assert(notFoundRobots.includes('noindex'), '404.html must remain noindex');

process.stdout.write(`Verified ${routes.length} prerendered routes, sitemap coverage, JSON-LD, RSS, and 404 indexing policy.\n`);
