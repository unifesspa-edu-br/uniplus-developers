import {mkdtempSync, mkdirSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {carregarCatalogo} from './contratos.mjs';

const codigo = 'uniplus.selecao.banca.motivo';
const entrada = {codigo, titulo: 'Motivo da recusa', status: 422};
const descricao = {
  codigo, requisitos: ['UNI-REQ-0001'],
  oQueAconteceu: ['Faltou informar o motivo.'],
  comoResolver: ['Confira o campo.'],
};

function carregar(t, {versao = 1, registro = entrada, texto = descricao} = {}) {
  const raiz = mkdtempSync(join(tmpdir(), 'catalogo-de-erros-'));
  t.after(() => rmSync(raiz, {recursive: true, force: true}));
  const erros = join(raiz, 'src/data/erros');
  const produto = join(raiz, 'src/data/produto');
  mkdirSync(erros, {recursive: true});
  mkdirSync(produto, {recursive: true});
  writeFileSync(join(produto, 'requisitos-mvp-selecao.ts'), `
    const outro = {requisito_id: 'UNI-REQ-9999'};
    export const requisitosMvpSelecao = [{requisito_id: 'UNI-REQ-0001', observacao: "UNI-REQ-8888"}];
  `);
  writeFileSync(join(erros, 'codigos-de-erro.json'), JSON.stringify({versaoDoFormato: 1, codigos: [registro]}));
  writeFileSync(join(erros, 'descricoes-de-erros.json'), JSON.stringify({versaoDoFormato: versao, descricoes: [texto]}));
  return carregarCatalogo(raiz);
}

test('conserva links internos na descrição e classifica o código', (t) => {
  const texto = {...descricao, comoResolver: [`Confira [o código](/erros/${codigo}).`]};
  const [erro] = carregar(t, {texto});
  assert.equal(erro.modulo.nome, 'Seleção');
  assert.deepEqual(erro.linksInternos, [`/erros/${codigo}`]);
});

test('recusa versão desconhecida', (t) => {
  assert.throws(() => carregar(t, {versao: 9}), /descricoes-de-erros\.json: versão do formato desconhecida \(9\)/);
});

test('recusa descrição fora do catálogo', (t) => {
  const outro = 'uniplus.selecao.banca.outro';
  assert.throws(() => carregar(t, {texto: {...descricao, codigo: outro}}),
    /motivo: código sem descrição\.[\s\S]*outro: descrição sem código/);
});

test('recusa requisito que só aparece fora do registro', (t) => {
  assert.throws(() => carregar(t, {texto: {...descricao, requisitos: ['UNI-REQ-9999']}}),
    /motivo: requisito inexistente \(UNI-REQ-9999\)/);
});

test('recusa link para erro inexistente sem reproduzir a descrição', (t) => {
  const texto = {...descricao, comoResolver: ['[Orientação](/erros/uniplus.selecao.banca.ausente)']};
  assert.throws(() => carregar(t, {texto}), {message: `${codigo}: link para código de erro inexistente.`});
});

test('recusa módulo desconhecido citando o código', (t) => {
  const outro = 'uniplus.exemplo_novo.banca.motivo';
  assert.throws(() => carregar(t, {registro: {...entrada, codigo: outro}, texto: {...descricao, codigo: outro}}),
    {message: `${outro}: módulo desconhecido no catálogo de erros.`});
});

test('aceita exemplo cercado e recusa linguagem fora do formato', (t) => {
  const exemplo = {...descricao, comoResolver: ['```json\n{"campo": 1}\n```']};
  assert.doesNotThrow(() => carregar(t, {texto: exemplo}));
  const invalido = {...descricao, comoResolver: ['```js\nvalor\n```']};
  assert.throws(() => carregar(t, {texto: invalido}), /bloco de código inválido/);
});
