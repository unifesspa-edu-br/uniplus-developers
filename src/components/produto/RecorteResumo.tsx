import React from 'react';
import {
  RECORTE_LABEL,
  STATUS_LABEL,
} from '@site/src/data/produto/taxonomia';
import type {Recorte, Requisito} from '@site/src/data/produto/taxonomia';
import RequisitoId from './RequisitoId';
import {StatusTag} from './Tag';

// Ordem editorial de apresentação dos recortes (do primário ao registrado).
const ORDEM_RECORTE: Recorte[] = [
  'mvp',
  'fundacao',
  'incremento_obrigatorio',
  'governanca',
  'fora_escopo',
];

/**
 * Resumo do recorte do MVP por fronteira de entrega. Agrupa os requisitos
 * curados por `recorte`, mostrando contagem e a lista honesta de itens com seu
 * status — separando o fluxo primário das fundações e dos incrementos.
 */
export default function RecorteResumo({
  requisitos,
}: {
  requisitos: Requisito[];
}): React.ReactElement {
  const grupos = ORDEM_RECORTE.map((recorte) => ({
    recorte,
    itens: requisitos.filter((r) => r.recorte === recorte),
  })).filter((g) => g.itens.length > 0);

  return (
    <div>
      {grupos.map(({recorte, itens}) => (
        <section key={recorte} style={{marginBottom: 24}}>
          <h3 style={{marginBottom: 8}}>
            {RECORTE_LABEL[recorte]}{' '}
            <span style={{fontWeight: 400, color: 'var(--ifm-color-emphasis-800)'}}>
              ({itens.length})
            </span>
          </h3>
          <ul style={{margin: 0}}>
            {itens.map((r) => (
              <li key={r.requisito_id} style={{marginBottom: 4}}>
                <RequisitoId id={r.requisito_id} /> — {r.titulo}{' '}
                <StatusTag status={r.status} label={STATUS_LABEL[r.status]} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
