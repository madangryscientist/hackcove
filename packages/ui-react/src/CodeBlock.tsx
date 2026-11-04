import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { CodeText } from "./CodeText.js";
import type { CodeLanguage } from "./highlight.js";
import type { Unstyled } from "./props.js";

/** Exactly one of `children` (a string, newlines kept) or `lines` (one array entry per line). */
type CodeBlockSource =
  | {
      children: string;
      /** The code as one array entry per line, in place of `children`. */
      lines?: never;
    }
  | {
      /** The code as one array entry per line, in place of `children`. */
      lines: string[];
      children?: never;
    };

/**
 * A static multi-line block of code: mono, in a bordered inset box, long lines wrap. No client JS;
 * `language` colours it, and `label` names the language or file (`bash`, `css`) in a caption above
 * the code. `text` (the default) leaves the code in one colour, for a block that is not a language.
 * Give the text as `children` or as `lines`. Every other figure prop goes on the root `<figure>`.
 * For one line a reader copies, use `CopyLine`.
 */
export function CodeBlock({
  label,
  language = "text",
  children,
  lines,
  ...rest
}: {
  /** A caption above the code naming its language or file (`bash`, `theme.css`). */
  label?: string;
  /** What the code is written in; `text` (the default) colours nothing. */
  language?: CodeLanguage;
} & CodeBlockSource &
  Unstyled<Omit<ComponentPropsWithoutRef<"figure">, "children">>): ReactElement {
  return (
    <figure
      {...rest}
      className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 font-mono text-[12.5px] text-slate-900"
    >
      {label && (
        <figcaption className="border-b border-slate-200 px-3 py-1.5 text-xs text-slate-500">
          {label}
        </figcaption>
      )}
      <pre className="whitespace-pre-wrap break-words px-3 py-2.5">
        <CodeText code={lines ? lines.join("\n") : children} language={language} />
      </pre>
    </figure>
  );
}
