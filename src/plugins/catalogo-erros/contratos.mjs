import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {classificar} from './modulos.mjs';
import {carregarRequisitos} from './requisitos.mjs';
import {conferirBloco} from './markdown.mjs';

const ARQUIVOS = ['codigos-de-erro.json', 'descricoes-de-erros.json'];
const CODIGO = /^uniplus(?:\.[a-z0-9_]+)+$/;
const REQUISITO = /^UNI-REQ-[0-9]{4}$/;
const SECOES = ['oQueAconteceu', 'comoResolver', 'ondeAparece'];

export function carregarCatalogo(siteDir) {
  const pasta = join(siteDir, 'src/data/erros');
  const [publicados, textos] = ARQUIVOS.map((arquivo) => lerContrato(pasta, arquivo));
  const requisitos = carregarRequisitos(siteDir);
  return reunirContratos(publicados, textos, requisitos);
}

function lerContrato(pasta, arquivo) {
  const contrato = lerJson(pasta, arquivo);
  if (contrato?.versaoDoFormato !== 1) {
    const versao = Number.isSafeInteger(contrato?.versaoDoFormato) ? contrato.versaoDoFormato : 'inválida';
    throw new Error(`${arquivo}: versão do formato desconhecida (${versao}).`);
  }
  return contrato;
}

export function lerJson(pasta, arquivo) {
  try {
    return JSON.parse(readFileSync(join(pasta, arquivo), 'utf8'));
  } catch {
    throw new Error(`${arquivo}: arquivo ausente ou JSON inválido.`);
  }
}

function porCodigo(entradas, arquivo) {
  if (!Array.isArray(entradas) || entradas.length === 0) {
    throw new Error(`${arquivo}: a lista de entradas está ausente ou vazia.`);
  }
  const mapa = new Map();
  for (const entrada of entradas) {
    const codigo = entrada?.codigo;
    if (typeof codigo !== 'string' || !CODIGO.test(codigo) || /\d{11}/.test(codigo)) {
      throw new Error(`${arquivo}: há um código inválido.`);
    }
    if (mapa.has(codigo)) throw new Error(`${codigo}: código repetido em ${arquivo}.`);
    mapa.set(codigo, entrada);
  }
  return mapa;
}

function reunirContratos(publicados, textos, requisitos) {
  const codigos = porCodigo(publicados.codigos, ARQUIVOS[0]);
  const descricoes = porCodigo(textos.descricoes, ARQUIVOS[1]);
  conferirPares(codigos, descricoes);
  return Array.from(codigos, ([codigo, registro]) => {
    const descricao = descricoes.get(codigo);
    conferirRegistro(registro);
    conferirRequisitos(codigo, descricao.requisitos, requisitos);
    const linksInternos = SECOES.flatMap((secao) => linksDaSecao(codigo, descricao[secao], secao));
    for (const link of linksInternos) conferirLinkDeErro(codigo, link, codigos);
    return {registro, descricao, modulo: classificar(codigo), linksInternos};
  });
}

function conferirPares(codigos, descricoes) {
  const faltam = Array.from(codigos.keys()).filter((codigo) => !descricoes.has(codigo));
  const sobram = Array.from(descricoes.keys()).filter((codigo) => !codigos.has(codigo));
  if (faltam.length || sobram.length) {
    throw new Error([
      ...faltam.map((codigo) => `${codigo}: código sem descrição.`),
      ...sobram.map((codigo) => `${codigo}: descrição sem código.`),
    ].join('\n'));
  }
}

function conferirRegistro({codigo, status, titulo}) {
  if (!Number.isInteger(status) || status < 400 || status > 599) {
    throw new Error(`${codigo}: status HTTP inválido.`);
  }
  if (typeof titulo !== 'string' || !titulo.trim()) {
    throw new Error(`${codigo}: título de erro ausente.`);
  }
}

function conferirRequisitos(codigo, ids, requisitos) {
  if (!Array.isArray(ids)) throw new Error(`${codigo}: lista de requisitos inválida.`);
  for (const id of ids) {
    if (typeof id !== 'string' || !REQUISITO.test(id)) throw new Error(`${codigo}: requisito fora do formato.`);
    if (!requisitos.has(id)) throw new Error(`${codigo}: requisito inexistente (${id}).`);
  }
}

function linksDaSecao(codigo, blocos, secao) {
  if (secao === 'ondeAparece' && blocos === undefined) return [];
  if (!Array.isArray(blocos) || !blocos.length) throw new Error(`${codigo}: seção ${secao} vazia.`);
  return blocos.flatMap((bloco) => conferirBloco(bloco, codigo));
}

function conferirLinkDeErro(codigo, destino, codigos) {
  const {pathname} = new URL(destino, 'https://portal.invalid');
  if (!pathname.startsWith('/erros/uniplus.')) return;
  const alvo = pathname.slice('/erros/'.length).replace(/\/$/, '');
  if (!codigos.has(alvo)) throw new Error(`${codigo}: link para código de erro inexistente.`);
}
