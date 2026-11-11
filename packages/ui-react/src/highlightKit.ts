/** The pieces the scanners in `highlight*.ts` share. */

export type TokenKind =
  | "plain"
  | "comment"
  | "keyword"
  | "string"
  | "number"
  | "tag"
  | "attr"
  | "function"
  | "prompt";

export type Token = { text: string; kind: TokenKind };

export type Emit = (kind: TokenKind, text: string) => void;

/** A scanner for a whole run of code, given to a scanner of a language that holds another. */
export type Scanner = (code: string, emit: Emit) => void;

/** The text a sticky `pattern` matches at `at`, or `undefined`. */
export function sticky(pattern: RegExp, code: string, at: number): string | undefined {
  pattern.lastIndex = at;
  return pattern.exec(code)?.[0];
}

/** Each line of `code` without its line break, and the break (`\n`, `\r\n` or nothing at the end). */
export function splitLines(code: string): { body: string; eol: string }[] {
  const out: { body: string; eol: string }[] = [];
  let at = 0;
  for (;;) {
    const newline = code.indexOf("\n", at);
    const end = newline === -1 ? code.length : newline;
    const bodyEnd = end > at && code.charAt(end - 1) === "\r" ? end - 1 : end;
    out.push({
      body: code.slice(at, bodyEnd),
      eol: code.slice(bodyEnd, newline === -1 ? end : end + 1),
    });
    if (newline === -1) return out;
    at = newline + 1;
  }
}
