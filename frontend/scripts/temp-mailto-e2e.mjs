import { chromium } from 'playwright';

const expected = 'mailto:farismnrrbusiness@gmail.com';
const base = 'http://127.0.0.1:4173';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

async function verify(path) {
  await page.goto(base + path, { waitUntil: 'networkidle' });
  const link = page.locator(`a[href="${expected}"]`).first();
  if (await link.count() === 0) {
    throw new Error(`${path}: expected mailto link not found`);
  }

  const href = await link.getAttribute('href');
  if (href !== expected) {
    throw new Error(`${path}: expected ${expected}, got ${href}`);
  }

  const clickState = await link.evaluate((node) => {
    return new Promise((resolve) => {
      const handler = (event) => {
        document.removeEventListener('click', handler, true);
        resolve({
          defaultPrevented: event.defaultPrevented,
          href: node.getAttribute('href'),
        });
      };
      document.addEventListener('click', handler, true);
      node.click();
    });
  });

  if (clickState.defaultPrevented) {
    throw new Error(`${path}: app prevented the mailto default action`);
  }

  await page.waitForTimeout(250);

  console.log(JSON.stringify({
    path,
    href,
    defaultPrevented: clickState.defaultPrevented,
    pageUrlAfterClick: page.url(),
  }));
}

await verify('/');
await verify('/about');

await browser.close();
