// Fonte canônica de tipos e rótulos públicos da taxonomia de requisitos.
//
// Espelha as convenções de `docs/produto/taxonomia-rastreabilidade-requisitos.md`
// e os campos públicos seguros definidos pela ADR-0002. Não inclui campos
// internos de curadoria (fontes primárias, arquivos referenciados, evidências
// privadas) — apenas o recorte publicável.

export type Grupo =
  | 'negocio'
  | 'funcional'
  | 'dados'
  | 'qualidade'
  | 'seguranca'
  | 'desempenho'
  | 'conformidade'
  | 'integracao'
  | 'governanca';

export type Tipo =
  | 'requisito_negocio'
  | 'requisito_funcional'
  | 'regra_negocio'
  | 'requisito_qualidade'
  | 'requisito_seguranca'
  | 'requisito_conformidade'
  | 'requisito_dados'
  | 'requisito_integracao'
  | 'requisito_governanca'
  | 'restricao'
  | 'decisao'
  | 'dependencia'
  | 'incremento';

export type Nivel =
  | 'modulo'
  | 'capacidade'
  | 'requisito'
  | 'regra'
  | 'decisao'
  | 'dependencia';

export type Recorte =
  | 'mvp'
  | 'fundacao'
  | 'incremento_obrigatorio'
  | 'fora_escopo'
  | 'governanca';

export type Status =
  | 'aprovado'
  | 'proposto'
  | 'dependencia_externa'
  | 'incremento_planejado'
  | 'historico';

export type Prioridade = 'must' | 'should' | 'could';

export type PoliticaBacklog =
  | 'agregador'
  | 'implementavel'
  | 'criterio_verificacao'
  | 'decisao'
  | 'dependencia_externa'
  | 'incremento_futuro'
  | 'governanca';

export type TipoIssue = 'Epic' | 'Feature' | 'Story' | 'Task' | 'None';

/**
 * Registro público de um requisito. Cada campo é seguro para publicação:
 * não há fontes internas, caminhos de bancada, evidências privadas nem dados
 * reais. As ligações de implementação (issue, PR, código) podem nascer vazias
 * e ser preenchidas conforme a entrega avança.
 */
export interface Requisito {
  requisito_id: string;
  titulo: string;
  enunciado: string;
  grupo: Grupo;
  tipo: Tipo;
  nivel: Nivel;
  /** Requisito agregador, quando existir. Vazio indica raiz da árvore. */
  parent_id: string;
  modulo: string;
  recorte: Recorte;
  status: Status;
  prioridade: Prioridade;
  politica_backlog: PoliticaBacklog;
  tipo_issue_recomendado: TipoIssue;
  criterios_aceite: string;
  verificacao: string;
  /** Rota pública relacionada no portal (referência editorial, não link). */
  pagina_developers: string;
  /** Papel ou unidade responsável pelo acompanhamento. */
  owner: string;
}

export const GRUPO_LABEL: Record<Grupo, string> = {
  negocio: 'Negócio',
  funcional: 'Funcional',
  dados: 'Dados',
  qualidade: 'Qualidade',
  seguranca: 'Segurança',
  desempenho: 'Desempenho',
  conformidade: 'Conformidade',
  integracao: 'Integração',
  governanca: 'Governança',
};

export const TIPO_LABEL: Record<Tipo, string> = {
  requisito_negocio: 'Requisito de negócio',
  requisito_funcional: 'Requisito funcional',
  regra_negocio: 'Regra de negócio',
  requisito_qualidade: 'Requisito de qualidade',
  requisito_seguranca: 'Requisito de segurança',
  requisito_conformidade: 'Requisito de conformidade',
  requisito_dados: 'Requisito de dados',
  requisito_integracao: 'Requisito de integração',
  requisito_governanca: 'Requisito de governança',
  restricao: 'Restrição',
  decisao: 'Decisão',
  dependencia: 'Dependência',
  incremento: 'Incremento',
};

export const NIVEL_LABEL: Record<Nivel, string> = {
  modulo: 'Módulo',
  capacidade: 'Capacidade',
  requisito: 'Requisito',
  regra: 'Regra',
  decisao: 'Decisão',
  dependencia: 'Dependência',
};

export const RECORTE_LABEL: Record<Recorte, string> = {
  mvp: 'MVP',
  fundacao: 'Fundação',
  incremento_obrigatorio: 'Incremento obrigatório',
  fora_escopo: 'Fora de escopo',
  governanca: 'Governança',
};

export const STATUS_LABEL: Record<Status, string> = {
  aprovado: 'Aprovado',
  proposto: 'Proposto',
  dependencia_externa: 'Dependência externa',
  incremento_planejado: 'Incremento planejado',
  historico: 'Histórico',
};

export const PRIORIDADE_LABEL: Record<Prioridade, string> = {
  must: 'Must',
  should: 'Should',
  could: 'Could',
};

export const POLITICA_LABEL: Record<PoliticaBacklog, string> = {
  agregador: 'Agregador',
  implementavel: 'Implementável',
  criterio_verificacao: 'Critério de verificação',
  decisao: 'Decisão',
  dependencia_externa: 'Dependência externa',
  incremento_futuro: 'Incremento futuro',
  governanca: 'Governança',
};

/** Rótulo do tipo de issue recomendado; `None` vira travessão. */
export function tipoIssueLabel(tipo: TipoIssue): string {
  return tipo === 'None' ? '—' : tipo;
}
