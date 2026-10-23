import { type ReactElement, type ReactNode, useEffect, useRef } from "react";
import { Container } from "./Container.js";
import { cx } from "./cx.js";

/**
 * The class an app puts on its own `<html>`: it always reserves the scrollbar, so centred content
 * does not shift between a short page and a long one. AppShell never touches `<html>` itself.
 */
export const appShellRootClass = "overflow-y-scroll";

// One fixed-height row that scrolls sideways and never wraps; its children keep their width.
const ROW = "flex items-center gap-4 overflow-x-auto whitespace-nowrap *:shrink-0";

// While a row has more to scroll to on a side, that edge fades out (a mask, so it follows any theme).
// `ScrollRow` sets `data-more-start` / `data-more-end` (and `data-more` for either); a row that fits
// has none and is untouched.
const FADE =
  "data-more-start:[--fade-start:2rem] data-more-end:[--fade-end:2rem] data-more:[mask-image:linear-gradient(to_right,transparent,#000_var(--fade-start,0px),#000_calc(100%_-_var(--fade-end,0px)),transparent)]";

/** A row in a Container, with the fade on whichever side still has content to scroll to. */
function ScrollRow({ className, children }: { className: string; children: ReactNode }) {
  const row = useRef<HTMLElement | null>(null);
  // Every render: the children may have changed, and each needs observing.
  useEffect(() => {
    const el = row.current;
    if (!el) return undefined;
    const update = () => {
      const start = el.scrollLeft > 1;
      const end = el.scrollWidth - el.clientWidth - el.scrollLeft > 1;
      el.toggleAttribute("data-more-start", start);
      el.toggleAttribute("data-more-end", end);
      el.toggleAttribute("data-more", start || end);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    // jsdom (a consumer's own tests) has no ResizeObserver.
    const resize = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(update);
    resize?.observe(el);
    for (const child of el.children) resize?.observe(child);
    return () => {
      el.removeEventListener("scroll", update);
      resize?.disconnect();
    };
  });
  return (
    <Container elementRef={(el) => void (row.current = el)} className={cx(ROW, FADE, className)}>
      {children}
    </Container>
  );
}

/**
 * The page frame: a sticky one-row header, an optional second `subnav` row, the main area and an
 * optional footer. Header, main and footer each sit in a `Container`, so pages never set their own
 * width or padding. `bleed` drops main's Container (the header keeps its own). Main is a flex
 * column, so a full-height child (`SidebarLayout`) is `flex-1 min-h-0` and needs no header height.
 */
export function AppShell({
  header,
  subnav,
  footer,
  bleed = false,
  children,
}: {
  /** The header row: logo, nav, controls. Always one `h-14` row. */
  header: ReactNode;
  /** A second fixed-height row under the header, e.g. `NavTabs`. */
  subnav?: ReactNode;
  footer?: ReactNode;
  /** Main without a Container, for a full-bleed layout. */
  bleed?: boolean;
  children: ReactNode;
}): ReactElement {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <ScrollRow className="h-14">{header}</ScrollRow>
        {subnav && <ScrollRow className="h-12">{subnav}</ScrollRow>}
      </header>
      <main className="flex flex-1 flex-col">
        {bleed ? children : <Container className="py-8">{children}</Container>}
      </main>
      {footer && (
        <footer className="border-t border-slate-200">
          <Container className="py-6 text-sm text-slate-500">{footer}</Container>
        </footer>
      )}
    </div>
  );
}
