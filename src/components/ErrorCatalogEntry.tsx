import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import BlocosDaDescricao from './catalogo/BlocosDaDescricao';
import {BLOCO, Item, LISTA} from './catalogo/estiloCatalogo';
import type {EntradaDoCatalogo} from './catalogo/tipos';
import styles from './catalogo/erros.module.css';

export default function ErrorCatalogEntry({dados}: {dados: EntradaDoCatalogo}): React.ReactElement {
  const {registro, descricao, modulo, origem} = dados;
  const {siteConfig} = useDocusaurusContext();
  const typeUri = siteConfig.url + useBaseUrl(`/erros/${registro.codigo}`);
  const requisitos = useBaseUrl('/produto/requisitos/');
  const paginaDoModulo = useBaseUrl(`/erros/modulos/${modulo.id}/`);
  const fonte = `https://github.com/${origem.repositorio}/blob/${origem.commit}/contracts/descricoes-de-erros.json`;

  return (
    <article className={`markdown ${styles.entrada}`}>
      <header>
        <h1>{registro.titulo}</h1>
        <dl style={{...BLOCO, ...LISTA}}>
          <Item rotulo="Código"><code>{registro.codigo}</code></Item>
          <Item rotulo="Status HTTP">{registro.status}</Item>
          <Item rotulo="Módulo"><a href={paginaDoModulo}>{modulo.nome}</a></Item>
          <Item rotulo="Campo type"><code>{typeUri}</code></Item>
          {descricao.requisitos.length > 0 && (
            <Item rotulo="Requisitos">
              <ul className={styles.requisitos}>
                {descricao.requisitos.map((id) => (
                  <li key={id}><a href={`${requisitos}#${id}`}>{id}</a></li>
                ))}
              </ul>
            </Item>
          )}
        </dl>
      </header>
      <h2 id="o-que-aconteceu">O que aconteceu</h2>
      <BlocosDaDescricao blocos={descricao.oQueAconteceu} />
      <h2 id="como-resolver">Como resolver</h2>
      <BlocosDaDescricao blocos={descricao.comoResolver} />
      {descricao.ondeAparece && (
        <>
          <h2 id="onde-aparece">Onde aparece</h2>
          <BlocosDaDescricao blocos={descricao.ondeAparece} />
        </>
      )}
      <footer className={styles.fonte}>
        <a href={fonte}>Editar</a>
        <p>Fonte na API <a href={fonte}><code>{origem.commit}</code></a></p>
      </footer>
    </article>
  );
}
