import React, {useMemo, useState} from 'react';
import pessoas from '@site/src/data/pessoas-fake.json';

interface Pessoa {
  nome: string;
  idade: number;
  sexo: string;
  data_nasc: string;
  signo: string;
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
  altura: string;
  peso: number | string;
  tipo_sanguineo: string;
  cor: string;
}

const dados = pessoas as Pessoa[];

function normaliza(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Catálogo de cadastros fictícios. Renderiza todos os registros no SSR (busca
 * vazia) e habilita o filtro client-side após a hidratação — sem usar APIs de
 * browser, então é seguro no build estático.
 */
export default function PessoasFake(): React.ReactElement {
  const [busca, setBusca] = useState('');

  const filtradas = useMemo(() => {
    const q = normaliza(busca.trim());
    if (!q) return dados;
    const qDigitos = q.replace(/\D/g, '');
    return dados.filter((p) => {
      const alvo = normaliza(`${p.nome} ${p.cidade} ${p.estado} ${p.email}`);
      const cpfDigitos = p.cpf.replace(/\D/g, '');
      return (
        alvo.includes(q) || (qDigitos.length >= 3 && cpfDigitos.includes(qDigitos))
      );
    });
  }, [busca]);

  return (
    <div>
      <label htmlFor="busca-pessoas" style={{display: 'block', marginBottom: 8}}>
        <strong>Filtrar</strong> (nome, cidade, UF, e-mail ou CPF):
      </label>
      <input
        id="busca-pessoas"
        type="search"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
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
        <strong>{filtradas.length}</strong> de {dados.length} cadastros fictícios.
      </p>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Idade</th>
            <th>Sexo</th>
            <th>CPF</th>
            <th>Cidade/UF</th>
            <th>Celular</th>
            <th>E-mail</th>
            <th>Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {filtradas.map((p) => (
            <tr key={p.cpf}>
              <td>{p.nome}</td>
              <td>{p.idade}</td>
              <td>{p.sexo}</td>
              <td>
                <code>{p.cpf}</code>
              </td>
              <td>
                {p.cidade}/{p.estado}
              </td>
              <td>{p.celular}</td>
              <td>{p.email}</td>
              <td>
                <details>
                  <summary>ver</summary>
                  <ul style={{margin: '8px 0', paddingLeft: 18}}>
                    <li>Nascimento: {p.data_nasc} ({p.signo})</li>
                    <li>RG: {p.rg}</li>
                    <li>Mãe: {p.mae}</li>
                    <li>Pai: {p.pai}</li>
                    <li>
                      Endereço: {p.endereco}, {p.numero} — {p.bairro}, CEP {p.cep}
                    </li>
                    <li>Telefone fixo: {p.telefone_fixo}</li>
                    <li>
                      Altura: {p.altura} m · Peso: {p.peso} kg · Sangue:{' '}
                      {p.tipo_sanguineo} · Cor favorita: {p.cor}
                    </li>
                  </ul>
                </details>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
