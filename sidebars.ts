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
        'erros/uniplus.cidade_referencia.codigo_ibge_obrigatorio',
        'erros/uniplus.cidade_referencia.codigo_ibge_formato_invalido',
        'erros/uniplus.cidade_referencia.uf_obrigatoria',
        'erros/uniplus.cidade_referencia.uf_incoerente',
        'erros/uniplus.cidade_referencia.nome_obrigatorio',
        'erros/uniplus.cidade_referencia.nome_caractere_nulo',
        'erros/uniplus.cidade_referencia.nome_tamanho',
        'erros/uniplus.cpf.vazio',
        'erros/uniplus.cpf.invalido',
        'erros/uniplus.email.vazio',
        'erros/uniplus.email.invalido',
        'erros/uniplus.nome_social.nome_civil_vazio',
        'erros/uniplus.nota_final.negativa',
        'erros/uniplus.cursor.invalido',
        'erros/uniplus.cursor.expirado',
        'erros/uniplus.cursor.limit_invalido',
        'erros/uniplus.cursor.direcao_invalida',
        'erros/uniplus.idempotency.key_ausente',
        'erros/uniplus.idempotency.key_malformada',
        'erros/uniplus.publicacoes.tipo_ato.codigo_obrigatorio',
        'erros/uniplus.publicacoes.tipo_ato.codigo_tamanho',
        'erros/uniplus.publicacoes.tipo_ato.codigo_formato',
        'erros/uniplus.publicacoes.tipo_ato.codigo_imutavel',
        'erros/uniplus.publicacoes.tipo_ato.nome_obrigatorio',
        'erros/uniplus.publicacoes.tipo_ato.nome_tamanho',
        'erros/uniplus.publicacoes.tipo_ato.base_legal_tamanho',
        'erros/uniplus.publicacoes.tipo_ato.vigencia_fim_anterior_ao_inicio',
        'erros/uniplus.publicacoes.tipo_ato.vigencia_sobreposta',
        'erros/uniplus.publicacoes.tipo_ato.nao_encontrado',
        'erros/uniplus.publicacoes.tipo_ato.id_divergente',
        'erros/uniplus.publicacoes.ato_normativo.tipo_sem_versao_vigente',
        'erros/uniplus.publicacoes.ato_normativo.versao_invocada_incompleta',
        'erros/uniplus.publicacoes.ato_normativo.ato_retificado_nao_encontrado',
        'erros/uniplus.publicacoes.ato_normativo.classe_congelamento_divergente',
        'erros/uniplus.publicacoes.ato_normativo.raiz_ja_retificada',
        'erros/uniplus.publicacoes.ato_normativo.objeto_ja_tem_ato_vivo_do_tipo',
        'erros/uniplus.idempotency.body_mismatch',
        'erros/uniplus.idempotency.processing_conflict',
        'erros/uniplus.idempotency.principal_requerido',
        'erros/uniplus.idempotency.body_muito_grande',
        'erros/uniplus.organizacao.unidade.nome_obrigatorio',
        'erros/uniplus.organizacao.unidade.nome_tamanho',
        'erros/uniplus.organizacao.unidade.sigla_obrigatoria',
        'erros/uniplus.organizacao.unidade.sigla_tamanho',
        'erros/uniplus.organizacao.unidade.sigla_ja_existe',
        'erros/uniplus.organizacao.unidade.codigo_obrigatorio',
        'erros/uniplus.organizacao.unidade.codigo_tamanho',
        'erros/uniplus.organizacao.unidade.codigo_ja_existe',
        'erros/uniplus.organizacao.unidade.slug_obrigatorio',
        'erros/uniplus.organizacao.unidade.slug_tamanho',
        'erros/uniplus.organizacao.unidade.slug_formato_invalido',
        'erros/uniplus.organizacao.unidade.slug_ja_existe',
        'erros/uniplus.organizacao.unidade.alias_tamanho',
        'erros/uniplus.organizacao.unidade.tipo_invalido',
        'erros/uniplus.organizacao.unidade.vigencia_fim_anterior_ao_inicio',
        'erros/uniplus.organizacao.unidade.superior_nao_encontrado',
        'erros/uniplus.organizacao.unidade.superior_forma_ciclo',
        'erros/uniplus.organizacao.unidade.nao_encontrada',
        'erros/uniplus.organizacao.unidade.remocao_bloqueada_por_subordinadas',
        'erros/uniplus.organizacao.unidade.remocao_bloqueada_por_instituicao',
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
