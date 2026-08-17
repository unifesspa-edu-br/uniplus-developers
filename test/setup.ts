import '@testing-library/jest-dom/vitest';
import {afterEach} from 'vitest';
import {cleanup} from '@testing-library/react';

// Sem `globals: true` no vitest.config.ts, a auto-detecção de `afterEach` do
// Testing Library não encontra o test runner — sem este registro explícito,
// o DOM de um teste vaza para o próximo dentro do mesmo arquivo.
afterEach(() => {
  cleanup();
});
