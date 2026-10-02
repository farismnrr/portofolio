import { expect, test } from '@playwright/test';
import { readFile, stat } from 'node:fs/promises';

test('production can generate and download grounded general CV', async ({ page }) => {
  await page.goto('/about', { waitUntil: 'domcontentloaded', timeout: 30_000 });

  await expect(page.getByRole('heading', { name: 'Faris Munir Mahdi' })).toBeVisible();

  const saveCv = page.getByRole('button', { name: 'Save CV' });
  await expect(saveCv).toBeVisible();

  const aiResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/ai/chat') &&
      response.request().method() === 'POST',
    { timeout: 75_000 }
  );
  const downloadPromise = page.waitForEvent('download', { timeout: 90_000 });

  await saveCv.click();

  const aiResponse = await aiResponsePromise;
  const aiBody = await aiResponse.text();

  if (!aiResponse.ok()) {
    throw new Error(`AI request failed: ${aiResponse.status()} ${aiBody}`);
  }

  let download;
  try {
    download = await downloadPromise;
  } catch (error) {
    const uiError = await page.locator('p.text-red-700').textContent().catch(() => null);
    throw new Error(
      `CV download did not start. UI error: ${uiError ?? 'none'}. AI response: ${aiBody.slice(0, 500)}. ${String(error)}`
    );
  }

  expect(download.suggestedFilename()).toBe('Faris_Munir_Mahdi_General_CV.pdf');

  const path = await download.path();
  expect(path).not.toBeNull();

  const info = await stat(path!);
  expect(info.size).toBeGreaterThan(5_000);

  const bytes = await readFile(path!);
  expect(bytes.subarray(0, 4).toString('ascii')).toBe('%PDF');
});
