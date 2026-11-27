import {join} from 'node:path';
import {carregarCatalogo} from './contratos.mjs';

export const NOME = 'catalogo-erros';

export default function catalogoErros({siteDir, baseUrl}) {
  return {
    name: NOME,
    async loadContent() {
      const entradas = carregarCatalogo(siteDir);
      return {entradas};
    },
    getPathsToWatch() {
      return [join(siteDir, 'src/data/erros/*/*.json'), join(siteDir, 'src/data/produto/requisitos-mvp-selecao.ts')];
    },
    async contentLoaded({content: {entradas}, actions}) {
      const modulos = agruparPorModulo(entradas);
      actions.setGlobalData({modulos: modulos.map(({id, nome}) => ({id, nome}))});
      await Promise.all(modulos.map((modulo) => adicionarModulo(actions, baseUrl, modulo)));
      await Promise.all(entradas.map((entrada) => adicionarErro(actions, baseUrl, entrada)));
    },
    postBuild({content, routesPaths}) {
      const rotas = new Set(routesPaths.map(semBarraFinal));
      for (const {registro, linksInternos} of content.entradas) {
        if (linksInternos.some((link) => !rotas.has(semBarraFinal(baseUrl + caminho(link).slice(1))))) {
          throw new Error(`${registro.codigo}: link interno para rota inexistente.`);
        }
      }
    },
  };
}

function agruparPorModulo(entradas) {
  const grupos = new Map();
  for (const {registro, modulo} of entradas) {
    const grupo = grupos.get(modulo.id) ?? {id: modulo.id, nome: modulo.nome, assuntos: new Map()};
    const assunto = grupo.assuntos.get(modulo.assunto) ?? [];
    assunto.push(registro);
    grupo.assuntos.set(modulo.assunto, assunto);
    grupos.set(modulo.id, grupo);
  }
  return Array.from(grupos.values())
    .map(({id, nome, assuntos}) => ({
      id, nome,
      assuntos: Array.from(assuntos, ([titulo, codigos]) => ({titulo, codigos}))
        .sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR')),
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

async function adicionarModulo({createData, addRoute}, baseUrl, modulo) {
  const dados = await createData(`modulo-${modulo.id}.json`, JSON.stringify(modulo));
  addRoute({
    path: `${baseUrl}erros/modulos/${modulo.id}/`,
    component: '@site/src/components/catalogo/ModuloDeErros',
    exact: true,
    modules: {dados},
  });
}

async function adicionarErro({createData, addRoute}, baseUrl, {registro, descricao, modulo, origem}) {
  const dados = await createData(`${registro.codigo}.json`, JSON.stringify({registro, descricao, modulo, origem}));
  addRoute({
    path: `${baseUrl}erros/${registro.codigo}/`,
    component: '@site/src/components/catalogo/PaginaDeErro',
    exact: true,
    modules: {dados},
  });
}

const semBarraFinal = (rota) => rota.replace(/\/$/, '');
const caminho = (link) => new URL(link, 'https://portal.invalid').pathname;
