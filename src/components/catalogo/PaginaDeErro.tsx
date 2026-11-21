import React from 'react';
import Layout from '@theme/Layout';
import ErrorCatalogEntry from '../ErrorCatalogEntry';
import type {EntradaDoCatalogo} from './tipos';

export default function PaginaDeErro({dados}: {dados: EntradaDoCatalogo}): React.ReactElement {
  return (
    <Layout title={dados.registro.titulo}>
      <main className="container margin-vert--lg">
        <ErrorCatalogEntry dados={dados} />
      </main>
    </Layout>
  );
}
