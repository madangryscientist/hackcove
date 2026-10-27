import type { ReactElement } from "react";
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

/** The `<code>` for a `<pre>`: the source in mono, one span per coloured run. */
export function CodeText({
  code,
  language,
}: {
  code: string;
  language: CodeLanguage;
}): ReactElement {
  return (
    <code>
      {highlight(code, language).map((token, index) =>
        token.kind === "plain" ? (
          token.text
        ) : (
          <span key={index} className={TOKEN_CLASS[token.kind]}>
            {token.text}
          </span>
        ),
      )}
    </code>
  );
}
