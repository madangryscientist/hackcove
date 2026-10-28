/**
 * Reads what `packages/ui/src/index.ts` exports (types and JSDoc) with react-docgen-typescript and
 * the TypeScript checker: the props of every component, and the signature of every helper.
 * `className` and `style` are left out: the library has no styling escape hatch to document. Props
 * that only come from React's DOM types (`onClick`) and the `aria-*` props are described once, in
 * prose; the react-aria props a component picks (`DateField`'s `value`) are its own and stay.
 */
import { globSync } from "node:fs";
import { dirname, join } from "node:path";
import { withCustomConfig, type PropItem } from "react-docgen-typescript";
import ts from "typescript";
import type { ComponentDoc, PropDoc, PropsJson } from "../src/docs/types.js";

const UI = join(import.meta.dirname, "..", "..", "..", "packages", "ui");
const TSCONFIG = join(UI, "tsconfig.json");
const INDEX = join(UI, "src", "index.ts");
/** Where `scripts/props.ts` writes the result and the docs read it. */
export const PROPS_JSON = join(import.meta.dirname, "..", "src", "generated", "props.json");
const LEFT_OUT = new Set(["className", "style"]);

const fromDom = (prop: PropItem): boolean =>
  prop.name.startsWith("aria-") ||
  ((prop.declarations ?? []).length > 0 &&
    (prop.declarations ?? []).every((d) => d.fileName.includes("/@types/react")));

function typeOf(prop: PropItem): string {
  const { name, value } = prop.type;
  if (name === "enum" && Array.isArray(value)) {
    return value.map((v: { value: string }) => v.value).join(" | ");
  }
  return name;
}

function propDoc(prop: PropItem): PropDoc {
  const fallback = prop.defaultValue?.value;
  return {
    name: prop.name,
    type: typeOf(prop),
    required: prop.required,
    default: fallback === undefined ? undefined : String(fallback),
    description: prop.description,
  };
}

function program(): ts.Program {
  const { config } = ts.readConfigFile(TSCONFIG, (path) => ts.sys.readFile(path));
  const { options } = ts.parseJsonConfigFileContent(config, ts.sys, dirname(TSCONFIG));
  const files = globSync("src/*.{ts,tsx}", { cwd: UI }).map((f) => join(UI, f));
  return ts.createProgram(files, options);
}

const typeOnly = (symbol: ts.Symbol): boolean =>
  (symbol.declarations ?? []).every(
    (d) => ts.isExportSpecifier(d) && (d.isTypeOnly || d.parent.parent.isTypeOnly),
  );

/** The value exports of `index.ts` (types left out), each resolved to its declaration. */
function exportsOf(checker: ts.TypeChecker, index: ts.SourceFile): Map<string, ts.Symbol> {
  const module = checker.getSymbolAtLocation(index);
  if (module === undefined) throw new Error(`${INDEX}: not a module`);
  const values = checker.getExportsOfModule(module).flatMap((symbol) => {
    if (typeOnly(symbol)) return [];
    const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
    return target.flags & ts.SymbolFlags.Value ? [[symbol.name, target] as const] : [];
  });
  return new Map(values);
}

/** A helper (an export that starts lower-case, so not a component): its JSDoc and signature. */
function helperDoc(checker: ts.TypeChecker, name: string, symbol: ts.Symbol): ComponentDoc {
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
  if (declaration === undefined) throw new Error(`${name}: no declaration`);
  const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
  const flags =
    ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope;
  const calls = type.getCallSignatures();
  const signature =
    calls.length > 0
      ? calls
          .map((call) => `${name}${checker.signatureToString(call, declaration, flags)}`)
          .join("\n")
      : `${name}: ${checker.typeToString(type, declaration, flags)}`;
  return {
    name,
    description: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
    signature,
    props: [],
  };
}

/** Every export of `@hackcove/ui`, in name order: a component's props, a helper's signature. */
export function generateProps(): PropsJson {
  const source = program();
  const checker = source.getTypeChecker();
  const index = source.getSourceFile(INDEX);
  if (index === undefined) throw new Error(`${INDEX}: not in the program`);
  const exported = exportsOf(checker, index);
  const parser = withCustomConfig(TSCONFIG, {
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    savePropValueAsString: true,
    propFilter: (prop) => !LEFT_OUT.has(prop.name) && !fromDom(prop),
  });
  const files = [
    ...new Set([...exported.values()].map((s) => s.declarations?.[0]?.getSourceFile())),
  ]
    .flatMap((file) =>
      file === undefined || !file.fileName.endsWith(".tsx") ? [] : [file.fileName],
    )
    .toSorted();
  const components = new Map(
    parser.parseWithProgramProvider(files, () => source).map((doc) => [doc.displayName, doc]),
  );
  const docs = [...exported.entries()].map(([name, symbol]): ComponentDoc => {
    if (/^[a-z]/.test(name)) return helperDoc(checker, name, symbol);
    const doc = components.get(name);
    if (doc === undefined)
      throw new Error(`${name}: exported, but react-docgen-typescript did not read it`);
    return {
      name,
      description: doc.description,
      props: Object.values(doc.props)
        .map(propDoc)
        .toSorted((a, b) => a.name.localeCompare(b.name)),
    };
  });
  return Object.fromEntries(
    docs.toSorted((a, b) => a.name.localeCompare(b.name)).map((doc) => [doc.name, doc]),
  );
}
