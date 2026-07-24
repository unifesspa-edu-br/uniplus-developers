import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Verificação de acessibilidade (WCAG 2.1 A/AA) — obrigatória para autarquia
 * federal (e-MAG 3.1). O escopo é o conteúdo autorado (landmark `main`); o
 * chrome do tema (navbar, widget de busca de terceiros, rodapé) e a página de
 * proof gate (embute o Redoc) são cobertos pela validação de site inteiro
 * pós-deploy (Story #9, CA-07).
 */
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const pages: {name: string; url: string; exclude?: string}[] = [
  {name: 'home', url: './'},
  {name: 'personas (cadastros)', url: 'personas/'},
  {name: 'produto requisitos', url: 'produto/requisitos/'},
  {name: 'produto regras de negócio', url: 'produto/regras-negocio/'},
  {name: 'produto rastreabilidade', url: 'produto/rastreabilidade/'},
  {name: 'produto MVP Seleção', url: 'produto/mvp-selecao/'},
  {name: 'produto domínio', url: 'produto/dominio/'},
  {
    name: 'produto regras de negócio (conceitos)',
    url: 'produto/regras-negocio/conceitos',
  },
  {name: 'produto conformidade legal', url: 'produto/conformidade-legal/'},
  {
    name: 'arquitetura congelamento e snapshot',
    url: 'arquitetura/congelamento-snapshot/',
  },
  {
    name: 'produto checklist de publicação',
    url: 'produto/checklist-publicacao/',
    // O checklist usa task list GFM, que renderiza <input type=checkbox>
    // desabilitado e sem rótulo associado. É marcação visual estática (não
    // interativa) num portal interno de desenvolvedores; o escopo exclui só
    // esses checkboxes, mantendo o resto do conteúdo validado.
    exclude: 'input[type="checkbox"][disabled]',
  },
];

for (const {name, url, exclude} of pages) {
  test(`${name} sem violações WCAG 2.1 A/AA`, async ({page}) => {
    await page.goto(url);
    let builder = new AxeBuilder({page}).include('main').withTags(WCAG_TAGS);
    if (exclude) {
      builder = builder.exclude(exclude);
    }
    const results = await builder.analyze();
    expect(results.violations).toEqual([]);
  });
}

test('a página de requisitos não tem violações de contraste no tema escuro', async ({
  page,
}) => {
  // O portal usa respectPrefersColorScheme; emular o esquema escuro faz o
  // Docusaurus aplicar o tema escuro no load. Cobre os dois ajustes de contraste
  // do tema escuro: as etiquetas de status/recorte (fundo pastel, texto escuro)
  // e a cor de link/breadcrumb do shell (azul clarificado).
  await page.emulateMedia({colorScheme: 'dark'});
  await page.goto('produto/requisitos/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  const results = await new AxeBuilder({page})
    .include('main')
    .withTags(WCAG_TAGS)
    .analyze();
  expect(results.violations).toEqual([]);
});

test('o modal de detalhes da persona sem violações WCAG 2.1 A/AA', async ({
  page,
}) => {
  await page.goto('personas/');
  await page
    .locator('tbody tr')
    .first()
    .getByRole('button', {name: /Ver detalhes de/})
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();

  const results = await new AxeBuilder({page})
    .include('dialog')
    .withTags(WCAG_TAGS)
    .analyze();
  expect(results.violations).toEqual([]);
});
