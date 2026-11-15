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
