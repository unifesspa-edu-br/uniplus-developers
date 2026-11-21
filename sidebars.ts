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
        'produto/dominio/index',
        'produto/taxonomia-rastreabilidade-requisitos',
        'produto/requisitos/index',
        'produto/regras-negocio/index',
        'produto/regras-negocio/conceitos',
        'produto/rastreabilidade/index',
        'produto/mvp-selecao/index',
        'produto/casos-de-uso/index',
        'produto/acompanhamento-administrativo',
        'produto/conformidade-legal/index',
        'produto/checklist-publicacao/index',
        'produto/codigo-de-cadastro-institucional',
        {
          type: 'category',
          label: 'Atos de governança de acessos',
          link: {type: 'doc', id: 'produto/governanca-de-acessos/index'},
          items: [
            'produto/governanca-de-acessos/portaria-e-designacao',
            'produto/governanca-de-acessos/termos',
            'produto/governanca-de-acessos/validacoes-institucionais',
          ],
        },
        {
          type: 'category',
          label: 'Modelo de negócio',
          items: [
            'produto/modelo-negocio/selecao',
            'produto/modelo-negocio/configurar-publicar',
            'produto/modelo-negocio/coleta-fatos-derivacao',
            'produto/modelo-negocio/importacao-resultado-sisu',
          ],
        },
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
    {
      type: 'category',
      label: 'Catálogo de erros',
      link: {type: 'doc', id: 'erros/index'},
      items: [],
    },
    {
      type: 'category',
      label: 'Media types',
      collapsed: false,
      items: ['media-types/processo-seletivo/v1'],
    },
    {
      type: 'category',
      label: 'Changelog',
      collapsed: false,
      items: ['changelog/v1.0.0'],
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
