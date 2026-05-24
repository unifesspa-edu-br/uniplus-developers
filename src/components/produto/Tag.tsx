import React from 'react';
import type {Recorte, Status} from '@site/src/data/produto/taxonomia';

// Etiquetas visuais reutilizadas pelas tabelas de produto. As cores derivam
// dos tokens Gov.br (com fallback) para manter coerência com o tema do portal.

const BASE: React.CSSProperties = {
  display: 'inline-block',
  padding: '0.1rem 0.5rem',
  borderRadius: 'var(--radius-govbr-sm, 4px)',
  fontSize: '0.78rem',
  fontWeight: 600,
  lineHeight: 1.5,
  whiteSpace: 'nowrap',
  border: '1px solid var(--color-govbr-gray-20, #ccc)',
};

const STATUS_STYLE: Record<Status, React.CSSProperties> = {
  aprovado: {
    background: 'var(--color-govbr-success-light)',
    borderColor: 'var(--color-govbr-success)',
  },
  proposto: {
    background: 'var(--color-govbr-warning-light)',
    borderColor: 'var(--color-govbr-warning)',
  },
  dependencia_externa: {
    background: 'var(--color-govbr-danger-light)',
    borderColor: 'var(--color-govbr-danger)',
  },
  incremento_planejado: {
    background: 'var(--color-govbr-info-light)',
    borderColor: 'var(--color-govbr-info)',
  },
  historico: {
    background: 'var(--color-govbr-gray-10)',
    borderColor: 'var(--color-govbr-gray-40)',
  },
};

const RECORTE_STYLE: Record<Recorte, React.CSSProperties> = {
  mvp: {background: 'var(--color-govbr-success-light)'},
  fundacao: {background: 'var(--color-govbr-info-light)'},
  incremento_obrigatorio: {background: 'var(--color-govbr-warning-light)'},
  fora_escopo: {background: 'var(--color-govbr-gray-10)'},
  governanca: {background: 'var(--color-govbr-gray-5)'},
};

export function StatusTag({status, label}: {status: Status; label: string}): React.ReactElement {
  return <span style={{...BASE, ...STATUS_STYLE[status]}}>{label}</span>;
}

export function RecorteTag({recorte, label}: {recorte: Recorte; label: string}): React.ReactElement {
  return <span style={{...BASE, ...RECORTE_STYLE[recorte]}}>{label}</span>;
}
