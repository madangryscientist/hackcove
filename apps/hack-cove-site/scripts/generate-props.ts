/**
 * Reads what `packages/ui-react/src/index.ts` exports (types and JSDoc) with react-docgen-typescript and
 * the TypeScript checker: the props of every component, and the signature of every helper.
 * `className` and `style` are left out: the library has no styling escape hatch to document. Props
 * that only come from React's DOM types (`onClick`) and the `aria-*` props are described once, in
 * prose, except the few in `NATIVE`, listed as native; the react-aria props a component picks
 * (`DateField`'s `value`) are its own and stay. A prop of a union props type takes its JSDoc arm
 * by arm (`armDocs.ts`), so a text two arms share prints once.
 */
import { globSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { withCustomConfig, type PropItem } from "react-docgen-typescript";
import ts from "typescript";
import type { ComponentDoc, PropDoc, PropsJson, TypeDoc, TypesJson } from "../src/docs/types.js";
import { armDocsOf } from "./armDocs.js";

const UI = join(import.meta.dirname, "..", "..", "..", "packages", "ui-react");
const TSCONFIG = join(UI, "tsconfig.json");
const INDEX = join(UI, "src", "index.ts");
/** Where `scripts/props.ts` writes the result and the docs read it. */
export const PROPS_JSON = join(import.meta.dirname, "..", "src", "generated", "props.json");
/** Where the type exports go, beside the props. */
export const TYPES_JSON = join(import.meta.dirname, "..", "src", "generated", "types.json");
const LEFT_OUT = new Set(["className", "style"]);

/**
 * The DOM props that matter on a component, which its table lists though they come from React's
 * types: each with the one line the table prints for it, since React's types describe none.
 */
export const NATIVE: Record<string, Record<string, string>> = {
  Button: {
    disabled: "Disables the button; say why with `disabledReason` instead where there is a reason.",
    type: '`"button"` by default; `"submit"` submits the form the button is in.',
  },
  Input: {
    type: 'The kind of value: `"text"`, `"email"`, `"search"`, `"password"` and the rest.',
    placeholder: "A hint shown while the field is empty; never the label.",
    name: "The key the value posts under in a form.",
    required: "The form will not submit while the field is empty.",
    disabled: "Disables the field; say why in its `Field` hint.",
  },
  Textarea: {
    rows: "How many lines tall it starts.",
    placeholder: "A hint shown while the field is empty; never the label.",
    name: "The key the value posts under in a form.",
    disabled: "Disables the field; say why in its `Field` hint.",
  },
  Select: {
    name: "The key the value posts under in a form.",
    disabled: "Disables the select; say why in its `Field` hint.",
  },
  Video: { poster: "The image shown before play; use a local one." },
  FileDrop: {
    accept: 'The file types it takes, as on `<input type="file">`: `"image/*"`, `".pdf"`.',
    multiple: "Takes several files at once.",
    name: "The key the files post under in a form.",
    disabled: "Disables the drop zone; say why in its `Field` hint.",
  },
};

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

const nativeOf = (component: string, prop: string): string | undefined => NATIVE[component]?.[prop];

function propDoc(component: string, prop: PropItem, arms: Map<string, string>): PropDoc {
  const fallback = prop.defaultValue?.value;
  const native = fromDom(prop) ? nativeOf(component, prop.name) : undefined;
  const fromArms = arms.get(prop.name);
  return {
    name: prop.name,
    type: typeOf(prop),
    required: prop.required,
    default: fallback === undefined ? undefined : String(fallback),
    description:
      native ?? (fromArms === undefined || fromArms === "" ? prop.description : fromArms),
    native: native !== undefined,
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

/** Every export of `@hackcove/ui-react`, in name order: a component's props, a helper's signature. */
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
    propFilter: (prop, component) =>
      !LEFT_OUT.has(prop.name) &&
      (!fromDom(prop) || nativeOf(component.name, prop.name) !== undefined),
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
        .map((prop) => propDoc(name, prop, armDocsOf(name, checker, symbol)))
        .toSorted((a, b) => a.name.localeCompare(b.name)),
    };
  });
  return Object.fromEntries(
    docs.toSorted((a, b) => a.name.localeCompare(b.name)).map((doc) => [doc.name, doc]),
  );
}

const DEFINITION =
  ts.TypeFormatFlags.NoTruncation |
  ts.TypeFormatFlags.InTypeAlias |
  ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope;

/** A type's definition one level down: an object's fields with their types, else the type itself. */
function definitionOf(checker: ts.TypeChecker, symbol: ts.Symbol): string {
  const type = checker.getDeclaredTypeOfSymbol(symbol);
  const at = symbol.declarations?.[0];
  const isObject = type.flags & ts.TypeFlags.Object && !type.getCallSignatures().length;
  if (!isObject || type.isUnion()) return checker.typeToString(type, at, DEFINITION);
  const fields = checker.getPropertiesOfType(type).map((prop) => {
    const optional = prop.flags & ts.SymbolFlags.Optional ? "?" : "";
    const declared = prop.valueDeclaration;
    const written =
      declared && (ts.isPropertySignature(declared) || ts.isPropertyDeclaration(declared))
        ? declared.type?.getText().replace(/\s+/g, " ")
        : undefined;
    const value = written ?? checker.typeToString(checker.getTypeOfSymbol(prop), at, DEFINITION);
    return `${prop.name}${optional}: ${value.replace(/ \| undefined$/, "")}`;
  });
  return `{ ${fields.join("; ")} }`;
}

/** Every type `@hackcove/ui-react` exports, in name order: its JSDoc and its definition. */
export function generateTypes(): TypesJson {
  const source = program();
  const checker = source.getTypeChecker();
  const index = source.getSourceFile(INDEX);
  const module = index && checker.getSymbolAtLocation(index);
  if (module === undefined) throw new Error(`${INDEX}: not a module`);
  const types = checker.getExportsOfModule(module).flatMap((symbol): TypeDoc[] => {
    const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
    if (target.flags & ts.SymbolFlags.Value) return [];
    return [
      {
        name: symbol.name,
        description: ts.displayPartsToString(target.getDocumentationComment(checker)),
        definition: definitionOf(checker, target),
      },
    ];
  });
  return Object.fromEntries(
    types.toSorted((a, b) => a.name.localeCompare(b.name)).map((doc) => [doc.name, doc]),
  );
}

const json = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;

/** Writes `props.json` and `types.json` from the source as it is now: the `props` task, and `astro dev` on a change. */
export function writeProps(): void {
  mkdirSync(dirname(PROPS_JSON), { recursive: true });
  writeFileSync(PROPS_JSON, json(generateProps()));
  writeFileSync(TYPES_JSON, json(generateTypes()));
}
