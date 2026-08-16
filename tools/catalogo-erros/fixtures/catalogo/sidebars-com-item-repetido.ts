// Fixture de navegação para o validador do catálogo de erros — não é a
// navegação do portal. Repete um item: no índice, viraria card duplicado.
const sidebars = {
  apiSidebar: [
    {
      type: 'category',
      label: 'Catálogo de erros',
      link: {type: 'doc', id: 'erros/index'},
      items: [
        'erros/uniplus.fixture.catalogo.primeira',
        'erros/uniplus.fixture.catalogo.segunda',
        'erros/uniplus.fixture.catalogo.primeira',
      ],
    },
  ],
};

export default sidebars;
