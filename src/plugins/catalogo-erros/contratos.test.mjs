import {mkdtempSync, mkdirSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {carregarCatalogo} from './contratos.mjs';

const API = 'unifesspa-edu-br/uniplus-api';
const GEO = 'unifesspa-edu-br/unifesspa-geo-api';
const COMMIT = 'a'.repeat(40);
const codigo = 'uniplus.selecao.banca.motivo';
const codigoDoGeo = 'uniplus.geo.importacao.pacote_invalido';
const codigoComum = 'uniplus.validacao';

const registro = (codigo, titulo = 'Título do erro', status = 422) => ({codigo, titulo, status});
const texto = (codigo) => ({
  codigo, requisitos: ['UNI-REQ-0001'],
  oQueAconteceu: ['Faltou informar o motivo.'],
  comoResolver: ['Confira o campo.'],
});
const contrato = (codigos, descricoes, origem = {}) => ({codigos, descricoes, origem});

const contratoDaApi = (extra = {}) => contrato(
  [registro(codigo), registro(codigoComum, 'Validação')], [texto(codigo), texto(codigoComum)],
  {repositorio: API, commit: COMMIT, ...extra});
const contratoDoGeo = (extra = {}) => contrato(
  [registro(codigoDoGeo), registro(codigoComum, 'Validação')], [texto(codigoDoGeo)],
  {repositorio: GEO, commit: COMMIT, ...extra});

function gravar(pasta, {codigos, descricoes, origem}, versao = 1) {
  mkdirSync(pasta, {recursive: true});
  writeFileSync(join(pasta, 'codigos-de-erro.json'), JSON.stringify({versaoDoFormato: 1, codigos}));
  writeFileSync(join(pasta, 'descricoes-de-erros.json'), JSON.stringify({versaoDoFormato: versao, descricoes}));
  writeFileSync(join(pasta, 'origem.json'), JSON.stringify(origem));
}

function carregar(t, {api = contratoDaApi(), geo = contratoDoGeo(), versao = 1} = {}) {
  const raiz = mkdtempSync(join(tmpdir(), 'catalogo-de-erros-'));
  t.after(() => rmSync(raiz, {recursive: true, force: true}));
  const erros = join(raiz, 'src/data/erros');
  const produto = join(raiz, 'src/data/produto');
  mkdirSync(produto, {recursive: true});
  writeFileSync(join(produto, 'requisitos-mvp-selecao.ts'), `
    const outro = {requisito_id: 'UNI-REQ-9999'};
    export const requisitosMvpSelecao = [{requisito_id: 'UNI-REQ-0001', observacao: "UNI-REQ-8888"}];
  `);
  gravar(join(erros, 'uniplus-api'), api, versao);
  gravar(join(erros, 'unifesspa-geo-api'), geo);
  return carregarCatalogo(raiz);
}

const apiComTexto = (alteracao) => {
  const api = contratoDaApi();
  api.descricoes[0] = {...texto(codigo), ...alteracao};
  return api;
};
const mensagem = (...partes) => ({message: partes.join('')});

test('conserva links internos na descrição e classifica o código', (t) => {
  const api = apiComTexto({comoResolver: [`Confira [o código](/erros/${codigo}).`]});
  const erro = carregar(t, {api}).find((item) => item.registro.codigo === codigo);
  assert.equal(erro.modulo.nome, 'Seleção');
  assert.deepEqual(erro.linksInternos, [`/erros/${codigo}`]);
});

test('classifica o código do Geo no módulo Geo e guarda a origem da descrição', (t) => {
  const erro = carregar(t).find((item) => item.registro.codigo === codigoDoGeo);
  assert.equal(erro.modulo.id, 'geo');
  assert.equal(erro.modulo.nome, 'Geo');
  assert.deepEqual(erro.origem, {repositorio: GEO, commit: COMMIT});
});

test('descrição do Geo pode apontar para código comum descrito pela API', (t) => {
  const geo = contratoDoGeo();
  geo.descricoes[0] = {...texto(codigoDoGeo), comoResolver: [`Veja [o erro](/erros/${codigoComum}).`]};
  assert.doesNotThrow(() => carregar(t, {geo}));
});

test('mostra o código comum uma só vez, com a descrição e a origem da API', (t) => {
  const comuns = carregar(t).filter((item) => item.registro.codigo === codigoComum);
  assert.equal(comuns.length, 1);
  assert.equal(comuns[0].origem.repositorio, API);
  assert.deepEqual(comuns[0].descricao, texto(codigoComum));
});

test('recusa versão desconhecida', (t) => {
  assert.throws(() => carregar(t, {versao: 9}), /descricoes-de-erros\.json: versão do formato desconhecida \(9\)/);
});

test('recusa descrição fora do catálogo', (t) => {
  const outro = 'uniplus.selecao.banca.outro';
  assert.throws(() => carregar(t, {api: apiComTexto({codigo: outro})}),
    /motivo: código sem descrição\.[\s\S]*outro: descrição sem código/);
});

test('recusa código do Geo sem descrição', (t) => {
  const geo = contratoDoGeo();
  geo.descricoes = [];
  assert.throws(() => carregar(t, {geo}), /descricoes-de-erros\.json: a lista de entradas está ausente ou vazia/);
  const outro = contratoDoGeo();
  outro.codigos.push(registro('uniplus.geo.importacao.outro'));
  assert.throws(() => carregar(t, {geo: outro}), /importacao\.outro: código sem descrição\./);
});

test('recusa descrição do Geo sem código', (t) => {
  const geo = contratoDoGeo();
  geo.descricoes.push(texto('uniplus.geo.importacao.outro'));
  assert.throws(() => carregar(t, {geo}), /importacao\.outro: descrição sem código\./);
});

test('recusa requisito que só aparece fora do registro', (t) => {
  assert.throws(() => carregar(t, {api: apiComTexto({requisitos: ['UNI-REQ-9999']})}),
    /motivo: requisito inexistente \(UNI-REQ-9999\)/);
});

test('recusa link para erro inexistente sem reproduzir a descrição', (t) => {
  const api = apiComTexto({comoResolver: ['[Orientação](/erros/uniplus.selecao.banca.ausente)']});
  assert.throws(() => carregar(t, {api}), mensagem(codigo, ': link para código de erro inexistente.'));
});

test('recusa módulo desconhecido citando o código', (t) => {
  const outro = 'uniplus.exemplo_novo.banca.motivo';
  const api = contratoDaApi();
  api.codigos[0] = registro(outro);
  api.descricoes[0] = texto(outro);
  assert.throws(() => carregar(t, {api}), mensagem(outro, ': módulo desconhecido no catálogo de erros.'));
});

test('aceita exemplo cercado e recusa linguagem fora do formato', (t) => {
  const exemplo = apiComTexto({comoResolver: ['```json\n{"campo": 1}\n```']});
  assert.doesNotThrow(() => carregar(t, {api: exemplo}));
  const invalido = apiComTexto({comoResolver: ['```js\nvalor\n```']});
  assert.throws(() => carregar(t, {api: invalido}), /bloco de código inválido/);
});

test('recusa origem de outro repositório na pasta do Geo', (t) => {
  assert.throws(() => carregar(t, {geo: contratoDoGeo({repositorio: API})}),
    /unifesspa-geo-api\/origem\.json: origem inválida/);
});

test('recusa origem fora dos dois repositórios aceitos', (t) => {
  assert.throws(() => carregar(t, {api: contratoDaApi({repositorio: 'outra-org/outro-repositorio'})}),
    /uniplus-api\/origem\.json: origem inválida/);
});

test('recusa commit de origem inválido', (t) => {
  assert.throws(() => carregar(t, {geo: contratoDoGeo({commit: 'main'})}), /origem inválida/);
});

test('recusa código comum do Geo ausente na API', (t) => {
  const geo = contratoDoGeo();
  geo.codigos.push(registro('uniplus.cursor.invalido'));
  assert.throws(() => carregar(t, {geo}),
    new RegExp(`uniplus\\.cursor\\.invalido: código do ${GEO} ausente em ${API}`));
});

test('recusa código comum do Geo com título ou status diferente do da API', (t) => {
  const titulo = contratoDoGeo();
  titulo.codigos[1] = registro(codigoComum, 'Outro título');
  assert.throws(() => carregar(t, {geo: titulo}), /uniplus\.validacao: status ou título diferente/);
  const status = contratoDoGeo();
  status.codigos[1] = registro(codigoComum, 'Validação', 400);
  assert.throws(() => carregar(t, {geo: status}), /uniplus\.validacao: status ou título diferente/);
});

test('recusa código do Geo publicado pela API', (t) => {
  const outro = 'uniplus.geo.importacao.outro';
  const api = contratoDaApi();
  api.codigos.push(registro(outro));
  api.descricoes.push(texto(outro));
  assert.throws(() => carregar(t, {api}), new RegExp(`${outro}: código do Geo publicado por ${API}`));
});

test('recusa descrição do mesmo código nas duas pastas citando os dois repositórios', (t) => {
  const geo = contratoDoGeo();
  geo.descricoes.push(texto(codigoComum));
  assert.throws(() => carregar(t, {geo}),
    new RegExp(`uniplus\\.validacao: descrito nos dois repositórios, ${GEO} e ${API}`));
});

test('recusa descrição do Geo para código fora de uniplus.geo.* que a API não descreve', (t) => {
  const geo = contratoDoGeo();
  geo.descricoes.push(texto('uniplus.cursor.invalido'));
  assert.throws(() => carregar(t, {geo}), /uniplus\.cursor\.invalido: descrito por .* só uniplus\.geo\./);
});

test('recusa o mesmo código do Geo descrito nas duas pastas, mesmo publicado pela API', (t) => {
  const api = contratoDaApi();
  api.codigos.push(registro(codigoDoGeo));
  api.descricoes.push(texto(codigoDoGeo));
  assert.throws(() => carregar(t, {api}),
    new RegExp(`${codigoDoGeo}: descrito nos dois repositórios, ${GEO} e ${API}`));
});

test('recusa descrição repetida mesmo quando a API não publica o código', (t) => {
  const api = contratoDaApi();
  api.descricoes.push(texto(codigoDoGeo));
  assert.throws(() => carregar(t, {api}),
    new RegExp(`${codigoDoGeo}: descrito nos dois repositórios, ${GEO} e ${API}`));
});
