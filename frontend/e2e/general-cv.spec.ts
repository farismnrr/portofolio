import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('general CV is broad, grounded, linked and at most two pages', async ({ page }) => {
  await page.goto('/about', { waitUntil: 'domcontentloaded', timeout: 30_000 });

  const saveCv = page.getByRole('button', { name: 'Save CV' });
  await expect(saveCv).toBeVisible();

  const retrievalPromise = page.waitForResponse(
    (response) => response.url().includes('/api/cv/retrieve') && response.request().method() === 'POST',
    { timeout: 90_000 }
  );
  const aiPromise = page.waitForResponse(
    (response) => response.url().includes('/api/ai/chat') && response.request().method() === 'POST',
    { timeout: 140_000 }
  );
  const renderRequestPromise = page.waitForRequest(
    (request) => request.url().includes('/api/cv/render') && request.method() === 'POST',
    { timeout: 160_000 }
  );
  const renderResponsePromise = page.waitForResponse(
    (response) => response.url().includes('/api/cv/render') && response.request().method() === 'POST',
    { timeout: 170_000 }
  );
  const downloadPromise = page.waitForEvent('download', { timeout: 170_000 });

  await saveCv.click();

  const retrieval = await retrievalPromise;
  const retrievalBody = await retrieval.json();
  expect(retrieval.ok()).toBeTruthy();
  expect(retrievalBody.backend).toBe('pgvector+postgres-fts');
  expect(retrievalBody.evidence.some((item: any) => item.sourceType === 'certification')).toBeTruthy();

  const aiResponse = await aiPromise;
  expect(aiResponse.ok()).toBeTruthy();
  const aiEnvelope = await aiResponse.json();
  const aiText = String(aiEnvelope.message ?? '');
  expect(aiText).not.toMatch(/\bAI Engineer\b/i);
  expect(aiText).toMatch(/Software Engineer/i);

  const renderRequest = await renderRequestPromise;
  const renderPayload = renderRequest.postDataJSON() as any;
  expect(renderPayload.maxPages).toBe(2);
  expect(renderPayload.projects.length).toBeGreaterThanOrEqual(3);
  expect(renderPayload.experiences.length).toBeGreaterThanOrEqual(3);
  expect(renderPayload.certifications.length).toBeGreaterThanOrEqual(2);
  expect(renderPayload.projects.every((item: any) => /^https?:\/\//.test(item.url))).toBeTruthy();
  expect(renderPayload.certifications.every((item: any) => /^https?:\/\//.test(item.url))).toBeTruthy();

  const [renderResponse, download] = await Promise.all([
    renderResponsePromise,
    downloadPromise
  ]);
  expect(renderResponse.ok()).toBeTruthy();

  const outputPath = 'test-results/generated-general-cv.pdf';
  await download.saveAs(outputPath);

  const bytes = await readFile(outputPath);
  expect(bytes.subarray(0, 4).toString('ascii')).toBe('%PDF');
  expect(bytes.length).toBeGreaterThan(10_000);

  const pdfText = bytes.toString('latin1');
  const pages = pdfText.match(/\/Type\s*\/Page\b/g) ?? [];
  expect(pages.length).toBeGreaterThanOrEqual(1);
  expect(pages.length).toBeLessThanOrEqual(2);

  const uriAnnotations = [...pdfText.matchAll(/\/URI\s*\((https?:\/\/[^)]+)\)/g)].map((match) => match[1]);
  expect(uriAnnotations.length).toBeGreaterThanOrEqual(2);
  expect(uriAnnotations.some((url) => url.includes('farismnrr.com/projects/') || url.includes('github.com/farismnrr/'))).toBeTruthy();
  expect(uriAnnotations.some((url) => url.includes('farismnrr.com/images/certifications/'))).toBeTruthy();
});
