import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// Roda em Node.js — não usar código client-side aqui.

/**
 * Duas trilhas, conforme ADR-0001 e a decisão de produto:
 * - `produtoSidebar`  — requisitos, regras de negócio, casos de uso (PO + DEV)
 * - `apiSidebar`      — referência de API (integradores)
 */
const sidebars: SidebarsConfig = {
  produtoSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Produto e domínio',
      collapsed: false,
      items: ['produto/visao'],
    },
    {
      type: 'category',
      label: 'Convenções',
      collapsed: false,
      items: ['personas/pessoas-ficticias', 'personas/cadastros'],
    },
  ],

  apiSidebar: [
    {
      type: 'category',
      label: 'Referência de API',
      collapsed: false,
      items: ['referencia-api/proof-gate'],
    },
  ],
};

export default sidebars;
