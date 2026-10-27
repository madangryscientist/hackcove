import type { ReactElement, ReactNode } from "react";
import { Button, Disclosure as AriaDisclosure, DisclosurePanel } from "react-aria-components";
import { Chevron } from "./Chevron.js";
import { focusRing } from "./cx.js";
import type { Passthrough } from "./props.js";

/**
 * A summary line with a chevron over a body that opens and closes under it. The summary is a
 * button with `aria-expanded`, and Enter and Space toggle it; the body is hidden while closed.
 * It starts closed; `defaultOpen` starts it open. It keeps its own state.
 */
export function Disclosure({
  summary,
  defaultOpen = false,
  children,
  ...rest
}: {
  /** The always-visible line: the button that toggles the body. */
  summary: ReactNode;
  /** Starts with the body showing. */
  defaultOpen?: boolean | undefined;
  /** The body, shown while open. */
  children: ReactNode;
} & Passthrough): ReactElement {
  return (
    <div {...rest}>
      <AriaDisclosure defaultExpanded={defaultOpen}>
        {({ isExpanded }) => (
          <>
            <Button
              slot="trigger"
              className={`flex w-full cursor-pointer items-center gap-2 rounded-md py-1.5 text-left text-sm font-medium text-slate-900 hover:text-violet-700 ${focusRing}`}
            >
              <Chevron open={isExpanded} />
              {summary}
            </Button>
            <DisclosurePanel className="pt-1 pb-2 pl-6 text-sm text-slate-700">
              {children}
            </DisclosurePanel>
          </>
        )}
      </AriaDisclosure>
    </div>
  );
}
