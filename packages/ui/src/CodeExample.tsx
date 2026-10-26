import type { ReactElement, ReactNode } from "react";
import type { Passthrough } from "./props.js";

/**
 * One framed example: the rendered `children` on top and the `code` that makes them attached
 * underneath, in a single bordered box with one divider between. No client JS and no highlighting.
 * An optional `caption` is the frame's last band. The preview is its own height, never padded to match
 * a neighbour, down to a shared minimum so two frames side by side start alike. A wide preview or a
 * long line of code scrolls inside the frame instead of widening the page or wrapping.
 */
export function CodeExample({
  code,
  caption,
  children,
  ...rest
}: {
  /** The source shown under the preview, newlines kept. */
  code: string;
  /** One note on the example, under the code. */
  caption?: ReactNode;
  children: ReactNode;
} & Passthrough): ReactElement {
  return (
    <figure {...rest} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="min-h-24 overflow-x-auto p-5">{children}</div>
      <pre className="overflow-x-auto border-t border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-[12.5px] whitespace-pre text-slate-900">
        <code>{code}</code>
      </pre>
      {caption && (
        <figcaption className="border-t border-slate-200 px-3 py-2.5 text-sm/5 text-slate-500">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
