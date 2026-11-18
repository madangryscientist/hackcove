/**
 * `value`, or a throw naming `what` when it is missing. Called where a test file declares its cases,
 * outside any test body, so a case the content no longer has fails the file's collection, loudly.
 */
export function must<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`expected ${what}`);
  return value;
}
