import React, {useMemo, useState} from 'react';
import {
  GRUPO_LABEL,
  NIVEL_LABEL,
  POLITICA_LABEL,
  PRIORIDADE_LABEL,
  RECORTE_LABEL,
  STATUS_LABEL,
  TIPO_LABEL,
  tipoIssueLabel,
} from '@site/src/data/produto/taxonomia';
import type {Requisito} from '@site/src/data/produto/taxonomia';
import {RecorteTag, StatusTag} from './Tag';

type FiltroCampo = 'grupo' | 'tipo' | 'status' | 'recorte';

const COMBINING_MARKS = /[\u0300-\u036f]/g;

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(COMBINING_MARKS, '');
}

const SELECT_STYLE: React.CSSProperties = {
  padding: '6px 10px',
  border: '1px solid var(--color-govbr-gray-20, #ccc)',
  borderRadius: 'var(--radius-govbr-sm, 4px)',
};

/**
 * Tabela pública e filtrável de requisitos curados. Renderiza a lista completa
 * no servidor (sem API de browser no render) e habilita busca e filtros no
 * cliente após a hidratação — seguro no build estático. O enunciado, os
 * critérios de aceite e a verificação ficam em um detalhe expansível por linha,
 * mantendo a tabela compacta sem esconder a rastreabilidade.
 */
export default function RequisitosTable({
  requisitos,
  filtros = ['grupo', 'status', 'recorte'],
}: {
  requisitos: Requisito[];
  filtros?: FiltroCampo[];
}): React.ReactElement {
  const [busca, setBusca] = useState('');
  const [grupo, setGrupo] = useState('');
  const [tipo, setTipo] = useState('');
  const [status, setStatus] = useState('');
  const [recorte, setRecorte] = useState('');

  // Opções derivadas do conjunto recebido — uma página que passa dados já
  // filtrados (ex.: só regras de negócio) só oferece os filtros relevantes.
  const opcoes = useMemo(() => {
    const uniq = (key: keyof Requisito) =>
      Array.from(new Set(requisitos.map((r) => r[key] as string))).sort();
    return {
      grupo: uniq('grupo'),
      tipo: uniq('tipo'),
      status: uniq('status'),
      recorte: uniq('recorte'),
    };
  }, [requisitos]);

  const filtrados = useMemo(() => {
    const q = normalize(busca.trim());
    return requisitos.filter((r) => {
      if (grupo && r.grupo !== grupo) return false;
      if (tipo && r.tipo !== tipo) return false;
      if (status && r.status !== status) return false;
      if (recorte && r.recorte !== recorte) return false;
      if (!q) return true;
      return normalize(`${r.requisito_id} ${r.titulo} ${r.enunciado}`).includes(q);
    });
  }, [requisitos, busca, grupo, tipo, status, recorte]);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'flex-end',
          marginBottom: 16,
        }}>
        <label style={{display: 'flex', flexDirection: 'column', gap: 4}}>
          <strong>Buscar</strong>
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="ex.: inscrição, UNI-REQ-0023, snapshot…"
            style={{...SELECT_STYLE, minWidth: 260}}
          />
        </label>

        {filtros.includes('grupo') && (
          <label style={{display: 'flex', flexDirection: 'column', gap: 4}}>
            <strong>Grupo</strong>
            <select value={grupo} onChange={(e) => setGrupo(e.target.value)} style={SELECT_STYLE}>
              <option value="">Todos</option>
              {opcoes.grupo.map((g) => (
                <option key={g} value={g}>
                  {GRUPO_LABEL[g as keyof typeof GRUPO_LABEL]}
                </option>
              ))}
            </select>
          </label>
        )}

        {filtros.includes('tipo') && (
          <label style={{display: 'flex', flexDirection: 'column', gap: 4}}>
            <strong>Tipo</strong>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={SELECT_STYLE}>
              <option value="">Todos</option>
              {opcoes.tipo.map((t) => (
                <option key={t} value={t}>
                  {TIPO_LABEL[t as keyof typeof TIPO_LABEL]}
                </option>
              ))}
            </select>
          </label>
        )}

        {filtros.includes('status') && (
          <label style={{display: 'flex', flexDirection: 'column', gap: 4}}>
            <strong>Status</strong>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={SELECT_STYLE}>
              <option value="">Todos</option>
              {opcoes.status.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s as keyof typeof STATUS_LABEL]}
                </option>
              ))}
            </select>
          </label>
        )}

        {filtros.includes('recorte') && (
          <label style={{display: 'flex', flexDirection: 'column', gap: 4}}>
            <strong>Recorte</strong>
            <select value={recorte} onChange={(e) => setRecorte(e.target.value)} style={SELECT_STYLE}>
              <option value="">Todos</option>
              {opcoes.recorte.map((r) => (
                <option key={r} value={r}>
                  {RECORTE_LABEL[r as keyof typeof RECORTE_LABEL]}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <p>
        <strong>{filtrados.length}</strong> de {requisitos.length} requisitos.
      </p>

      <table tabIndex={0}>
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Requisito</th>
            <th scope="col">Grupo</th>
            <th scope="col">Tipo</th>
            <th scope="col">Status</th>
            <th scope="col">Recorte</th>
          </tr>
        </thead>
        <tbody>
          {filtrados.map((r) => (
            <tr key={r.requisito_id}>
              <td>
                <code>{r.requisito_id}</code>
              </td>
              <td>
                <details>
                  <summary style={{cursor: 'pointer', fontWeight: 600}}>{r.titulo}</summary>
                  <div style={{marginTop: 8, fontWeight: 400}}>
                    <p style={{margin: '4px 0'}}>{r.enunciado}</p>
                    <p style={{margin: '4px 0'}}>
                      <strong>Critérios de aceite:</strong> {r.criterios_aceite}
                    </p>
                    <p style={{margin: '4px 0'}}>
                      <strong>Verificação:</strong> {r.verificacao}
                    </p>
                    <p style={{margin: '4px 0'}}>
                      <strong>Nível:</strong> {NIVEL_LABEL[r.nivel]} ·{' '}
                      <strong>Prioridade:</strong> {PRIORIDADE_LABEL[r.prioridade]} ·{' '}
                      <strong>Backlog:</strong> {POLITICA_LABEL[r.politica_backlog]} ·{' '}
                      <strong>Issue:</strong> {tipoIssueLabel(r.tipo_issue_recomendado)} ·{' '}
                      <strong>Owner:</strong> {r.owner}
                    </p>
                  </div>
                </details>
              </td>
              <td>{GRUPO_LABEL[r.grupo]}</td>
              <td>{TIPO_LABEL[r.tipo]}</td>
              <td>
                <StatusTag status={r.status} label={STATUS_LABEL[r.status]} />
              </td>
              <td>
                <RecorteTag recorte={r.recorte} label={RECORTE_LABEL[r.recorte]} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
