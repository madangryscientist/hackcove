import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { cx } from "./cx.js";

/** Exactly one of `children` (a string, newlines kept) or `lines` (one array entry per line). */
type CodeBlockSource = { children: string; lines?: never } | { lines: string[]; children?: never };

/**
 * A static multi-line block of code: mono, in a bordered inset box, long lines wrap. No client JS and
 * no syntax highlighting; for install snippets and docs. Give the text as `children` or as `lines`.
 * `label` names the language or file (`bash`, `css`) in a caption above the code. `className` and
 * every other figure prop go on the root `<figure>`. For one line a reader copies, use `CopyLine`.
 */
export function CodeBlock({
  label,
  className,
  children,
  lines,
  ...rest
}: {
  label?: string;
  className?: string;
} & CodeBlockSource &
  Omit<ComponentPropsWithoutRef<"figure">, "children" | "className">): ReactElement {
  return (
    <figure
      {...rest}
      className={cx(
        "overflow-hidden rounded-lg border border-slate-200 bg-slate-50 font-mono text-[12.5px] text-slate-900",
        className,
      )}
    >
      {label && (
        <figcaption className="border-b border-slate-200 px-3 py-1.5 text-xs text-slate-500">
          {label}
        </figcaption>
      )}
      <pre className="whitespace-pre-wrap break-words px-3 py-2.5">
        <code>{lines ? lines.join("\n") : children}</code>
      </pre>
    </figure>
  );
}
