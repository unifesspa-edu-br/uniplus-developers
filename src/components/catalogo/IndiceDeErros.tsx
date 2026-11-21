import React from 'react';
import {usePluginData} from '@docusaurus/useGlobalData';
import useBaseUrl from '@docusaurus/useBaseUrl';
import type {ModuloDeErro} from './tipos';

export default function IndiceDeErros(): React.ReactElement {
  const {modulos} = usePluginData('catalogo-erros') as {modulos: ModuloDeErro[]};
  const base = useBaseUrl('/erros/modulos/');
  return (
    <ul>
      {modulos.map(({id, nome}) => (
        <li key={id}><a href={`${base}${id}/`}>{nome}</a></li>
      ))}
    </ul>
  );
}
