import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  expect: {
    timeout: 15_000
  },
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'https://farismnrr.com',
    headless: true,
    trace: 'retain-on-failure'
  },
  reporter: 'line'
});
