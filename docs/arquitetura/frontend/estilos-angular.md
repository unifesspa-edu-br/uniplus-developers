---
sidebar_position: 1
title: Estilos no Angular
description: Como o Uni+ separa contrato visual em CSS e autoria local em SCSS nos componentes Angular.
fonte_canonica: "ADR-0025 do uniplus-web"
---

# Estilos no Angular

O Uni+ separa duas responsabilidades que costumam ser confundidas:

- **Contrato visual**: tokens, temas, base global, anatomia HTML, estados,
  foco e responsividade do Design System.
- **Autoria local**: como um componente Angular organiza os estilos necessários
  para implementar esse contrato.

A decisão canônica está na
[ADR-0025 do `uniplus-web`](https://github.com/unifesspa-edu-br/uniplus-web/blob/main/docs/adrs/0025-autoria-css-scss-no-angular.md).
Esta página é a versão pública e operacional dessa regra.

:::info[Fonte da verdade]
Se esta página e a ADR divergirem, a ADR vence. O portal apenas publica a
orientação consumível para quem implementa ou revisa frontend.
:::

## Regra principal

Use **CSS puro** para a foundation compartilhada e **SCSS quando ele melhorar a
manutenção de componentes Angular**.

Na prática:

- `tokens.css`, `base.css`, `components.css` e os `styles.css` dos apps ficam em
  CSS puro.
- Componentes Angular podem usar `.scss` para estados, variantes, composição
  interna e responsividade local.
- Componentes pequenos podem manter `styles: \`` inline ou CSS simples.
- Tokens visuais continuam sendo CSS custom properties em runtime; SCSS não
  recria paleta, espaçamento, tipografia, radius, sombra ou z-index.

## Por que não escolher só um lado

O Design System do Uni+ é CSS-only para ser portável. Ele demonstra a interface
esperada e expõe tokens runtime, mas não obriga cada frontend a usar CSS puro em
todos os detalhes de implementação.

Ao mesmo tempo, transformar tudo em SCSS também seria um erro: a foundation
precisa continuar fácil de auditar, sincronizar e consumir fora do Angular.

Por isso a fronteira é por camada:

| Camada | Formato recomendado | Regra |
| --- | --- | --- |
| Foundation do DS | CSS | Fonte portável do contrato visual |
| Estilos globais dos apps | CSS | Importam foundation e Tailwind |
| Componentes Angular simples | CSS inline ou CSS simples | Direto quando a regra é pequena |
| Componentes Angular complexos | SCSS | Reduz duplicação e melhora leitura |

## Uso correto de SCSS

SCSS é uma ferramenta de autoria. Use para organizar seletores locais, variantes
e blocos internos de componente.

Exemplo aceitável:

```scss
:host {
  display: block;
}

.ui-card {
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);

  &__header {
    padding: var(--space-4);
  }

  &--selected {
    border-color: var(--color-primary);
  }
}
```

Nesse exemplo, SCSS organiza o seletor, mas os valores continuam vindo dos tokens
runtime do Uni+ DS.

Evite:

```scss
$primary: #155bcb;
$space-4: 1rem;
$radius-md: 0.5rem;
```

Essas variáveis duplicam a fonte de verdade e quebram tema runtime.

## Relação com Angular

Angular não exige SCSS nem CSS puro. A documentação oficial mostra CSS como
default do CLI, mas declara que Angular funciona com qualquer ferramenta que
gere CSS, incluindo Sass/SCSS.

O que importa para o Uni+ é consistência:

- Componentes gerados no `uniplus-web` podem nascer com `.scss`.
- A foundation compartilhada continua em `.css`.
- Revisões de PR verificam se SCSS está consumindo `var(--token)` em vez de
  criar valores paralelos.

## Links úteis

- [ADR-0025 do `uniplus-web`: Autoria CSS/SCSS nos componentes Angular](https://github.com/unifesspa-edu-br/uniplus-web/blob/main/docs/adrs/0025-autoria-css-scss-no-angular.md)
- [ADR-0023 do `uniplus-web`: Uni+ DS como contrato visual vigente](https://github.com/unifesspa-edu-br/uniplus-web/blob/main/docs/adrs/0023-uniplus-ds-como-contrato-visual-vigente.md)
- [ADR-0024 do `uniplus-web`: Uso seletivo de PrimeNG em wrappers `ui-*`](https://github.com/unifesspa-edu-br/uniplus-web/blob/main/docs/adrs/0024-uso-seletivo-primeng-wrappers-ui.md)
- [Angular docs: Styling components](https://angular.dev/guide/components/styling)
- [Angular CLI: generate component](https://angular.dev/cli/generate/component)
- [Angular coding style guide](https://angular.dev/style-guide)
