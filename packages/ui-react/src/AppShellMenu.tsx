import { type ReactElement, type ReactNode, useRef } from "react";
import { ContainerFrame } from "./Container.js";
import { cx, focusRing } from "./cx.js";

const ICON = {
  viewBox: "0 0 20 20",
  width: 16,
  height: 16,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  className: "shrink-0 text-slate-500",
} as const;

/**
 * The header's phone menu (below `md`): a native `<details>` whose `<summary>` is the button, so it
 * opens and closes by pointer, Enter and Space, and is announced as a disclosure with its expanded
 * state, all with no script. That is why it also works on a page that is never hydrated. The panel
 * is out of flow (it hangs under the header, `top-full`), so the header keeps its one height open
 * or closed. With script it also closes on Escape (focus returns to the button) and when a link in
 * it is followed, for a router that changes the page without a reload.
 *
 * `controls` (AppShell's `menuControls`) sit at the top of the panel, above the links. From `md`
 * the `<details>` drops its own box and shows only them, inline at the row's end, whether it is
 * open or not: the summary and the link copies are hidden (the links render in their own rows from
 * `md`) and the panel is a plain row. They are rendered once, so a field keeps its state.
 */
export function AppShellMenu({
  label,
  controls,
  children,
}: {
  label: string;
  /** Rendered once: at the top of the panel below `md`, inline in the row from `md`. */
  controls?: ReactNode;
  children: ReactNode;
}): ReactElement {
  const details = useRef<HTMLDetailsElement>(null);
  const close = (focusButton: boolean) => {
    const el = details.current;
    if (!el?.open) return;
    el.open = false;
    if (focusButton) el.querySelector("summary")?.focus();
  };
  return (
    <details
      ref={details}
      className={cx(
        "group shrink-0",
        controls
          ? "md:contents md:[&::details-content]:contents md:[&::details-content]:[content-visibility:visible]"
          : "md:hidden",
      )}
      onKeyDown={(event) => {
        // A dialog opened from a control in the menu takes its own Escape; the menu stays open.
        if (
          event.key === "Escape" &&
          !(event.target instanceof Element && event.target.closest("dialog"))
        )
          close(true);
      }}
    >
      <summary
        className={cx(
          "flex cursor-pointer list-none md:hidden items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 select-none hover:bg-slate-50 [&::-webkit-details-marker]:hidden",
          focusRing,
        )}
      >
        <svg {...ICON} className={cx(ICON.className, "group-open:hidden")}>
          <path d="M3 5.5h14M3 10h14M3 14.5h14" />
        </svg>
        <svg {...ICON} className={cx(ICON.className, "hidden group-open:block")}>
          <path d="M5 5l10 10M15 5L5 15" />
        </svg>
        {label}
      </summary>
      {/* A click on any link inside closes the menu; the panel's own padding does not. */}
      {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- the link itself is the keyboard target; this only reacts to its click */}
      <div
        // From `md` the panel draws no box (`contents`), so its dropdown look applies below `md` only.
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-var(--app-header))] overflow-y-auto overscroll-contain border-y border-slate-200 bg-white shadow-lg md:contents"
        onClick={(event) => {
          if (event.target instanceof Element && event.target.closest("a[href]")) close(false);
        }}
      >
        <ContainerFrame className="flex flex-col gap-3 py-3 md:contents">
          {controls && (
            <div className="flex flex-wrap items-center gap-2 md:flex-nowrap md:*:shrink-0 md:[&>.w-full]:w-auto">
              {controls}
            </div>
          )}
          {/* From `md` the links render in their own rows, so these copies are hidden there. */}
          <div className="flex flex-col gap-3 md:hidden">{children}</div>
        </ContainerFrame>
      </div>
    </details>
  );
}
