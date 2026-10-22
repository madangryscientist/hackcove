import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { CopyButton } from "./CopyButton.js";
import { cx } from "./cx.js";

const BOX =
  "flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-2.5 py-2 font-mono text-[12.5px] text-slate-900";

/** One line of mono text in a box, with a `CopyButton`: a command or a token to paste elsewhere. `className` and every other div prop go on the root `<div>`, so `data-testid` lands there; the `<code>` holds only `text`. */
export function CopyLine({
  text,
  className,
  ...rest
}: {
  text: string;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"div">, "children">): ReactElement {
  return (
    <div {...rest} className={cx(BOX, className)}>
      <code className="min-w-0 break-words">{text}</code>
      <CopyButton text={text} />
    </div>
  );
}
