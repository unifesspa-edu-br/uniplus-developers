// Fixture de navegação para o validador do catálogo de erros — não é a
// navegação do portal. Lista a página cujo code diverge do nome do arquivo.
const sidebars = {
  apiSidebar: [
    {
      type: 'category',
      label: 'Catálogo de erros',
      link: {type: 'doc', id: 'erros/index'},
      items: [
        'erros/uniplus.fixture.catalogo.divergente',
      ],
    },
  ],
};

export default sidebars;
