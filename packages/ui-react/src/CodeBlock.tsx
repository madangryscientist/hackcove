import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { CodeBody } from "./CodeBody.js";
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
 * A block of code: mono, in a bordered inset box. No client JS unless `copy` adds a copy button
 * beside the code, which copies it exactly as given and needs the page hydrated. `language` colours
 * it: `tsx`, `ts`, `js`, `json`, `bash`, `console`, `css`, `html` or `yaml`. `console` is a shell
 * session: a line starting with `$ ` is a command (coloured as bash, its `$ ` dimmed and not
 * selectable) and any other line is output; with `copy` only the commands are copied, without the
 * `$ `. `label` names the language or file (`bash`, `css`) in a caption above the code. `text` (the
 * default) leaves the code in one colour, for a block that is not a language. Give the text as `children` or as `lines`. Long lines wrap, so
 * nothing is cut off and a command stays one copyable line; `overflow="scroll"` keeps lines whole
 * and scrolls them sideways under a thin themed scrollbar, for code whose layout matters. Every
 * other figure prop goes on the root `<figure>`. For one short line to copy, `CopyLine` is the
 * smaller box.
 */
export function CodeBlock({
  label,
  language = "text",
  overflow = "wrap",
  copy = false,
  children,
  lines,
  ...rest
}: {
  /** A caption above the code naming its language or file (`bash`, `theme.css`). */
  label?: string;
  /** What the code is written in; `text` (the default) colours nothing. */
  language?: CodeLanguage;
  /**
   * What a line longer than the box does: `wrap` onto the next line (the default, nothing is cut
   * off), or `scroll` sideways inside the box.
   * @default wrap
   */
  overflow?: "wrap" | "scroll";
  /**
   * A copy button beside the code, which copies it exactly as given (a `console` block copies only
   * its commands). It is a client component: leave it off on a page that is rendered to static HTML without hydration.
   * @default false
   */
  copy?: boolean;
} & CodeBlockSource &
  Unstyled<Omit<ComponentPropsWithoutRef<"figure">, "children">>): ReactElement {
  return (
    <figure
      {...rest}
      className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 font-mono text-[12.5px] leading-normal text-slate-900"
    >
      {label && (
        <figcaption className="border-b border-slate-200 px-3 py-1.5 text-xs text-slate-500">
          {label}
        </figcaption>
      )}
      <CodeBody
        code={lines ? lines.join("\n") : children}
        language={language}
        wrap={overflow === "wrap"}
        copy={copy}
      />
    </figure>
  );
}
