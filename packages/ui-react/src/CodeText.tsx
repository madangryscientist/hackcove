import type { ReactElement, ReactNode } from "react";
import { highlight, type CodeLanguage, type TokenKind } from "./highlight.js";

/**
 * Each kind borrows a colour family already in `palette.json`, so a theme recolours code like
 * anything else: keywords and element names read as the accent (violet), strings as positive
 * (emerald), numbers as warn (amber), attribute names as sky, calls as info (blue), comments muted.
 */
const TOKEN_CLASS: Record<TokenKind, string> = {
  plain: "",
  comment: "text-slate-500 italic",
  keyword: "text-violet-700",
  tag: "text-red-700",
  attr: "text-sky-700",
  string: "text-emerald-700",
  number: "text-amber-700",
  function: "text-blue-700",
};

/** One coloured run: bare text for plain, a span with the kind's palette utility otherwise. */
const colour = (kind: TokenKind, key: number, text: string): ReactNode =>
  kind === "plain" ? (
    text
  ) : (
    <span key={key} className={TOKEN_CLASS[kind]}>
      {text}
    </span>
  );

/**
 * The tokens regrouped into whitespace-separated words, each word one atomic inline box, with the
 * whitespace between them left as text. A browser may break a line after a hyphen (`--skip` splits
 * into `-` and `-skip`), but never inside an inline box, so a flag or a word stays whole. The box
 * is capped at the line's width, so a word wider than the line still breaks inside itself instead
 * of clipping. The characters are untouched: no joiner or non-breaking hyphen is swapped in, so
 * selecting and copying gives the source.
 */
function wholeWords(code: string, language: CodeLanguage): ReactNode[] {
  const out: ReactNode[] = [];
  let word: ReactNode[] = [];
  const flush = (): void => {
    if (word.length > 0) {
      out.push(
        <span key={`w${out.length}`} className="inline-block max-w-full align-top">
          {word}
        </span>,
      );
      word = [];
    }
  };
  for (const token of highlight(code, language)) {
    for (const piece of token.text.split(/(\s+)/)) {
      if (piece === "") continue;
      if (/^\s/.test(piece)) {
        flush();
        out.push(colour(token.kind, out.length, piece));
      } else {
        word.push(colour(token.kind, word.length, piece));
      }
    }
  }
  flush();
  return out;
}

/**
 * The `<code>` for a `<pre>`: the source in mono, one span per coloured run. With `breakAtSpaces` a
 * long line may break only at whitespace (see `wholeWords` above).
 */
export function CodeText({
  code,
  language,
  breakAtSpaces = false,
}: {
  code: string;
  language: CodeLanguage;
  breakAtSpaces?: boolean;
}): ReactElement {
  return (
    <code>
      {breakAtSpaces
        ? wholeWords(code, language)
        : highlight(code, language).map((token, index) => colour(token.kind, index, token.text))}
    </code>
  );
}
