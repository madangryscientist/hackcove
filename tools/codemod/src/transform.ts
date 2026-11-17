import ts from "typescript";
import { applyEdits, moved } from "./edits.js";
import { tagRules as actions } from "./rules/actions.js";
import { tagRules as containers } from "./rules/containers.js";
import { tagRules as controls } from "./rules/controls.js";
import { fieldPair, tagRules as forms } from "./rules/forms.js";
import { imports, pruneImports } from "./rules/imports.js";
import { tagRules as layouts } from "./rules/layouts.js";
import { tagRules as links } from "./rules/links.js";
import { tagRules as props } from "./rules/props.js";
import { tagRules as tables } from "./rules/tables.js";
import { tagRules as text, vizTones } from "./rules/text.js";
import { typedTones } from "./rules/typedTones.js";
import { tagRules as unpin } from "./rules/unpin.js";
import {
  componentOf,
  type Context,
  packageImports,
  parse,
  type Report,
  type TagRule,
} from "./source.js";

/** Every rule that reads one tag, in no order that matters: each edits its own attributes. */
const TAG_RULES: readonly TagRule[] = [
  ...props,
  ...text,
  ...links,
  ...actions,
  ...layouts,
  ...controls,
  ...forms,
  ...containers,
  ...tables,
];

/**
 * The second step, run alone by `--unpin`: it takes out the 0.11 pins where the new default means
 * the same. It never runs with the 0.11 pass, which would write every pin straight back.
 */
const UNPIN_RULES: readonly TagRule[] = [...unpin, fieldPair];

/** Which pass to run: the 0.10 to 0.11 rewrite (the default), or the step that drops its pins. */
export type Options = { step?: "0.11" | "unpin" };

/** The file rewritten, and a line of the rewritten file for each thing a person has to decide. */
export function transform(
  source: string,
  fileName: string,
  options: Options = {},
): { output: string; reports: Report[] } {
  const file = parse(source, fileName);
  const context: Context = { file, imports: packageImports(file), edits: [], reports: [] };
  if (context.imports.declarations.length === 0) return { output: source, reports: [] };
  const unpinning = options.step === "unpin";
  if (!unpinning) {
    imports(context);
    vizTones(context);
    typedTones(context);
  }
  const rules = unpinning ? UNPIN_RULES : TAG_RULES;
  const visit = (node: ts.Node): void => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const component = componentOf(node, context.imports);
      if (component !== undefined) for (const rule of rules) rule(node, component, context);
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  const rewritten = applyEdits(source, context.edits);
  const pruned = rewritten === source ? [] : pruneImports(file, rewritten, fileName);
  const output = applyEdits(rewritten, pruned);
  const lines = parse(output, fileName);
  const reports = context.reports
    .map(({ at, message }) => {
      const offset = moved(pruned, moved(context.edits, at));
      return { line: lines.getLineAndCharacterOfPosition(offset).line + 1, message };
    })
    .toSorted((a, b) => a.line - b.line);
  return { output, reports };
}
