import {defineConfig, devices} from '@playwright/test';

/**
 * E2E do portal contra o build estático servido por `tools/e2e-server.mjs` —
 * servidor de arquivo cru com resolução de diretório, que é o comportamento do
 * GitHub Pages (o motivo de não usar `docusaurus serve` está no próprio módulo).
 * O servidor é iniciado pelo próprio Playwright (webServer). Em CI o build
 * roda antes (ver `.github/workflows/e2e.yml`); localmente, rode `npm run build`
 * antes de `npm run test:e2e`.
 */
// Porta do servidor de E2E. Sobrescrevível por env para não colidir com um
// `docusaurus start` (dev server) já rodando localmente na 3000.
const PORT = Number(process.env.E2E_PORT) || 3000;
// O portal é publicado em subpath do GitHub Pages, e o servidor de E2E monta o
// build sob o mesmo prefixo. Ele mora aqui (com a barra final, para que os
// paths relativos dos specs resolvam dentro dele) e os specs navegam por paths
// relativos — assim uma futura mudança de baseUrl toca um lugar só.
const BASE_PATH = '/uniplus-developers/';
const baseURL = `http://localhost:${PORT}${BASE_PATH}`;

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
    command: `node tools/e2e-server.mjs --port ${PORT} --dir build --base ${BASE_PATH}`,
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
