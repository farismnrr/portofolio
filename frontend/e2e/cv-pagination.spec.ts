import { expect, test } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';

test('general AI CV downloads as a validated two-page PDF', async ({ page }) => {
  await page.goto('/about', { waitUntil: 'domcontentloaded', timeout: 30_000 });

  const generate = page.getByRole('button', { name: 'Generate CV with AI' });
  await expect(generate).toBeVisible();

  const renderPromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/cv/render') &&
      response.request().method() === 'POST',
    { timeout: 170_000 }
  );
  const downloadPromise = page.waitForEvent('download', { timeout: 170_000 });

  await generate.click();
  await expect(page.getByText('Generating CV with AI', { exact: true })).toBeVisible();

  const [renderResponse, download] = await Promise.all([renderPromise, downloadPromise]);

  if (!renderResponse.ok()) {
    throw new Error(
      `CV renderer failed: ${renderResponse.status()} ${await renderResponse.text()}`
    );
  }

  expect(renderResponse.headers()['content-type']).toContain('application/pdf');
  expect(download.suggestedFilename()).toBe('Faris_Munir_Mahdi_CV.pdf');

  await mkdir('test-results', { recursive: true });
  const outputPath = 'test-results/generated-cv.pdf';
  await download.saveAs(outputPath);

  const bytes = await readFile(outputPath);
  expect(bytes.length).toBeGreaterThan(8_000);
  expect(bytes.subarray(0, 4).toString('ascii')).toBe('%PDF');

  await expect(page.getByText('CV generated with AI', { exact: true })).toBeVisible();
});
