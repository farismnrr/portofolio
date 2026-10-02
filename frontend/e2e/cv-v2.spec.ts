import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('grounded CV uses pgvector and downloads a one-page Letter PDF', async ({ page }) => {
  await page.goto('/about', { waitUntil: 'domcontentloaded', timeout: 30_000 });

  const saveCv = page.getByRole('button', { name: 'Save CV' });
  await expect(saveCv).toBeVisible();

  const retrievalPromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/cv/retrieve') &&
      response.request().method() === 'POST',
    { timeout: 90_000 }
  );
  const aiPromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/ai/chat') &&
      response.request().method() === 'POST',
    { timeout: 120_000 }
  );
  const renderPromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/cv/render') &&
      response.request().method() === 'POST',
    { timeout: 140_000 }
  );
  const downloadPromise = page.waitForEvent('download', { timeout: 140_000 });

  await saveCv.click();

  const retrievalResponse = await retrievalPromise;
  const retrievalBody = await retrievalResponse.json();
  expect(retrievalResponse.ok()).toBeTruthy();
  expect(retrievalBody.backend).toBe('pgvector+postgres-fts');
  expect(Array.isArray(retrievalBody.evidence)).toBeTruthy();
  expect(retrievalBody.evidence.length).toBeGreaterThan(10);

  const aiResponse = await aiPromise;
  const aiBody = await aiResponse.text();
  if (!aiResponse.ok()) {
    throw new Error(`AI request failed: ${aiResponse.status()} ${aiBody}`);
  }

  let renderResponse;
  let download;
  try {
    [renderResponse, download] = await Promise.all([renderPromise, downloadPromise]);
  } catch (error) {
    const uiError = await page.locator('p.text-red-700').textContent().catch(() => null);
    throw new Error(
      `CV generation did not finish. UI error: ${uiError ?? 'none'}. AI: ${aiBody.slice(0, 600)}. ${String(error)}`
    );
  }

  expect(renderResponse.ok()).toBeTruthy();
  expect(renderResponse.headers()['content-type']).toContain('application/pdf');
  expect(download.suggestedFilename()).toBe('Faris_Munir_Mahdi_CV.pdf');

  const outputPath = 'test-results/generated-cv.pdf';
  await download.saveAs(outputPath);

  const bytes = await readFile(outputPath);
  expect(bytes.length).toBeGreaterThan(8_000);
  expect(bytes.subarray(0, 4).toString('ascii')).toBe('%PDF');

  const pdfText = bytes.toString('latin1');
  const pages = pdfText.match(/\/Type\s*\/Page\b/g) ?? [];
  expect(pages.length).toBe(1);
  expect(pdfText).toMatch(/\/MediaBox\s*\[\s*0\s+0\s+612(?:\.0*)?\s+792(?:\.0*)?\s*\]/);
});
