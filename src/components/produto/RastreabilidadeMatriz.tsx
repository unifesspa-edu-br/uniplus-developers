import React from 'react';
import {
  NIVEL_LABEL,
  POLITICA_LABEL,
  STATUS_LABEL,
} from '@site/src/data/produto/taxonomia';
import type {Requisito} from '@site/src/data/produto/taxonomia';
import RequisitoId from './RequisitoId';
import {StatusTag} from './Tag';

/**
 * Matriz pública de rastreabilidade. Publica a visão consolidada — requisito,
 * pai, nível, status, política de backlog, verificação e página relacionada —
 * sem inventar vínculos de issue, PR ou código que ainda não existem. Lacunas
 * de implementação aparecem como travessão honesto, não como entrega concluída.
 */
export default function RastreabilidadeMatriz({
  requisitos,
}: {
  requisitos: Requisito[];
}): React.ReactElement {
  return (
    <table tabIndex={0}>
      <thead>
        <tr>
          <th scope="col">Requisito</th>
          <th scope="col">Título</th>
          <th scope="col">Nível</th>
          <th scope="col">Pai</th>
          <th scope="col">Status</th>
          <th scope="col">Backlog</th>
          <th scope="col">Verificação</th>
          <th scope="col">Página</th>
        </tr>
      </thead>
      <tbody>
        {requisitos.map((r) => (
          <tr key={r.requisito_id}>
            <td>
              <RequisitoId id={r.requisito_id} />
            </td>
            <td>{r.titulo}</td>
            <td>{NIVEL_LABEL[r.nivel]}</td>
            <td>
              {r.parent_id ? (
                <RequisitoId id={r.parent_id} comoReferencia />
              ) : (
                '—'
              )}
            </td>
            <td>
              <StatusTag status={r.status} label={STATUS_LABEL[r.status]} />
            </td>
            <td>{POLITICA_LABEL[r.politica_backlog]}</td>
            <td>{r.verificacao}</td>
            <td>
              <code>{r.pagina_developers}</code>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
