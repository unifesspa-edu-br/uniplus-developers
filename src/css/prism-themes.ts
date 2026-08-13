import {themes as prismThemes} from 'prism-react-renderer';
import type {PrismTheme} from 'prism-react-renderer';

/**
 * Temas de realce de sintaxe do portal, derivados dos temas prontos do
 * `prism-react-renderer` com as cores que não alcançavam contraste 4.5:1
 * substituídas.
 *
 * WCAG 2.1 AA (1.4.3) e e-MAG 3.1 são obrigatórios para autarquia federal, e o
 * texto realçado dentro de um bloco de código é texto: nenhum tema pronto da
 * biblioteca cumpre o critério em todos os tokens — o melhor deles para (`vsLight`)
 * ainda para em 4.00:1. Os substitutos preservam o matiz do tema original,
 * escurecidos (tema claro) ou clareados (tema escuro) até 5:1, com folga sobre
 * o mínimo para sobreviver a variação de renderização.
 *
 * O ajuste vive aqui, e não em CSS, porque o Prism aplica cor por `style` inline
 * — sobrescrevê-la exigiria `!important` espalhado por regra de tema.
 *
 * Estas cores não vêm do Gov.br DS: o Design System não define paleta de realce
 * de sintaxe, e forçar os tokens institucionais aqui reduziria o realce a dois
 * tons distinguíveis. Cor de código não é elemento de identidade visual.
 */

/** Substituições no tema claro — contraste medido sobre o fundo `#f6f8fa`. */
const CORES_CLARO: Record<string, string> = {
  '#999988': '#6c6c60', // comment, prolog, doctype, cdata — 2.71 → 4.99
  '#e3116c': '#d01063', // string, attr-value              — 4.32 → 5.01
  '#36acaa': '#257674', // number, property, constant, …   — 2.58 → 5.03
  '#00a4db': '#007399', // keyword, attr-name, selector    — 2.69 → 5.04
  '#d73a49': '#c43542', // function, deleted, tag          — 4.30 → 5.01
};

/** Substituições no tema escuro — contraste medido sobre o fundo `#282A36`. */
const CORES_ESCURO: Record<string, string> = {
  'rgb(98, 114, 164)': 'rgb(130, 151, 217)', // comment — 3.03 → 5.01
};

function comContrasteCorrigido(
  tema: PrismTheme,
  substituicoes: Record<string, string>,
): PrismTheme {
  return {
    ...tema,
    styles: tema.styles.map((entrada) => {
      const cor = entrada.style.color;
      const substituta = cor ? substituicoes[cor] : undefined;
      return substituta
        ? {...entrada, style: {...entrada.style, color: substituta}}
        : entrada;
    }),
  };
}

export const prismTemaClaro = comContrasteCorrigido(
  prismThemes.github,
  CORES_CLARO,
);

export const prismTemaEscuro = comContrasteCorrigido(
  prismThemes.dracula,
  CORES_ESCURO,
);
