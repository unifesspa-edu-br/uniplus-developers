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

test.describe('Personas (cadastros fictícios)', () => {
  test('vive em /personas/ e lista os 30 cadastros com a tabela enxuta', async ({
    page,
  }) => {
    await page.goto('/personas/');
    await expect(
      page.getByRole('heading', {name: 'Personas fictícias', level: 1}),
    ).toBeVisible();

    // SSR renderiza todos os 30.
    await expect(page.getByText(/30 de 30 cadastros/)).toBeVisible();

    // Tabela enxuta: 5 colunas (Nome, Sexo, CPF, Data de nascimento, Detalhes).
    const headers = page.locator('thead th');
    await expect(headers).toHaveText([
      'Nome',
      'Sexo',
      'CPF',
      'Data de nascimento',
      'Detalhes',
    ]);
  });

  test('as admonitions renderizam como caixa (sem marcador literal)', async ({
    page,
  }) => {
    await page.goto('/personas/');
    // As admonitions viram caixas com classe theme-admonition…
    await expect(page.locator('.theme-admonition').first()).toBeVisible();
    // …e o marcador de diretiva não aparece como texto na página.
    await expect(page.getByText(':::', {exact: false})).toHaveCount(0);
  });

  test('o filtro reduz a lista', async ({page}) => {
    await page.goto('/personas/');
    // Filtra por cidade (Campo Grande → Fernanda); a coluna cidade não aparece,
    // mas o filtro busca nela, então a linha resultante traz o nome esperado.
    await page.getByRole('searchbox', {name: /Filtrar/}).fill('Campo Grande');
    const linhas = page.locator('tbody tr');
    await expect(linhas.first()).toContainText('Fernanda');
    expect(await linhas.count()).toBeLessThan(30);
  });

  test('o modal mostra o nome social e copia o CPF de fato', async ({page}) => {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/personas/');

    // A primeira persona tem nome social (RN02).
    await page
      .locator('tbody tr')
      .first()
      .getByRole('button', {name: /Ver detalhes de/})
      .click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Nome social', {exact: true})).toBeVisible();

    const copyCpf = dialog.getByRole('button', {name: 'Copiar CPF'});
    await copyCpf.click();
    await expect(copyCpf).toHaveText('Copiado!');

    // Verifica que copiou DE FATO (não apenas o rótulo do botão).
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);

    await dialog.getByRole('button', {name: 'Fechar'}).click();
    await expect(dialog).not.toBeVisible();
  });
});
