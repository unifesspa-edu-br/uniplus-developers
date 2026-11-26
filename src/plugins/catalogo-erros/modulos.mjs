const MODULOS = new Map([
  ['autorizacao', 'Autorização'],
  ['configuracao', 'Configuração'],
  ['discentes', 'Discentes'],
  ['ingresso', 'Ingresso'],
  ['organizacao', 'Organização institucional'],
  ['portal', 'Portal'],
  ['publicacoes', 'Publicações'],
  ['selecao', 'Seleção'],
]);

const TRANSVERSAIS = new Set([
  'auth', 'cidade_referencia', 'clausula_dnf', 'concorrencia', 'condicao_dnf',
  'consulta', 'contract', 'copia_da_oferta_de_curso', 'cpf', 'cursor', 'email',
  'endereco_referencia', 'erro_nao_mapeado', 'estrutura_formulario', 'formulario_portavel', 'grafo_formulario',
  'grupo_formulario', 'idempotency', 'internal', 'item_formulario',
  'nome_social', 'nota_final', 'paginacao', 'percentual', 'predicado_dnf',
  'regra_derivacao', 'regras_derivacao_fato', 'requisicao', 'restricao_valor',
  'termo_formulario', 'validacao', 'vinculo_catalogo',
]);

const ROTULOS = new Map([
  ['auth', 'Autenticação e acesso'],
  ['contract', 'Contrato HTTP'],
  ['cpf', 'CPF'],
  ['idempotency', 'Idempotência'],
  ['internal', 'Erros internos'],
  ['erro_nao_mapeado', 'Erros de domínio'],
]);

function rotulo(assunto) {
  const texto = assunto.replaceAll('_', ' ');
  return ROTULOS.get(assunto) ?? texto[0].toUpperCase() + texto.slice(1);
}

export function classificar(codigo) {
  const [, modulo, assunto] = codigo.split('.');
  if (MODULOS.has(modulo)) {
    return {id: modulo, nome: MODULOS.get(modulo), assunto: rotulo(assunto ?? 'geral')};
  }
  if (TRANSVERSAIS.has(modulo)) {
    return {id: 'transversais', nome: 'Erros transversais', assunto: rotulo(modulo)};
  }
  throw new Error(`${codigo}: módulo desconhecido no catálogo de erros.`);
}
