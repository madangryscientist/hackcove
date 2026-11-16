import ts from "typescript";
import { type Context, report } from "../source.js";
import { replace } from "../attributes.js";

/** The tone types whose values changed: old value to new, for a literal the app typed with one. */
const TYPED: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  PillTone: {
    slate: "neutral",
    amber: "warn",
    emerald: "positive",
    blue: "info",
    red: "danger",
    violet: "accent",
    sky: "info",
  },
  BarTone: { negative: "danger" },
  ButtonTone: { default: "neutral" },
  IconButtonTone: { default: "neutral" },
  CellTone: { default: "neutral" },
};

/** The tone type a variable is declared with, as `T`, `T[]` or `readonly T[]`. */
function declaredTone(type: ts.TypeNode | undefined, context: Context): string | undefined {
  if (type === undefined) return undefined;
  if (ts.isArrayTypeNode(type)) return declaredTone(type.elementType, context);
  if (ts.isTypeOperatorNode(type)) return declaredTone(type.type, context);
  if (!ts.isTypeReferenceNode(type) || !ts.isIdentifier(type.typeName)) return undefined;
  const name = context.imports.named.get(type.typeName.text);
  return name !== undefined && name in TYPED ? name : undefined;
}

/** The string literals a declaration's value holds: itself, or the elements of an array. */
function literalsOf(value: ts.Expression | undefined): ts.StringLiteral[] {
  if (value === undefined) return [];
  if (ts.isStringLiteral(value)) return [value];
  if (ts.isArrayLiteralExpression(value)) return value.elements.filter(ts.isStringLiteral);
  return [];
}

/** `const tones: PillTone[] = ["amber"]` is `["warn"]`; two old values that meet are reported. */
export function typedTones(context: Context): void {
  const visit = (node: ts.Node): void => {
    if (ts.isVariableDeclaration(node)) {
      const type = declaredTone(node.type, context);
      const map = type === undefined ? undefined : TYPED[type];
      if (map !== undefined) retone(literalsOf(node.initializer), map, context);
    }
    ts.forEachChild(node, visit);
  };
  visit(context.file);
}

function retone(
  literals: readonly ts.StringLiteral[],
  map: Readonly<Record<string, string>>,
  context: Context,
): void {
  const seen = new Set<string>();
  for (const literal of literals) {
    const to = map[literal.text] ?? literal.text;
    if (seen.has(to))
      report(context, literal, `"${literal.text}" is "${to}" now, which this list already holds`);
    seen.add(to);
    if (to !== literal.text) replace(context, literal, `"${to}"`);
  }
}
