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
        'produto/conformidade-legal/index',
        'produto/checklist-publicacao/index',
        {
          type: 'category',
          label: 'Modelo de negócio',
          items: [
            'produto/modelo-negocio/selecao',
            'produto/modelo-negocio/configurar-publicar',
            'produto/modelo-negocio/coleta-fatos-derivacao',
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
      collapsed: false,
      // O `link` de doc é o que faz `useCurrentSidebarCategory()` resolver esta
      // categoria na página de visão geral, que lista as entradas a partir dela.
      link: {type: 'doc', id: 'erros/index'},
      items: [
        'erros/uniplus.selecao.processo_seletivo.localidade_ausente',
        'erros/uniplus.selecao.processo_seletivo.fuso_institucional_nao_reconhecido',
        'erros/uniplus.selecao.processo_seletivo.algoritmo_contagem_prazo_nao_declarado',
        'erros/uniplus.selecao.processo_seletivo.calendario_vigente_ausente',
        'erros/uniplus.selecao.regra_recurso_fase.prazo_em_dias_corridos',
        'erros/uniplus.selecao.regra_recurso_fase.prazo_em_fracao_de_dia_util',
      ],
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
