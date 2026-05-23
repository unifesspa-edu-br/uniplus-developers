import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import people from '@site/src/data/fake-people.json';

interface Person {
  nome: string;
  /** Nome social — presente apenas em parte das personas (RN02). */
  nome_social?: string;
  idade: number;
  sexo: string;
  data_nasc: string;
  cpf: string;
  rg: string;
  mae: string;
  pai: string;
  email: string;
  cep: string;
  endereco: string;
  numero: number | string;
  bairro: string;
  cidade: string;
  estado: string;
  telefone_fixo: string;
  celular: string;
}

const data = people as Person[];

/** Display labels (pt-BR) for every field shown in the details dialog. */
const FIELD_LABELS: Record<keyof Person, string> = {
  nome: 'Nome',
  nome_social: 'Nome social',
  idade: 'Idade',
  sexo: 'Sexo',
  data_nasc: 'Data de nascimento',
  cpf: 'CPF',
  rg: 'RG',
  mae: 'Mãe',
  pai: 'Pai',
  email: 'E-mail',
  cep: 'CEP',
  endereco: 'Endereço',
  numero: 'Número',
  bairro: 'Bairro',
  cidade: 'Cidade',
  estado: 'UF',
  telefone_fixo: 'Telefone fixo',
  celular: 'Celular',
};

const DETAIL_FIELDS = Object.keys(FIELD_LABELS) as (keyof Person)[];

const COMBINING_MARKS = /[\u0300-\u036f]/g;

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(COMBINING_MARKS, '');
}

/**
 * Copies text to the clipboard, with a fallback for non-secure (http) contexts.
 *
 * The fallback textarea is appended to `container` (the open <dialog>) rather
 * than to <body>: a modal dialog renders the rest of the document inert, so a
 * textarea outside it cannot be selected and the copy silently fails. The
 * execCommand result is checked so the caller never reports a false success.
 */
async function copyText(value: string, container?: HTMLElement): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const root = container ?? document.body;
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  root.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand('copy');
  root.removeChild(textarea);
  if (!ok) throw new Error('Clipboard copy command failed.');
}

function CopyButton({label, value}: {label: string; value: string}): React.ReactElement {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(undefined);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onCopy = useCallback(async () => {
    try {
      // Append the fallback textarea inside the open dialog (not inert).
      const container = buttonRef.current?.closest('dialog') ?? undefined;
      await copyText(value, container);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }, [value]);

  return (
    <button
      ref={buttonRef}
      type="button"
      className="button button--sm button--outline button--primary"
      aria-label={`Copiar ${label}`}
      title={`Copiar ${label}`}
      style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.25rem 0.5rem'}}
      onClick={onCopy}>
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
      )}
    </button>
  );
}

function PersonDialog({
  person,
  onClose,
}: {
  person: Person | null;
  onClose: () => void;
}): React.ReactElement {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (person && !dialog.open) dialog.showModal();
    if (!person && dialog.open) dialog.close();
  }, [person]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="person-dialog-title"
      onClose={onClose}
      onClick={(event) => {
        // Close when the backdrop (the dialog element itself) is clicked.
        if (event.target === ref.current) onClose();
      }}
      style={{
        border: 'none',
        borderRadius: 'var(--radius-govbr-md, 8px)',
        padding: 0,
        maxWidth: 720,
        width: '90vw',
      }}>
      {person && (
        <div style={{padding: 24}}>
          <header
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
              marginBottom: 16,
            }}>
            <h2 id="person-dialog-title" style={{margin: 0}}>
              {person.nome}
            </h2>
            <button
              type="button"
              className="button button--sm button--secondary"
              aria-label="Fechar"
              onClick={onClose}>
              Fechar
            </button>
          </header>
          <dl style={{margin: 0}}>
            {DETAIL_FIELDS.filter(
              (field) => person[field] !== undefined && person[field] !== '',
            ).map((field) => {
              const value = String(person[field]);
              return (
                <div
                  key={field}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '9rem 1fr',
                    gap: 8,
                    alignItems: 'center',
                    padding: '6px 0',
                    borderBottom: '1px solid var(--color-govbr-gray-10, #e6e6e6)',
                  }}>
                  <dt style={{fontWeight: 600, margin: 0}}>{FIELD_LABELS[field]}</dt>
                  <dd
                    style={{
                      margin: 0,
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <span style={{wordBreak: 'break-word'}}>{value}</span>
                    <CopyButton label={FIELD_LABELS[field]} value={value} />
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      )}
    </dialog>
  );
}

/**
 * Catalog of fictitious people. The table renders all rows on the server (empty
 * search) and enables the filter on the client after hydration — no browser API
 * at render time, so it is safe in the static build. Full details open in an
 * accessible dialog with per-field copy buttons (handy for tests).
 */
export default function FakePeopleTable(): React.ReactElement {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Person | null>(null);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return data;
    const digits = q.replace(/\D/g, '');
    return data.filter((person) => {
      const haystack = normalize(
        `${person.nome} ${person.cidade} ${person.estado} ${person.email}`,
      );
      const cpfDigits = person.cpf.replace(/\D/g, '');
      return haystack.includes(q) || (digits.length >= 3 && cpfDigits.includes(digits));
    });
  }, [query]);

  return (
    <div>
      <label htmlFor="people-search" style={{display: 'block', marginBottom: 8}}>
        <strong>Filtrar</strong> (nome, cidade, UF, e-mail ou CPF):
      </label>
      <input
        id="people-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="ex.: Fernanda, Campo Grande, MS, 699…"
        style={{
          width: '100%',
          maxWidth: 420,
          padding: '8px 12px',
          marginBottom: 16,
          border: '1px solid var(--color-govbr-gray-20, #ccc)',
          borderRadius: 'var(--radius-govbr-sm, 4px)',
        }}
      />
      <p>
        <strong>{filtered.length}</strong> de {data.length} cadastros fictícios.
      </p>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Sexo</th>
            <th>CPF</th>
            <th>Data de nascimento</th>
            <th style={{textAlign: 'center'}}>Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((person) => (
            <tr key={person.cpf}>
              <td>{person.nome}</td>
              <td>{person.sexo}</td>
              <td>
                <code>{person.cpf}</code>
              </td>
              <td>{person.data_nasc}</td>
              <td style={{textAlign: 'center'}}>
                <button
                  type="button"
                  className="button button--sm button--primary"
                  aria-label={`Ver detalhes de ${person.nome}`}
                  title="Ver detalhes"
                  style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.25rem 0.5rem'}}
                  onClick={() => setSelected(person)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <PersonDialog person={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
