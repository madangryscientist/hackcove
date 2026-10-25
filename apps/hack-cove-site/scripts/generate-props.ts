/**
 * Reads the props of every component in `packages/ui` (types and JSDoc) with react-docgen-typescript.
 * `className` and `style` are left out: the library has no styling escape hatch to document, and
 * props that only come from the DOM's own types (`onClick`, `aria-*`) are described once, in prose.
 */
import { globSync } from "node:fs";
import { join } from "node:path";
import { withCustomConfig, type PropItem } from "react-docgen-typescript";
import type { PropDoc, PropsJson } from "../src/docs/types.js";

const UI = join(import.meta.dirname, "..", "..", "..", "packages", "ui");
/** Where `scripts/props.ts` writes the result and the docs read it. */
export const PROPS_JSON = join(import.meta.dirname, "..", "src", "generated", "props.json");
const LEFT_OUT = new Set(["className", "style"]);

const fromDom = (prop: PropItem): boolean =>
  (prop.declarations ?? []).length > 0 &&
  (prop.declarations ?? []).every((d) => d.fileName.includes("node_modules"));

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

/** Every exported component with at least one own prop, in name order. */
export function generateProps(): PropsJson {
  const parser = withCustomConfig(join(UI, "tsconfig.json"), {
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    savePropValueAsString: true,
    propFilter: (prop) => !LEFT_OUT.has(prop.name) && !fromDom(prop),
  });
  const files = globSync("src/*.tsx", { cwd: UI })
    .filter((f) => !/\.(test|harness)\.tsx$/.test(f))
    .toSorted()
    .map((f) => join(UI, f));
  const docs = parser.parse(files).toSorted((a, b) => a.displayName.localeCompare(b.displayName));
  return Object.fromEntries(
    docs.map((doc) => [
      doc.displayName,
      {
        name: doc.displayName,
        description: doc.description,
        props: Object.values(doc.props)
          .map(propDoc)
          .toSorted((a, b) => a.name.localeCompare(b.name)),
      },
    ]),
  );
}
