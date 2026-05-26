import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// Roda em Node.js — não usar código client-side aqui (APIs de browser, JSX...).

const config: Config = {
  title: 'Uni+ Developers',
  tagline: 'Documentação do Sistema Unificado Unifesspa (S2U)',
  favicon: 'img/favicon.ico',

  future: {
    v4: true, // Compatibilidade com o Docusaurus v4.
  },

  // Domínio de trabalho (staging). O institucional
  // `developers.uniplus.unifesspa.edu.br` é reservado para produção.
  url: 'https://developers.portaluni.com.br',
  baseUrl: '/',

  organizationName: 'unifesspa-edu-br',
  projectName: 'uniplus-developers',

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          // ADRs do repositório não são páginas publicáveis do portal.
          exclude: ['adrs/**'],
          editUrl:
            'https://github.com/unifesspa-edu-br/uniplus-developers/tree/main/',
        },
        blog: false,
        theme: {
          // Camada 1 (tokens) carregada antes da camada 2 (Infima overrides).
          customCss: ['./src/css/govbr-tokens.css', './src/css/custom.css'],
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    [
      // Busca local full-text (client-side) — funciona em GitHub Pages estático.
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['pt', 'en'],
        indexBlog: false,
      },
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Uni+ Developers',
      logo: {
        alt: 'Uni+',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'produtoSidebar',
          position: 'left',
          label: 'Produto',
        },
        {
          type: 'docSidebar',
          sidebarId: 'apiSidebar',
          position: 'left',
          label: 'Referência de API',
        },
        {
          type: 'docSidebar',
          sidebarId: 'arquiteturaSidebar',
          position: 'left',
          label: 'Arquitetura',
        },
        {
          href: 'https://github.com/unifesspa-edu-br/uniplus-developers',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentação',
          items: [
            {label: 'Visão do produto', to: '/produto/visao'},
            {label: 'Personas fictícias', to: '/personas/'},
            {label: 'Referência de API', to: '/referencia-api/proof-gate'},
            {label: 'Arquitetura', to: '/arquitetura/visao'},
          ],
        },
        {
          title: 'Projeto',
          items: [
            {label: 'uniplus-api', href: 'https://github.com/unifesspa-edu-br/uniplus-api'},
            {label: 'uniplus-web', href: 'https://github.com/unifesspa-edu-br/uniplus-web'},
            {label: 'uniplus-developers', href: 'https://github.com/unifesspa-edu-br/uniplus-developers'},
          ],
        },
      ],
      copyright: `Conteúdo sob CC-BY-4.0 · Código sob MIT · © ${new Date().getFullYear()} Unifesspa — CTIC.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
