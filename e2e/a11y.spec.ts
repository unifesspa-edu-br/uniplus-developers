import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Verificação de acessibilidade (WCAG 2.1 A/AA) — obrigatória para autarquia
 * federal (e-MAG 3.1). O escopo é o conteúdo autorado (landmark `main`); o
 * chrome do tema (navbar, widget de busca de terceiros, rodapé) e a página de
 * proof gate (embute o Redoc) são cobertos pela validação de site inteiro
 * pós-deploy (Story #9, CA-07).
 */
const paginas = [
  {nome: 'home', url: '/'},
  {nome: 'cadastros fictícios', url: '/personas/cadastros'},
  {nome: 'personas fictícias', url: '/personas/pessoas-ficticias'},
];

for (const {nome, url} of paginas) {
  test(`${nome} sem violações WCAG 2.1 A/AA`, async ({page}) => {
    await page.goto(url);
    const resultados = await new AxeBuilder({page})
      .include('main')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(resultados.violations).toEqual([]);
  });
}
