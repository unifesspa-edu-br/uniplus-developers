// Fixture de navegação para o validador do catálogo de erros — não é a
// navegação do portal. Lista um item sem página correspondente.
const sidebars = {
  apiSidebar: [
    {
      type: 'category',
      label: 'Catálogo de erros',
      link: {type: 'doc', id: 'erros/index'},
      items: [
        'erros/uniplus.fixture.catalogo.primeira',
        'erros/uniplus.fixture.catalogo.segunda',
        'erros/uniplus.fixture.catalogo.inexistente',
      ],
    },
  ],
};

export default sidebars;
