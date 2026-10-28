import { useState, type ComponentPropsWithoutRef, type MouseEvent, type ReactElement } from "react";
import { focusRing } from "./cx.js";
import type { Unstyled } from "./props.js";

const BASE = `shrink-0 rounded px-1.5 py-0.5 font-sans text-xs text-slate-400 hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-50 ${focusRing}`;

/** Writes `text` to the clipboard and swaps the label to `copiedLabel`. Defaults to `type="button"`. A refused or missing clipboard leaves the label on `label`. Every other button prop, `disabled` included, goes on the `<button>`. */
export function CopyButton({
  text,
  label = "copy",
  copiedLabel = "copied",
  onClick,
  ...rest
}: {
  /** What goes on the clipboard. */
  text: string;
  /**
   * The button's text before a copy.
   * @default copy
   */
  label?: string;
  /**
   * The button's text once the copy has gone through.
   * @default copied
   */
  copiedLabel?: string;
} & Unstyled<Omit<ComponentPropsWithoutRef<"button">, "children">>): ReactElement {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      {...rest}
      className={BASE}
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
