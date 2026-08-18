import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// `import.meta.dirname` só existe a partir do Node 20.11 — o `engines` do
// projeto declara `>=20.0`. `fileURLToPath(import.meta.url)` é suportado
// desde o Node 10 com ESM e cobre todo o range declarado.
const DIRNAME = path.dirname(fileURLToPath(import.meta.url));

/**
 * Testes de componente (`src/components/**\/*.test.tsx`) rodam fora do
 * runtime do Docusaurus, então os módulos `@docusaurus/*` — que só existem
 * dentro do build/dev server — são apontados para stubs em `test/mocks/`.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['src/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@docusaurus/useBaseUrl': path.resolve(
        DIRNAME,
        'test/mocks/useBaseUrl.ts',
      ),
      '@docusaurus/useDocusaurusContext': path.resolve(
        DIRNAME,
        'test/mocks/useDocusaurusContext.ts',
      ),
    },
  },
});
