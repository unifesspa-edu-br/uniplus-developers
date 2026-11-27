import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {classificar} from './modulos.mjs';
import {carregarRequisitos} from './requisitos.mjs';
import {conferirBloco} from './markdown.mjs';

const ARQUIVOS = ['codigos-de-erro.json', 'descricoes-de-erros.json'];
const CODIGO = /^uniplus(?:\.[a-z0-9_]+)+$/;
const REQUISITO = /^UNI-REQ-[0-9]{4}$/;
const COMMIT = /^[a-f0-9]{40}$/;
const SECOES = ['oQueAconteceu', 'comoResolver', 'ondeAparece'];
const PREFIXO_DO_GEO = 'uniplus.geo.';
const PASTA_DE_ERROS = 'src/data/erros';

export const REPOSITORIOS = {
  api: {pasta: 'uniplus-api', nome: 'unifesspa-edu-br/uniplus-api'},
  geo: {pasta: 'unifesspa-geo-api', nome: 'unifesspa-edu-br/unifesspa-geo-api'},
};

export function carregarCatalogo(siteDir) {
  const api = lerRepositorio(siteDir, REPOSITORIOS.api);
  const geo = lerRepositorio(siteDir, REPOSITORIOS.geo);
  conferirDescricaoRepetida(api, geo);
  conferirEscopoDoGeo(api, geo);
  conferirCodigosComuns(api, geo);
  const requisitos = carregarRequisitos(siteDir);
  const publicados = new Map([...geo.codigos, ...api.codigos]);
  const textos = new Map([...geo.descricoes, ...api.descricoes]);
  const origens = new Map([
    ...Array.from(geo.descricoes.keys(), (codigo) => [codigo, geo.origem]),
    ...Array.from(api.descricoes.keys(), (codigo) => [codigo, api.origem]),
  ]);
  return Array.from(publicados, ([codigo, registro]) => {
    const descricao = textos.get(codigo);
    conferirRegistro(registro);
    conferirRequisitos(codigo, descricao.requisitos, requisitos);
    const linksInternos = SECOES.flatMap((secao) => linksDaSecao(codigo, descricao[secao], secao));
    for (const link of linksInternos) conferirLinkDeErro(codigo, link, publicados);
    return {registro, descricao, modulo: classificar(codigo), linksInternos, origem: origens.get(codigo)};
  });
}

function lerRepositorio(siteDir, repositorio) {
  const pasta = join(siteDir, PASTA_DE_ERROS, repositorio.pasta);
  const origem = lerOrigem(pasta, repositorio);
  const [publicados, textos] = ARQUIVOS.map((arquivo) => lerContrato(pasta, arquivo));
  const codigos = porCodigo(publicados.codigos, `${repositorio.pasta}/${ARQUIVOS[0]}`);
  const descricoes = porCodigo(textos.descricoes, `${repositorio.pasta}/${ARQUIVOS[1]}`);
  return {repositorio, origem, codigos, descricoes};
}

function lerOrigem(pasta, repositorio) {
  const origem = lerJson(pasta, 'origem.json');
  const aceitos = Object.values(REPOSITORIOS).map(({nome}) => nome);
  if (!aceitos.includes(origem?.repositorio) || origem.repositorio !== repositorio.nome
    || typeof origem.commit !== 'string' || !COMMIT.test(origem.commit)) {
    throw new Error(`${repositorio.pasta}/origem.json: origem inválida; esperado o repositório ${repositorio.nome} e um commit.`);
  }
  return {repositorio: origem.repositorio, commit: origem.commit};
}

function conferirDescricaoRepetida(api, geo) {
  for (const codigo of geo.descricoes.keys()) {
    if (api.descricoes.has(codigo)) {
      throw new Error(`${codigo}: descrito nos dois repositórios, ${geo.repositorio.nome} e ${api.repositorio.nome}; a descrição de código comum é de ${api.repositorio.nome}.`);
    }
  }
}

function conferirEscopoDoGeo(api, geo) {
  for (const codigo of api.codigos.keys()) {
    if (codigo.startsWith(PREFIXO_DO_GEO)) {
      throw new Error(`${codigo}: código do Geo publicado por ${api.repositorio.nome}.`);
    }
  }
  for (const codigo of geo.descricoes.keys()) {
    if (codigo.startsWith(PREFIXO_DO_GEO)) continue;
    throw new Error(`${codigo}: descrito por ${geo.repositorio.nome}, que descreve só ${PREFIXO_DO_GEO}*; a descrição é de ${api.repositorio.nome}.`);
  }
  conferirPares(geo.codigos, geo.descricoes, PREFIXO_DO_GEO);
  conferirPares(api.codigos, api.descricoes);
}

function conferirCodigosComuns(api, geo) {
  for (const [codigo, registro] of geo.codigos) {
    if (codigo.startsWith(PREFIXO_DO_GEO)) continue;
    const daApi = api.codigos.get(codigo);
    if (!daApi) throw new Error(`${codigo}: código do ${geo.repositorio.nome} ausente em ${api.repositorio.nome}.`);
    if (daApi.status !== registro.status || daApi.titulo !== registro.titulo) {
      throw new Error(`${codigo}: status ou título diferente entre ${geo.repositorio.nome} e ${api.repositorio.nome}.`);
    }
  }
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

function conferirPares(codigos, descricoes, prefixo = '') {
  const faltam = Array.from(codigos.keys())
    .filter((codigo) => codigo.startsWith(prefixo) && !descricoes.has(codigo));
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
