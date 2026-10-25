import { type ReactElement, type ReactNode, useEffect, useRef } from "react";
import { Container } from "./Container.js";
import { schemeClass, type ColourScheme, type ColourSchemeClasses } from "./colourScheme.js";
import { cx, focusRing } from "./cx.js";
import { type LinkRender, renderLink } from "./link.js";

/**
 * The class an app puts on its own `<html>`: it always reserves the scrollbar, so centred content
 * does not shift between a short page and a long one. AppShell never touches `<html>` itself.
 */
export const appShellRootClass = "overflow-y-scroll";

/**
 * Everything an app puts on its own `<html>` from the scheme the server knows: that scheme's class
 * (`schemeClass`) and `appShellRootClass`, joined. `<html className={appShellRootClassFor(scheme,
 * schemes)}>` replaces `schemeClass(scheme, schemes) + " " + appShellRootClass`.
 */
export function appShellRootClassFor(scheme: ColourScheme, schemes?: ColourSchemeClasses): string {
  return cx(schemeClass(scheme, schemes), appShellRootClass);
}

/**
 * The `brand` slot as one link: a logo and a label inside the same `<a>`, so the whole brand is the
 * way home. The label names the link; the logo is decoration and hidden from assistive tech. With
 * `render` it draws the app's own router `<Link>` (`render={(p) => <Link to="/" {...p} />}`).
 */
export function AppShellBrand({
  logo,
  label,
  href,
  render,
}: {
  /** The mark before the label, e.g. an `Avatar` or an `<img>`. */
  logo?: ReactNode;
  /** The name beside the logo. It is the link's accessible name. */
  label: ReactNode;
} & (
  | { href: string; render?: LinkRender | undefined }
  | { href?: string | undefined; render: LinkRender }
)): ReactElement {
  return renderLink({
    href,
    render,
    className: cx("flex items-center gap-2 rounded", focusRing),
    children: (
      <>
        {logo && (
          <span aria-hidden="true" className="flex shrink-0 items-center">
            {logo}
          </span>
        )}
        <span>{label}</span>
      </>
    ),
  });
}

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

/** The header row's slots in order: brand, nav, the free `children`, then controls at the end. */
function HeaderSlots({
  brand,
  nav,
  controls,
  children,
}: {
  brand: ReactNode;
  nav: ReactNode;
  controls: ReactNode;
  children: ReactNode;
}): ReactElement {
  return (
    <>
      {brand && (
        <div className="flex items-center gap-2 text-base font-bold tracking-tight text-slate-900">
          {brand}
        </div>
      )}
      {nav}
      {children}
      {controls && (
        <div className="ml-auto flex items-center gap-2 *:shrink-0 [&>.w-full]:w-auto">
          {controls}
        </div>
      )}
    </>
  );
}

/**
 * The page frame: a sticky one-row header, an optional second `subnav` row, the main area and an
 * optional footer. Header, main and footer each sit in a `Container`, so pages never set their own
 * width or padding. `bleed` drops main's Container (the header keeps its own), for a layout that
 * needs the whole width (`FullBleedLayout`). Main is a flex column. `SidebarLayout` needs no
 * `bleed`: its rail and canvas share the header's Container.
 *
 * The header row is laid out by its slots, left to right: `brand`, `nav`, then `header` (anything
 * the slots do not cover), then `controls`, pushed to the end. An app writes no wrapper or
 * `className` for any of them.
 */
export function AppShell({
  brand,
  nav,
  controls,
  header,
  subnav,
  footer,
  bleed = false,
  hideChromeInPrint = false,
  children,
}: {
  /** The brand: a logo and a name, in the header's brand type, with the gap between them. `AppShellBrand` makes both one link. */
  brand?: ReactNode;
  /** The main navigation, e.g. `NavTabs` (it is already a `<nav>`). */
  nav?: ReactNode;
  /** The end of the row: a picker, a theme toggle. Gap-2, vertically centred; no child shrinks, and a full-width control (a `Select` at its default) sizes to its content. */
  controls?: ReactNode;
  /** The escape hatch: a free node in the header row, after `brand` and `nav`. */
  header?: ReactNode;
  /** A second fixed-height row under the header, e.g. `NavTabs`. */
  subnav?: ReactNode;
  footer?: ReactNode;
  /** Main without a Container, for a full-bleed layout. */
  bleed?: boolean;
  /**
   * Print only the page: the header and footer are hidden, and main's Container drops its padding
   * (the page margin is then `@page`'s). Off by default, so a print is unchanged unless an app asks.
   */
  hideChromeInPrint?: boolean;
  children: ReactNode;
}): ReactElement {
  return (
    <div className="flex min-h-dvh flex-col">
      <header
        className={cx(
          "sticky top-0 z-10 border-b border-slate-200 bg-white",
          hideChromeInPrint && "print:hidden",
        )}
      >
        <ScrollRow className="h-14">
          <HeaderSlots brand={brand} nav={nav} controls={controls}>
            {header}
          </HeaderSlots>
        </ScrollRow>
        {subnav && <ScrollRow className="h-12">{subnav}</ScrollRow>}
      </header>
      <main className="flex flex-1 flex-col">
        {bleed ? (
          children
        ) : (
          <Container className={cx("py-8", hideChromeInPrint && "print:p-0")}>{children}</Container>
        )}
      </main>
      {footer && (
        <footer className={cx("border-t border-slate-200", hideChromeInPrint && "print:hidden")}>
          <Container className="py-6 text-sm text-slate-500">{footer}</Container>
        </footer>
      )}
    </div>
  );
}
