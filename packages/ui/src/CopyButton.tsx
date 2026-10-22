import { useState, type ComponentPropsWithoutRef, type MouseEvent, type ReactElement } from "react";
import { cx, focusRing } from "./cx.js";

const BASE = `shrink-0 rounded px-1.5 py-0.5 font-sans text-xs text-slate-400 hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-50 ${focusRing}`;

/** Writes `text` to the clipboard and swaps the label to `copiedLabel`. Defaults to `type="button"`. A refused or missing clipboard leaves the label on `label`. Every other button prop, `disabled` included, goes on the `<button>`. */
export function CopyButton({
  text,
  label = "copy",
  copiedLabel = "copied",
  onClick,
  className,
  ...rest
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
} & Omit<ComponentPropsWithoutRef<"button">, "children">): ReactElement {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      {...rest}
      className={cx(BASE, className)}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        // The rejection is swallowed on purpose: a denied write is not an error the page can act on.
        navigator.clipboard?.writeText(text).then(
          () => setCopied(true),
          () => {},
        );
      }}
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
