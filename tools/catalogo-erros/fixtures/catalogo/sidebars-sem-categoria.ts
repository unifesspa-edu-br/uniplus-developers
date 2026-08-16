// Fixture de navegação para o validador do catálogo de erros — não é a
// navegação do portal. Não tem a categoria do catálogo: o validador precisa
// falhar alto, e não devolver lista vazia e aprovar por comparação vacuosa.
const sidebars = {
  apiSidebar: [
    {
      type: 'category',
      label: 'Referência de API',
      items: ['referencia-api/proof-gate'],
    },
  ],
};

export default sidebars;
