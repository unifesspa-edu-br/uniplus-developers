/**
 * Tema do Redoc embed — camada 3 do theming dual-layer (ADR-0001).
 *
 * O Redoc recebe o tema como objeto JS via `<RedocStandalone options={{theme}}>`,
 * então esta camada é um módulo TS (não um `.css`): um arquivo CSS não consegue
 * exportar o objeto que o Redoc espera. Os valores referenciam os MESMOS tokens
 * declarados em `govbr-tokens.css` (fonte única), mantendo a coerência visual
 * entre o shell Docusaurus e o Redoc por construção.
 *
 * Os literais aqui espelham os tokens Gov.br DS; quando o pacote
 * `@uniplus/govbr-tokens` existir, passam a ser importados dele.
 */

const govbr = {
  primary: '#1351b4',
  primaryDark: '#0c326f',
  success: '#168821',
  warning: '#ffcd07',
  danger: '#e52207',
  gray80: '#333333',
  gray60: '#636363',
  gray10: '#e6e6e6',
  pure0: '#ffffff',
  fontFamily: "'Rawline', 'Raleway', sans-serif",
  fontCode: "'Roboto Mono', 'SFMono-Regular', Menlo, monospace",
} as const;

/** Objeto de tema consumido por `<RedocSpec>` (options.theme do RedocStandalone). */
export const redocGovbrTheme = {
  colors: {
    primary: { main: govbr.primary },
    success: { main: govbr.success },
    warning: { main: govbr.warning },
    error: { main: govbr.danger },
    text: { primary: govbr.gray80, secondary: govbr.gray60 },
    http: {
      get: govbr.success,
      post: govbr.primary,
      put: '#155bcb',
      delete: govbr.danger,
    },
  },
  typography: {
    fontSize: '14px',
    fontFamily: govbr.fontFamily,
    headings: { fontFamily: govbr.fontFamily, fontWeight: '700' },
    code: { fontFamily: govbr.fontCode },
  },
  sidebar: {
    backgroundColor: '#edf5ff',
    textColor: govbr.gray80,
  },
  rightPanel: {
    backgroundColor: govbr.primaryDark,
    textColor: govbr.pure0,
  },
} as const;
