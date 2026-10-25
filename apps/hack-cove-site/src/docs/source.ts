/**
 * Cuts what the docs show out of a `*.stories.tsx` file with the TypeScript compiler API: the body
 * of a story's `render`, the story's JSDoc as its caption, and the imports the body needs.
 */
import ts from "typescript";

export type StoryParts = {
  /** The imports the snippet uses, then the body of `render`, dedented. */
  code: string;
  /** The story's JSDoc, which the docs show as its caption. */
  caption: string | undefined;
};

const parse = (raw: string) =>
  ts.createSourceFile("story.tsx", raw, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

function exportedStory(file: ts.SourceFile, name: string): ts.VariableStatement | undefined {
  return file.statements.filter(ts.isVariableStatement).find((s) => {
    const exported = s.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;
    return exported && s.declarationList.declarations.some((d) => d.name.getText() === name);
  });
}

function renderOf(statement: ts.VariableStatement): ts.ArrowFunction | undefined {
  const init = statement.declarationList.declarations[0]?.initializer;
  if (init === undefined || !ts.isObjectLiteralExpression(init)) return undefined;
  const render = init.properties.find(
    (p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && p.name.getText() === "render",
  );
  return render !== undefined && ts.isArrowFunction(render.initializer)
    ? render.initializer
    : undefined;
}

/** Dedent by the smallest indent of any non-blank line. */
function dedent(text: string): string {
  const lines = text.split("\n");
  const indents = lines.filter((l) => l.trim() !== "").map((l) => /^ */.exec(l)?.[0].length ?? 0);
  const cut = Math.min(...indents, Number.POSITIVE_INFINITY);
  return lines.map((l) => l.slice(Number.isFinite(cut) ? cut : 0)).join("\n");
}

/** A block body (hooks and a `return`) as `function Example() {…}`, or the expression of a concise one. */
function bodyText(fn: ts.ArrowFunction, raw: string): string {
  const { body } = fn;
  if (ts.isBlock(body)) {
    const first = body.statements[0];
    const last = body.statements.at(-1);
    if (first === undefined || last === undefined) return "";
    const from = raw.lastIndexOf("\n", first.getStart()) + 1;
    const inner = dedent(raw.slice(from, last.end));
    return `function Example() {\n${inner.replace(/^(?=.)/gm, "  ")}\n}`;
  }
  const expression = ts.isParenthesizedExpression(body) ? body.expression : body;
  const from = raw.lastIndexOf("\n", expression.getStart()) + 1;
  if (raw.slice(from, expression.getStart()).trim() === "")
    return dedent(raw.slice(from, expression.end));
  const [first = "", ...rest] = raw.slice(expression.getStart(), expression.end).split("\n");
  return [first, ...dedent(rest.join("\n")).split("\n")].join("\n");
}

/** `import { A, B } from "mod";` for the names a snippet uses, from every package import. */
function importsFor(file: ts.SourceFile, snippet: string): string {
  const used = (name: string) => new RegExp(`\\b${name}\\b`).test(snippet);
  const lines = file.statements.filter(ts.isImportDeclaration).flatMap((decl) => {
    const spec = decl.moduleSpecifier.getText().slice(1, -1);
    const named = decl.importClause?.namedBindings;
    if (spec.startsWith(".") || spec.startsWith("@storybook") || named === undefined) return [];
    if (!ts.isNamedImports(named)) return [];
    const names = named.elements.map((e) => e.name.text).filter(used);
    return names.length === 0 ? [] : [`import { ${names.join(", ")} } from "${spec}";`];
  });
  return lines.join("\n");
}

/** The names a story file declares at top level (not imports): a snippet cannot use them. */
function localNames(file: ts.SourceFile): string[] {
  return file.statements.flatMap((statement) => {
    if (ts.isVariableStatement(statement))
      return statement.declarationList.declarations.flatMap((d) =>
        ts.isIdentifier(d.name) ? [d.name.text] : [],
      );
    return ts.isFunctionDeclaration(statement) && statement.name ? [statement.name.text] : [];
  });
}

/** Every identifier in `node`; a string that happens to contain a word is not one. */
function identifiersIn(node: ts.Node): string[] {
  const found: string[] = ts.isIdentifier(node) ? [node.text] : [];
  node.forEachChild((child) => {
    found.push(...identifiersIn(child));
  });
  return found;
}

function captionOf(statement: ts.VariableStatement): string | undefined {
  const doc = ts.getJSDocCommentsAndTags(statement).find(ts.isJSDoc);
  const text = doc === undefined ? undefined : ts.getTextOfJSDocComment(doc.comment);
  return text?.replace(/\s*\n\s*/g, " ").trim();
}

/** The code and caption of the named story in `raw`, or `undefined` when it has no `render`. */
export function storyParts(raw: string, name: string): StoryParts | undefined {
  const file = parse(raw);
  const statement = exportedStory(file, name);
  const render = statement === undefined ? undefined : renderOf(statement);
  if (statement === undefined || render === undefined) return undefined;
  const body = bodyText(render, raw);
  const stray = identifiersIn(render).find((id) => localNames(file).includes(id));
  if (stray !== undefined) {
    throw new Error(
      `Story "${name}" uses "${stray}" from its own file; a doc snippet must stand alone`,
    );
  }
  const imports = importsFor(file, body);
  return {
    code: imports === "" ? body : `${imports}\n\n${body}`,
    caption: captionOf(statement),
  };
}
