import type { ReactElement, ReactNode } from "react";
import { Button, Disclosure as AriaDisclosure, DisclosurePanel } from "react-aria-components";
import { Chevron } from "./Chevron.js";
import { cx, focusRing } from "./cx.js";
import type { Passthrough } from "./props.js";

/** The panel form's box: the Card's border, fill and shadow, clipped to its radius. */
const FRAME = "overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-sm";

/** The body's own box, not the panel's: a collapsed panel still draws its border and padding. */
const PANEL = "border-t border-slate-200/70 p-4";

/**
 * A summary line with a chevron over a body that opens and closes under it. The summary is a
 * button with `aria-expanded`, and Enter and Space toggle it; the body is hidden while closed.
 * It starts closed; `defaultOpen` starts it open. It keeps its own state.
 *
 * `bordered` draws it as a panel: a bordered box with the summary as a roomy row across the top
 * (the hover fill of a `ListRow`) and the body padded under a hairline, for a section that opens in
 * place in a page of cards. Plain, it is a line of text with the body indented under it.
 */
export function Disclosure({
  summary,
  defaultOpen = false,
  bordered = false,
  children,
  ...rest
}: {
  /** The always-visible line: the button that toggles the body. */
  summary: ReactNode;
  /** Starts with the body showing. */
  defaultOpen?: boolean | undefined;
  /**
   * Draws it as a bordered panel: the summary a full-width row, the body padded under a hairline.
   * @default false
   */
  bordered?: boolean | undefined;
  /** The body, shown while open. */
  children: ReactNode;
} & Passthrough): ReactElement {
  return (
    <div {...rest} className={bordered ? FRAME : undefined}>
      <AriaDisclosure defaultExpanded={defaultOpen}>
        {({ isExpanded }) => (
          <>
            <Button
              slot="trigger"
              className={cx(
                "flex w-full cursor-pointer items-center gap-2 text-left text-sm font-medium text-slate-900",
                focusRing,
                bordered
                  ? "px-4 py-3 hover:bg-slate-50 focus-visible:-outline-offset-2"
                  : "rounded-md py-1.5 hover:text-violet-700",
              )}
            >
              <Chevron open={isExpanded} />
              {summary}
            </Button>
            <DisclosurePanel
              className={cx("text-sm text-slate-700", !bordered && "pt-1 pb-2 pl-6")}
            >
              {bordered ? <div className={PANEL}>{children}</div> : children}
            </DisclosurePanel>
          </>
        )}
      </AriaDisclosure>
    </div>
  );
}
