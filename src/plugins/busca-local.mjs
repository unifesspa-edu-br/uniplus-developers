import {createRequire} from 'node:module';

const buscaLocal = createRequire(import.meta.url)('@easyops-cn/docusaurus-search-local');

export const validateOptions = buscaLocal.validateOptions;

export default function buscaComCatalogo(contexto, opcoes) {
  const tema = buscaLocal.default(contexto, opcoes);
  return {
    ...tema,
    postBuild(dados) {
      // A busca local só indexa rotas reconhecidas como documentos quando a
      // base dos docs é a raiz. Acrescenta as rotas do catálogo à versão atual.
      const prefixo = contexto.baseUrl + 'erros/';
      const rotas = dados.routesPaths.filter((rota) => rota.startsWith(prefixo) && rota !== prefixo);
      return tema.postBuild({...dados, plugins: dados.plugins.map((plugin) => incluirRotas(plugin, rotas))});
    },
  };
}

function incluirRotas(plugin, rotas) {
  if (plugin.name !== 'docusaurus-plugin-content-docs' || plugin.options.id !== 'default') return plugin;
  const {content} = plugin;
  return {
    ...plugin,
    content: {
      ...content,
      loadedVersions: content.loadedVersions.map((versao) => !versao.isLast ? versao : {
        ...versao,
        docs: [...versao.docs, ...rotas.map((permalink) => ({permalink}))],
      }),
    },
  };
}
