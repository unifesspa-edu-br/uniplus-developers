import {defineConfig, devices} from '@playwright/test';

/**
 * E2E do portal contra o build estático servido por `docusaurus serve`.
 * O servidor é iniciado pelo próprio Playwright (webServer). Em CI o build
 * roda antes (ver `.github/workflows/e2e.yml`); localmente, rode `npm run build`
 * antes de `npm run test:e2e`.
 */
// Porta do servidor de E2E. Sobrescrevível por env para não colidir com um
// `docusaurus start` (dev server) já rodando localmente na 3000.
const PORT = Number(process.env.E2E_PORT) || 3000;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['html', {open: 'never'}], ['list']] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {name: 'chromium', use: {...devices['Desktop Chrome']}},
  ],
  webServer: {
    command: `npm run serve -- --port ${PORT} --no-open`,
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
