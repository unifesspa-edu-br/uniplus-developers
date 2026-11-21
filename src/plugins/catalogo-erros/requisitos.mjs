import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import ts from 'typescript';

const REGISTRO = 'src/data/produto/requisitos-mvp-selecao.ts';

export function carregarRequisitos(siteDir) {
  const fonte = ts.createSourceFile(
    REGISTRO, readFileSync(join(siteDir, REGISTRO), 'utf8'), ts.ScriptTarget.Latest,
  );
  const ids = new Set();
  for (const instrucao of fonte.statements) {
    if (!ts.isVariableStatement(instrucao)) continue;
    for (const declaracao of instrucao.declarationList.declarations) {
      if (declaracao.name.getText(fonte) !== 'requisitosMvpSelecao') continue;
      if (!declaracao.initializer || !ts.isArrayLiteralExpression(declaracao.initializer)) continue;
      for (const elemento of declaracao.initializer.elements) {
        const id = lerId(elemento);
        if (id) ids.add(id);
      }
    }
  }
  if (!ids.size) throw new Error(`${REGISTRO}: registro de requisitos vazio ou inválido.`);
  return ids;
}

// Só a propriedade direta declara um ID. A prosa e os metadados não registram requisitos.
function lerId(elemento) {
  if (!ts.isObjectLiteralExpression(elemento)) return undefined;
  const campo = elemento.properties.find((propriedade) =>
    ts.isPropertyAssignment(propriedade)
    && ts.isIdentifier(propriedade.name)
    && propriedade.name.text === 'requisito_id'
    && ts.isStringLiteralLike(propriedade.initializer),
  );
  return campo?.initializer.text;
}
