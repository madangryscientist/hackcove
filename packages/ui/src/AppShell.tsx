import type { ReactElement, ReactNode } from "react";
import { Container } from "./Container.js";
import { cx } from "./cx.js";

/**
 * The class an app puts on its own `<html>`: it always reserves the scrollbar, so centred content
 * does not shift between a short page and a long one. AppShell never touches `<html>` itself.
 */
export const appShellRootClass = "overflow-y-scroll";

// One fixed-height row that scrolls sideways and never wraps; its children keep their width.
const ROW = "flex items-center gap-4 overflow-x-auto whitespace-nowrap *:shrink-0";

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
        <Container className={cx(ROW, "h-14")}>{header}</Container>
        {subnav && <Container className={cx(ROW, "h-12")}>{subnav}</Container>}
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
