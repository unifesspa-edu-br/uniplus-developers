/**
 * Stub de `@docusaurus/useBaseUrl` para testes de componente fora do runtime
 * do Docusaurus. Sem `baseUrl` configurado no teste, devolve o caminho como
 * recebido — suficiente para asserções sobre o restante da URI.
 */
export default function useBaseUrl(path: string): string {
  return path;
}
