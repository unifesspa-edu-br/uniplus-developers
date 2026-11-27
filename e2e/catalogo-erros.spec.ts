import {existsSync, readdirSync} from 'node:fs';
import {join} from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import {expect, test, type Page} from '@playwright/test';
import codigosApi from '../src/data/erros/uniplus-api/codigos-de-erro.json';
import textosApi from '../src/data/erros/uniplus-api/descricoes-de-erros.json';
import origemApi from '../src/data/erros/uniplus-api/origem.json';
import codigosGeo from '../src/data/erros/unifesspa-geo-api/codigos-de-erro.json';
import textosGeo from '../src/data/erros/unifesspa-geo-api/descricoes-de-erros.json';
import origemGeo from '../src/data/erros/unifesspa-geo-api/origem.json';
import {classificar} from '../src/plugins/catalogo-erros/modulos.mjs';

const codigoDaApi = new Set(codigosApi.codigos.map(({codigo}) => codigo));
const codigos = {
  codigos: [...codigosApi.codigos, ...codigosGeo.codigos.filter(({codigo}) => !codigoDaApi.has(codigo))],
};
const descricoes = [
  ...textosApi.descricoes.map((descricao) => ({descricao, origem: origemApi})),
  ...textosGeo.descricoes.map((descricao) => ({descricao, origem: origemGeo})),
];
const amostras = new Map<string, (typeof codigos.codigos)[number]>();
for (const codigo of codigos.codigos) {
  const modulo = classificar(codigo.codigo);
  if (!amostras.has(modulo.id)) amostras.set(modulo.id, codigo);
}

test('a Referência de API leva ao índice, que lista os módulos e passa no axe', async ({page}) => {
  await page.goto('./');
  await page.locator('.navbar').getByRole('link', {name: 'Referência de API', exact: true}).click();
  await page.locator('.theme-doc-sidebar-container').getByRole('link', {name: 'Catálogo de erros'}).click();

  await expect(page.getByRole('heading', {name: 'Catálogo de erros', level: 1})).toBeVisible();
  for (const [id, entrada] of amostras) {
    await expect(page.locator('main').getByRole('link', {name: classificar(entrada.codigo).nome, exact: true}))
      .toHaveAttribute('href', new RegExp(`/erros/modulos/${id}/$`));
  }
  await conferirAcessibilidade(page);
});

test('o módulo Seleção agrupa os códigos por assunto e passa no axe', async ({page}) => {
  await page.goto('erros/modulos/selecao/');
  await expect(page.getByRole('heading', {name: 'Seleção', level: 1})).toBeVisible();
  await expect(page.getByRole('heading', {name: 'Banca', level: 3, exact: true})).toBeVisible();
  await expect(page.getByRole('link', {name: /uniplus\.selecao\.banca\.integrantes_abaixo_do_minimo/}))
    .toHaveAttribute('href', /\/erros\/uniplus\.selecao\.banca\.integrantes_abaixo_do_minimo\/$/);
  await conferirAcessibilidade(page);
});

test('a página preserva o exemplo em bloco de código', async ({page}) => {
  await page.goto('erros/uniplus.clausula_dnf.clausula_vazia/');
  await expect(page.locator('main pre > code').first()).toBeVisible();
  await conferirAcessibilidade(page);
});

test('o build gera um index.html para cada código da API', () => {
  const pasta = join(__dirname, '../build/erros');
  const gerados = readdirSync(pasta, {withFileTypes: true})
    .filter((arquivo) => arquivo.isDirectory() && arquivo.name.startsWith('uniplus.'))
    .map(({name}) => name).sort();
  expect(gerados).toEqual(codigos.codigos.map(({codigo}) => codigo).sort());
  expect(gerados.filter((codigo) => !existsSync(join(pasta, codigo, 'index.html')))).toEqual([]);
});

for (const [id, entrada] of amostras) {
  test(`uma página de ${id} publica o contrato e passa no axe`, async ({page, request}) => {
    const resposta = await page.goto(`erros/${entrada.codigo}/`);
    expect(resposta?.status()).toBe(200);
    const main = page.locator('main');
    const modulo = classificar(entrada.codigo);
    const {descricao, origem} = descricoes.find((item) => item.descricao.codigo === entrada.codigo)!;
    const contrato = `https://github.com/${origem.repositorio}/blob/${origem.commit}/contracts/descricoes-de-erros.json`;

    await expect(main.getByRole('heading', {name: entrada.titulo, level: 1})).toBeVisible();
    await expect(main.locator('dl').getByText(String(entrada.status), {exact: true})).toBeVisible();
    await expect(main.getByRole('link', {name: modulo.nome, exact: true})).toBeVisible();
    await expect(main.getByRole('heading', {name: 'O que aconteceu', level: 2})).toBeVisible();
    await expect(main.getByRole('heading', {name: 'Como resolver', level: 2})).toBeVisible();
    await expect(main.getByRole('heading', {name: 'Onde aparece', level: 2}))
      .toHaveCount(descricao.ondeAparece ? 1 : 0);
    await expect(main.getByRole('link', {name: 'Editar'})).toHaveAttribute('href', contrato);
    await expect(main.getByRole('link', {name: origem.commit})).toHaveAttribute('href', contrato);

    const type = await main.locator('dl code', {hasText: /^https:\/\//}).innerText();
    expect(type).toMatch(/https:\/\/unifesspa-edu-br\.github\.io\/uniplus-developers\/erros\//);
    expect(type.endsWith(`/erros/${entrada.codigo}`)).toBe(true);
    expect((await request.get(new URL(type).pathname)).status()).toBe(200);
    await conferirAcessibilidade(page);
  });
}

test('a banca tem link para o requisito e é encontrada pelo texto da descrição', async ({page}) => {
  const codigo = 'uniplus.selecao.banca.integrantes_abaixo_do_minimo';
  await page.goto(`erros/${codigo}/`);
  await expect(page.getByRole('link', {name: 'UNI-REQ-0387', exact: true}))
    .toHaveAttribute('href', /\/produto\/requisitos\/#UNI-REQ-0387$/);

  await page.goto('search?q=qu%C3%B3rum+corretores+distintos');
  await expect(page.locator('article').locator(`a[href*="${codigo}"]`).first()).toBeVisible();
});

async function conferirAcessibilidade(page: Page) {
  const resultado = await new AxeBuilder({page})
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(resultado.violations).toEqual([]);
}
