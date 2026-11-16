/**
 * A prop's JSDoc, read per arm of a union props type. react-docgen-typescript joins the arms' texts
 * into one, so a prop documented on two arms printed twice; these read each arm with the checker.
 */
import ts from "typescript";

/** One arm's JSDoc for a prop, and whether that arm refuses it (`?: undefined`). */
export type ArmDoc = { text: string; absent: boolean };

/**
 * The one description of a prop from its arms' texts: the same text on every arm that takes the
 * prop prints once, and the note of an arm that refuses it (`?: undefined`) comes last, unless it
 * repeats that text. Two arms
 * that take the prop and say different things throw: write one text that covers both.
 */
export function mergeArmDocs(arms: ArmDoc[]): string {
  const said = (absent: boolean) => [
    ...new Set(arms.filter((arm) => arm.absent === absent && arm.text !== "").map((a) => a.text)),
  ];
  const present = said(false);
  if (present.length > 1) throw new Error("union arms disagree");
  const notes = said(true).filter((note) => !present.includes(note));
  return [...present, ...notes].join(" ");
}

const isUndefined = (checker: ts.TypeChecker, symbol: ts.Symbol, at: ts.Node): boolean =>
  (checker.getTypeOfSymbolAtLocation(symbol, at).flags & ts.TypeFlags.Undefined) !== 0 &&
  !checker.getTypeOfSymbolAtLocation(symbol, at).isUnion();

/**
 * Each prop's description, from the arms of a component's props type, when that type is a union;
 * an empty map when it is not, so react-docgen's text stands.
 */
export function armDocsOf(
  component: string,
  checker: ts.TypeChecker,
  symbol: ts.Symbol,
): Map<string, string> {
  const at = symbol.valueDeclaration ?? symbol.declarations?.[0];
  if (at === undefined) return new Map();
  const [call] = checker.getTypeOfSymbolAtLocation(symbol, at).getCallSignatures();
  const [param] = call?.getParameters() ?? [];
  if (param === undefined) return new Map();
  const props = checker.getTypeOfSymbolAtLocation(param, at);
  if (!props.isUnion()) return new Map();
  const names = new Set(props.types.flatMap((arm) => arm.getProperties().map((p) => p.name)));
  const docs = [...names].map((name): [string, string] => {
    const arms = props.types.flatMap((arm): ArmDoc[] => {
      const prop = checker.getPropertyOfType(arm, name);
      if (prop === undefined) return [];
      return [
        {
          text: ts.displayPartsToString(prop.getDocumentationComment(checker)).trim(),
          absent: isUndefined(checker, prop, at),
        },
      ];
    });
    try {
      return [name, mergeArmDocs(arms)];
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`${component}.${name}: ${reason}`, { cause: error });
    }
  });
  return new Map(docs);
}
