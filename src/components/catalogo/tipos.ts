export interface CodigoDeErro {
  codigo: string;
  status: number;
  titulo: string;
}

export interface ModuloDeErro {
  id: string;
  nome: string;
}

export interface DescricaoDeErro {
  requisitos: string[];
  oQueAconteceu: string[];
  comoResolver: string[];
  ondeAparece?: string[];
}

interface OrigemDoCatalogo {
  repositorio: string;
  commit: string;
}

export interface EntradaDoCatalogo {
  registro: CodigoDeErro;
  descricao: DescricaoDeErro;
  modulo: ModuloDeErro;
  origem: OrigemDoCatalogo;
}

export interface CatalogoPorModulo extends ModuloDeErro {
  assuntos: Array<{titulo: string; codigos: CodigoDeErro[]}>;
}
