import {test, expect} from '@playwright/test';

/**
 * A busca é client-side: o runtime baixa um índice gerado no build e pesquisa
 * nele. Se o índice não for emitido, o runtime recebe o HTML da página 404 no
 * lugar do JSON e a pesquisa não retorna nada — falha silenciosa na interface,
 * visível apenas no console. Estes testes cobrem os dois sintomas.
 */
test.describe('Busca', () => {
  test('pesquisar um termo da documentação retorna resultados', async ({
    page,
  }) => {
    await page.goto('search?q=requisitos');

    // Cada resultado é um <article>; sem índice a lista vem vazia.
    const resultados = page.locator('article');
    await expect(resultados.first()).toBeVisible();

    // O termo é do domínio do portal, então a página de requisitos precisa
    // estar entre os resultados — não basta a lista ter itens quaisquer.
    await expect(
      page.getByRole('link', {name: /Requisitos/}).first(),
    ).toHaveAttribute('href', /\/produto\/requisitos\//);
  });

  test('a página de busca carrega o índice sem erro de console', async ({
    page,
  }) => {
    const erros: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        erros.push(msg.text());
      }
    });

    await page.goto('search?q=edital');
    // Esperar a lista renderizar garante que o índice já foi requisitado.
    await expect(page.locator('article').first()).toBeVisible();

    // Sem o índice, o parse do HTML de 404 estoura
    // `Unexpected token '<' ... is not valid JSON`.
    expect(erros).toEqual([]);
  });
});
