import { createServer } from 'vite';
import { mkdir, writeFile, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const endpoint = process.env.CV_RENDER_URL;
if (!endpoint) throw new Error('Set CV_RENDER_URL to the local /api/cv/render endpoint.');
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
const output = path.resolve('public/downloads/Faris_Munir_Mahdi_CV.pdf');
const pending = `${output}.pending.pdf`;
try {
  const { buildLatestCv } = await server.ssrLoadModule('/src/lib/cv.ts');
  const response = await fetch(endpoint, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildLatestCv()), signal: AbortSignal.timeout(120000)
  });
  if (!response.ok) throw new Error(`CV render failed (${response.status}): ${await response.text()}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.subarray(0, 4).equals(Buffer.from('%PDF'))) throw new Error('Invalid PDF response.');
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(pending, bytes);
  const info = execFileSync('pdfinfo', [pending], { encoding: 'utf8' });
  if (!/^Pages:\s+2\s*$/m.test(info)) throw new Error('Published CV must have exactly two pages.');
  const text = execFileSync('pdftotext', [pending, '-'], { encoding: 'utf8' });
  for (const title of ['FARIS MUNIR MAHDI', 'PT Perkasa Pilar Utama', 'PT Tradeasia International Indonesia', 'TECHNICAL PROGRAMS']) {
    if (!text.replace(/\s+/g, ' ').includes(title)) throw new Error(`CV missing ${title}`);
  }
  await rename(pending, output);
  process.stdout.write(`Published reviewed CV: ${output}\n`);
} finally {
  await unlink(pending).catch(() => {});
  await server.close();
}
