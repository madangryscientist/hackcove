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
export const PROPS_JSON = join(UI, "docs", "props.json");
/** Where the type exports go, beside the props. */
export const TYPES_JSON = join(UI, "docs", "types.json");
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

function propDoc(
  component: string,
  prop: PropItem,
  arms: Map<string, string>,
  publicType: PublicType,
): PropDoc {
  const fallback = prop.defaultValue?.value;
  const native = fromDom(prop) ? nativeOf(component, prop.name) : undefined;
  const fromArms = arms.get(prop.name);
  return {
    name: prop.name,
    type: publicType(typeOf(prop), component),
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

/** Rewrites a printed type so it names only what `index.ts` exports; `owner` names the export it prints for. */
type PublicType = (text: string, owner: string) => string;

/** Every name `index.ts` exports, type or value. */
function exportNames(checker: ts.TypeChecker, index: ts.SourceFile): Set<string> {
  const module = checker.getSymbolAtLocation(index);
  if (module === undefined) throw new Error(`${INDEX}: not a module`);
  return new Set(checker.getExportsOfModule(module).map((symbol) => symbol.name));
}

/**
 * Every type alias and interface declared in `packages/ui-react/src` (tests left out) that `index.ts`
 * does not export, by name. No docs page defines one, so a printed type must not name it.
 */
function internalTypes(source: ts.Program, checker: ts.TypeChecker): Map<string, ts.Symbol> {
  const index = source.getSourceFile(INDEX);
  if (index === undefined) throw new Error(`${INDEX}: not in the program`);
  const exported = exportNames(checker, index);
  const src = join(UI, "src");
  const internal = new Map<string, ts.Symbol>();
  for (const file of source.getSourceFiles()) {
    if (dirname(file.fileName) !== src || /\.test\.tsx?$/.test(file.fileName)) continue;
    for (const statement of file.statements) {
      if (!ts.isTypeAliasDeclaration(statement) && !ts.isInterfaceDeclaration(statement)) continue;
      const name = statement.name.text;
      const symbol = checker.getSymbolAtLocation(statement.name);
      if (!exported.has(name) && symbol !== undefined) internal.set(name, symbol);
    }
  }
  return internal;
}

/** The names of the types `packages/ui-react/src` declares and `index.ts` does not export. */
export function internalTypeNames(): string[] {
  const source = program();
  return [...internalTypes(source, source.getTypeChecker()).keys()].toSorted();
}

/**
 * The public name of a list of switcher options, by the export that prints it: `Tabs` takes `Tab`s,
 * `SegmentedControl` takes `Segment`s, and a `DocsNavGroup` lists link `Tab`s.
 */
const ITEM: Record<string, string> = {
  Tabs: "Tab",
  SegmentedControl: "Segment",
  DocsNavGroup: "Tab",
};

/** How many times an internal name may expand into another before the generator gives up. */
const DEPTH = 3;

/** An internal name as a whole word, with the `[]` after it when it is a list. */
function word(name: string): RegExp {
  return new RegExp(`\\b${name}\\b(\\[\\])?`, "g");
}

/**
 * Names a switcher option list by its export (`Tab[]`), then writes every other internal type out as
 * its definition, up to `DEPTH` levels; a name still left after that throws, so nothing leaks.
 */
function publicTyper(source: ts.Program, checker: ts.TypeChecker): PublicType {
  const internal = internalTypes(source, checker);
  return (text, owner) => {
    const item = ITEM[owner];
    let out =
      item === undefined
        ? text
        : text
            .replaceAll("SwitchButton[] | SwitchLink[]", `${item}[]`)
            .replace(/\bSwitchLink\[\]/g, `${item}[]`);
    for (let level = 0; level <= DEPTH; level += 1) {
      const left = [...internal.keys()].filter((name) => word(name).test(out));
      if (left.length === 0) return out;
      if (level === DEPTH) throw new Error(`${owner}: prints internal type ${left.join(", ")}`);
      for (const name of left) {
        const symbol = internal.get(name);
        if (symbol === undefined) continue;
        const definition = definitionOf(checker, symbol);
        out = out.replace(word(name), (_, list: string | undefined) =>
          list !== undefined && definition.includes(" | ")
            ? `(${definition})[]`
            : `${definition}${list ?? ""}`,
        );
      }
    }
    return out;
  };
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
function helperDoc(
  checker: ts.TypeChecker,
  name: string,
  symbol: ts.Symbol,
  publicType: PublicType,
): ComponentDoc {
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
  if (declaration === undefined) throw new Error(`${name}: no declaration`);
  const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
  const flags: ts.TypeFormatFlags =
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
    signature: publicType(signature, name),
    props: [],
  };
}

/** Every export of `@slashsuite/ui-react`, in name order: a component's props, a helper's signature. */
export function generateProps(): PropsJson {
  const source = program();
  const checker = source.getTypeChecker();
  const index = source.getSourceFile(INDEX);
  if (index === undefined) throw new Error(`${INDEX}: not in the program`);
  const exported = exportsOf(checker, index);
  const publicType = publicTyper(source, checker);
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
    if (/^[a-z]/.test(name)) return helperDoc(checker, name, symbol, publicType);
    const doc = components.get(name);
    if (doc === undefined)
      throw new Error(`${name}: exported, but react-docgen-typescript did not read it`);
    return {
      name,
      description: doc.description,
      props: Object.values(doc.props)
        .map((prop) => propDoc(name, prop, armDocsOf(name, checker, symbol), publicType))
        .toSorted((a, b) => a.name.localeCompare(b.name)),
    };
  });
  return Object.fromEntries(
    docs.toSorted((a, b) => a.name.localeCompare(b.name)).map((doc) => [doc.name, doc]),
  );
}

/** A field written as only `undefined`, read from its declaration (see `definitionOf`). */
function onlyUndefined(prop: ts.Symbol): boolean {
  const declared = prop.valueDeclaration;
  return (
    declared !== undefined &&
    ts.isPropertySignature(declared) &&
    declared.type?.kind === ts.SyntaxKind.UndefinedKeyword
  );
}

const DEFINITION: ts.TypeFormatFlags =
  ts.TypeFormatFlags.NoTruncation |
  ts.TypeFormatFlags.InTypeAlias |
  ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope;

/**
 * A type's definition one level down: an object's (or an intersection's) fields with their types,
 * else the type itself. A field whose type is only `undefined` (`href?: undefined`, which keeps one
 * arm of a union from taking the other's key) is left out.
 */
function definitionOf(checker: ts.TypeChecker, symbol: ts.Symbol): string {
  const type = checker.getDeclaredTypeOfSymbol(symbol);
  const at = symbol.declarations?.[0];
  const isObject =
    type.flags & (ts.TypeFlags.Object | ts.TypeFlags.Intersection) &&
    !type.getCallSignatures().length;
  if (!isObject || type.isUnion()) return checker.typeToString(type, at, DEFINITION);
  // Read from the written field, not the checker: resolving every field's type here would create
  // literal types early and reorder the unions printed after it.
  const fields = checker
    .getPropertiesOfType(type)
    .filter((prop) => !onlyUndefined(prop))
    .map((prop) => {
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

/** Every type `@slashsuite/ui-react` exports, in name order: its JSDoc and its definition. */
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
  // After every definition is printed: expanding an internal type first would create its literal
  // types early and reorder the unions printed after it.
  const publicType = publicTyper(source, checker);
  return Object.fromEntries(
    types
      .map((doc) => ({ ...doc, definition: publicType(doc.definition, doc.name) }))
      .toSorted((a, b) => a.name.localeCompare(b.name))
      .map((doc) => [doc.name, doc]),
  );
}

const json = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;

/** Writes `props.json` and `types.json` from the source as it is now: the `props` task, and `astro dev` on a change. */
export function writeProps(): void {
  mkdirSync(dirname(PROPS_JSON), { recursive: true });
  writeFileSync(PROPS_JSON, json(generateProps()));
  writeFileSync(TYPES_JSON, json(generateTypes()));
}
