/**
 * Stub de `@docusaurus/useDocusaurusContext` para testes de componente fora
 * do runtime do Docusaurus. `siteConfig.url` é o único campo que os
 * componentes do catálogo consomem (URI absoluta do `type`).
 */
export default function useDocusaurusContext() {
  return {
    siteConfig: {
      url: 'https://unifesspa-edu-br.github.io',
      baseUrl: '/uniplus-developers/',
    },
  };
}
