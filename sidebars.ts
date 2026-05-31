import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// Roda em Node.js — não usar código client-side aqui.

/**
 * Trilhas conforme ADR-0001 e a decisão de produto:
 * - `produtoSidebar`     — requisitos, regras de negócio, casos de uso (PO + DEV)
 * - `apiSidebar`         — referência de API (integradores)
 * - `arquiteturaSidebar` — decisões estruturais e padrões (quem implementa/opera);
 *                          indexa ADRs sem duplicar autoridade (ADR-0002).
 */
const sidebars: SidebarsConfig = {
  produtoSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Produto e domínio',
      collapsed: false,
      items: [
        'produto/visao',
        'produto/taxonomia-rastreabilidade-requisitos',
        'produto/requisitos/index',
        'produto/regras-negocio/index',
        'produto/rastreabilidade/index',
        'produto/mvp-selecao/index',
        'produto/checklist-publicacao/index',
      ],
    },
    {
      type: 'category',
      label: 'Convenções',
      collapsed: false,
      items: ['personas/cadastros'],
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

  arquiteturaSidebar: [
    'arquitetura/visao',
    {
      type: 'category',
      label: 'Frontend Angular',
      collapsed: false,
      items: ['arquitetura/frontend/estilos-angular'],
    },
    {
      type: 'category',
      label: 'Persistência e eventos',
      collapsed: false,
      items: [
        'arquitetura/event-sourcing/index',
        'arquitetura/congelamento-snapshot/index',
      ],
    },
    {
      type: 'category',
      label: 'Decisões arquiteturais',
      collapsed: false,
      items: ['arquitetura/adrs/index'],
    },
  ],
};

export default sidebars;
