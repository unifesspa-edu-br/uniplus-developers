import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

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
        import.meta.dirname,
        'test/mocks/useBaseUrl.ts',
      ),
      '@docusaurus/useDocusaurusContext': path.resolve(
        import.meta.dirname,
        'test/mocks/useDocusaurusContext.ts',
      ),
    },
  },
});
