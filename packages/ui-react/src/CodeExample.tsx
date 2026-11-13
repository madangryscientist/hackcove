import type { ReactElement, ReactNode } from "react";
import { CodeBody } from "./CodeBody.js";
import { themedScrollbar } from "./cx.js";
import type { Passthrough } from "./props.js";
import { AppScale } from "./typography.js";

/**
 * One framed example: the rendered `children` on top and the `code` that makes them attached
 * underneath, in a single bordered box with one divider between. With `copy`, a copy
 * button beside the code copies it exactly as given (client JS; off by default). An optional `caption` is the frame's last band. The code is React, so
 * it is coloured as TSX. The preview is its own height, never padded to match a neighbour, down to
 * a shared minimum so two frames side by side start alike. A wide preview or a long line of code
 * scrolls inside the frame, under a thin themed scrollbar, instead of widening the page or
 * wrapping. Inside a `Prose` the preview stays on the app scale, so a demo looks as the component
 * does anywhere else; the caption is outside it.
 */
export function CodeExample({
  code,
  caption,
  copy = false,
  children,
  ...rest
}: {
  /** The source shown under the preview, newlines kept. */
  code: string;
  /** One note on the example, under the code. */
  caption?: ReactNode;
  /**
   * A copy button beside the code. On a page rendered to static HTML without hydration, inline
   * `copyScript` and it works there too.
   * @default false
   */
  copy?: boolean;
  children: ReactNode;
} & Passthrough): ReactElement {
  return (
    <figure {...rest} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className={`min-h-24 overflow-x-auto p-5 ${themedScrollbar}`}>
        <div className="text-slate-900">
          <AppScale>{children}</AppScale>
        </div>
      </div>
      <div className="border-t border-slate-200 bg-slate-50">
        <CodeBody code={code} language="tsx" wrap={false} copy={copy} />
      </div>
      {caption && (
        <figcaption className="border-t border-slate-200 px-3 py-2.5 text-sm/5 text-slate-500">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
