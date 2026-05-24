import React from 'react';

/**
 * Renderiza um identificador `UNI-REQ-NNNN` como ponto de ancoragem estável e
 * copiável.
 *
 * A ocorrência canônica — a linha que define o requisito numa página — recebe o
 * atributo `id` e vira um link permanente para si mesma. Clicar atualiza a URL
 * com `#UNI-REQ-NNNN`, permitindo copiar o endereço exato do ponto, enviar a um
 * colega ou referenciar na documentação do sistema.
 *
 * Referências ao mesmo requisito na própria página (como a coluna "Pai" da
 * matriz) usam `comoReferencia`: apontam para a âncora canônica sem duplicar o
 * `id`, mantendo cada identificador único no documento.
 */
export default function RequisitoId({
  id,
  comoReferencia = false,
}: {
  id: string;
  comoReferencia?: boolean;
}): React.ReactElement {
  if (comoReferencia) {
    return (
      <a href={`#${id}`} className="requisito-id requisito-id--ref">
        <code>{id}</code>
      </a>
    );
  }

  return (
    <a
      id={id}
      href={`#${id}`}
      className="requisito-id requisito-id--anchor"
      title={`Link permanente para ${id}`}>
      <code>{id}</code>
    </a>
  );
}
