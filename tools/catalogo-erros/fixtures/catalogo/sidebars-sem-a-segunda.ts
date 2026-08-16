// Fixture de navegação para o validador do catálogo de erros — não é a
// navegação do portal. Deixa a segunda página fora da navegação.
const sidebars = {
  apiSidebar: [
    {
      type: 'category',
      label: 'Catálogo de erros',
      link: {type: 'doc', id: 'erros/index'},
      items: [
        'erros/uniplus.fixture.catalogo.primeira',
      ],
    },
  ],
};

export default sidebars;
