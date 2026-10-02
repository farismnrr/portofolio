import { expect, test } from '@playwright/test';
import { readFile, stat } from 'node:fs/promises';

test('production can generate and download grounded general CV', async ({ page }) => {
  await page.goto('/about', { waitUntil: 'domcontentloaded', timeout: 30_000 });

  await expect(page.getByRole('heading', { name: 'Faris Munir Mahdi' })).toBeVisible();

  const saveCv = page.getByRole('button', { name: 'Save CV' });
  await expect(saveCv).toBeVisible();

  const downloadPromise = page.waitForEvent('download', { timeout: 120_000 });
  await saveCv.click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe('Faris_Munir_Mahdi_General_CV.pdf');

  const path = await download.path();
  expect(path).not.toBeNull();

  const info = await stat(path!);
  expect(info.size).toBeGreaterThan(5_000);

  const bytes = await readFile(path!);
  expect(bytes.subarray(0, 4).toString('ascii')).toBe('%PDF');
});
