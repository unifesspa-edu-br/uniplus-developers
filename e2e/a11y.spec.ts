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

const pages = [
  {name: 'home', url: '/'},
  {name: 'personas (cadastros)', url: '/personas/'},
  {name: 'produto requisitos', url: '/produto/requisitos/'},
  {name: 'produto regras de negócio', url: '/produto/regras-negocio/'},
  {name: 'produto rastreabilidade', url: '/produto/rastreabilidade/'},
  {name: 'produto MVP Seleção', url: '/produto/mvp-selecao/'},
];

for (const {name, url} of pages) {
  test(`${name} sem violações WCAG 2.1 A/AA`, async ({page}) => {
    await page.goto(url);
    const results = await new AxeBuilder({page})
      .include('main')
      .withTags(WCAG_TAGS)
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test('o modal de detalhes da persona sem violações WCAG 2.1 A/AA', async ({
  page,
}) => {
  await page.goto('/personas/');
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
