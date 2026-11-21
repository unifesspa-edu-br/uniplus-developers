import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {tipoDeLink} from '../../plugins/catalogo-erros/markdown.mjs';

export default function BlocosDaDescricao({blocos}: {blocos: string[]}): React.ReactElement {
  const base = useBaseUrl('/');
  return (
    <>
      {blocos.map((bloco, indice) => (
        <Markdown
          key={indice}
          skipHtml
          remarkPlugins={[remarkGfm]}
          allowedElements={['p', 'a', 'strong', 'em', 'del', 'code', 'br', 'ul', 'ol', 'li',
            'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td']}
          urlTransform={(destino) => {
            const tipo = tipoDeLink(destino);
            if (tipo === 'portal') {
              const {pathname, search, hash} = new URL(destino, 'https://portal.invalid');
              return base + pathname.slice(1) + search + hash;
            }
            return tipo === 'https' ? destino : undefined;
          }}>
          {bloco}
        </Markdown>
      ))}
    </>
  );
}
