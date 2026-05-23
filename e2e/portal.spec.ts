import {test, expect} from '@playwright/test';

test.describe('Portal — navegação e conteúdo', () => {
  test('a home carrega com as duas trilhas no menu', async ({page}) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Uni\+ Developers/);
    await expect(
      page.getByRole('heading', {name: 'Portal de desenvolvedores do Uni+'}),
    ).toBeVisible();
    const navbar = page.locator('.navbar');
    await expect(
      navbar.getByRole('link', {name: 'Produto', exact: true}),
    ).toBeVisible();
    await expect(
      navbar.getByRole('link', {name: 'Referência de API', exact: true}),
    ).toBeVisible();
  });

  test('a página de personas fictícias abre', async ({page}) => {
    await page.goto('/personas/pessoas-ficticias');
    await expect(
      page.getByRole('heading', {name: 'Personas fictícias', level: 1}),
    ).toBeVisible();
  });

  test('a página de proof gate abre', async ({page}) => {
    await page.goto('/referencia-api/proof-gate');
    await expect(
      page.getByRole('heading', {name: /Proof gate/, level: 1}),
    ).toBeVisible();
  });

  test('a página demo do scaffold não existe mais', async ({page}) => {
    const resp = await page.goto('/markdown-page');
    expect(resp?.status()).toBe(404);
  });
});

test.describe('Cadastros fictícios', () => {
  test('lista os 30 cadastros e filtra pela busca', async ({page}) => {
    await page.goto('/personas/cadastros');
    await expect(
      page.getByRole('heading', {name: 'Cadastros fictícios', level: 1}),
    ).toBeVisible();

    // SSR renderiza todos os 30.
    await expect(page.getByText(/30 de 30 cadastros/)).toBeVisible();

    // O filtro reduz a lista após a hidratação.
    await page.getByRole('searchbox', {name: /Filtrar/}).fill('Campo Grande');
    await expect(page.getByText(/de 30 cadastros/)).toBeVisible();
    const linhas = page.locator('tbody tr');
    await expect(linhas.first()).toContainText('Campo Grande');
    expect(await linhas.count()).toBeLessThan(30);
  });

  test('expande os detalhes de um cadastro', async ({page}) => {
    await page.goto('/personas/cadastros');
    const primeira = page.locator('tbody tr').first();
    await primeira.getByRole('group').getByText('ver').click();
    await expect(primeira.getByText(/RG:/)).toBeVisible();
  });
});
