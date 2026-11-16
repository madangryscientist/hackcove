/** The words a don't bullet opens with. */
const dontOpening = /^(?:Never|Do not|Don't|Avoid)\b/;

/** True when the rule opens with a don't word. */
export function opensDont(rule: string): boolean {
  return dontOpening.test(rule);
}

/**
 * True when the rule, or any sentence in it after `. `, `; ` or `: `, opens with Never, Do not,
 * Don't or Avoid: a rule that belongs, whole or in part, in `usage.dont`.
 */
export function dontWorded(rule: string): boolean {
  return rule.split(/[.;:] /).some(opensDont);
}

/** A value as written in a rule: a lower-case token (`sm`, `2xl`, `16:9`), a number or a mark (`·`). */
const literal = /^(?:[a-z0-9][\w:.-]*|[^\w\s<>]{1,2})$/;

/**
 * The values a rule lists for `prop`, when its first sentence opens "`<prop>` is ": the backticked
 * values in that sentence, up to a `; ` that opens another prop's values ("`<other>` is `"), leaving out
 * anything backticked that is not a value (a component name). Any other rule lists none.
 */
export function listedValues(rule: string, prop: string): string[] | undefined {
  const opening = `\`${prop}\` is `;
  const [sentence = ""] = rule.split(/(?<=\.) /);
  const [first = ""] = sentence.split(/; (?=`[^`]+` is `)/);
  if (!first.startsWith(opening)) return undefined;
  return [...first.slice(opening.length).matchAll(/`([^`]+)`/g)]
    .map(([, value = ""]) => value)
    .filter((value) => literal.test(value));
}
