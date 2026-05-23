import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {redocGovbrTheme} from '@site/src/css/redoc-theme';

export interface RedocSpecProps {
  /** Nome do arquivo de spec em `static/openapi/` (ex.: `selecao.json`). */
  spec: string;
  /** Renderiza apenas as operações desta tag (opcional). */
  tag?: string;
  /** Renderiza apenas esta operação pelo `operationId` (opcional). */
  operationId?: string;
}

/**
 * Renderiza uma especificação OpenAPI via Redoc, com o tema Gov.br DS aplicado.
 *
 * Envolto em `<BrowserOnly>` obrigatoriamente: o Redoc usa `window` internamente
 * e quebra o build estático do Docusaurus (SSR — "window is not defined") se
 * renderizado no servidor. Ver ADR-0001 deste repositório.
 */
export default function RedocSpec({
  spec,
  tag,
  operationId,
}: RedocSpecProps): React.ReactElement {
  const specUrl = useBaseUrl(`/openapi/${spec}`);
  return (
    <BrowserOnly fallback={<div>Carregando especificação…</div>}>
      {() => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const {RedocStandalone} = require('redoc');
        return (
          <RedocStandalone
            specUrl={specUrl}
            options={{
              theme: redocGovbrTheme,
              scrollYOffset: 60,
              hideDownloadButton: false,
              ...(tag ? {onlyTags: [tag]} : {}),
              ...(operationId ? {onlyOperationIds: [operationId]} : {}),
            }}
          />
        );
      }}
    </BrowserOnly>
  );
}
