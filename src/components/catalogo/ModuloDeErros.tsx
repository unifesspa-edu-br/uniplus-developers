import React from 'react';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import type {CatalogoPorModulo} from './tipos';
import styles from './erros.module.css';

export default function ModuloDeErros({dados}: {dados: CatalogoPorModulo}): React.ReactElement {
  const base = useBaseUrl('/erros/');
  return (
    <Layout title={dados.nome}>
      <main className="container margin-vert--lg">
        <article className={`markdown ${styles.entrada}`}>
          <a href={base}>Catálogo de erros</a>
          <h1>{dados.nome}</h1>
          <h2>Códigos por assunto</h2>
          {dados.assuntos.map(({titulo, codigos}) => (
            <section key={titulo}>
              <h3>{titulo}</h3>
              <ul>
                {codigos.map(({codigo, titulo: tituloDoErro}) => (
                  <li key={codigo}>
                    <a href={`${base}${codigo}/`}>{tituloDoErro} <code>{codigo}</code></a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </article>
      </main>
    </Layout>
  );
}
