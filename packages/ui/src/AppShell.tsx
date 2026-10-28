import { type HTMLAttributes, type ReactElement, type ReactNode, useEffect, useRef } from "react";
import { ContainerFrame } from "./Container.js";
import { schemeClass, type ColourScheme, type ColourSchemeClasses } from "./colourScheme.js";
import { cx, focusRing } from "./cx.js";
import { type LinkRender, renderLink } from "./link.js";
import type { Passthrough, Unstyled } from "./props.js";
import type { Size } from "./size.js";

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

const LOGO_BOX: Record<Size, string> = { sm: "size-5", md: "size-6", lg: "size-8" };

/**
 * The `brand` slot as one link: a logo and a label inside the same `<a>`, so the whole brand is the
 * way home. The label names the link; the logo is decoration and hidden from assistive tech.
 * `collapse` shows only the logo below `sm`, the label staying in the accessible name. With
 * `render` it draws the app's own router `<Link>` (`render={(p) => <Link to="/" {...p} />}`).
 */
export function AppShellBrand({
  logo,
  logoSize = "md",
  label,
  collapse = false,
  href,
  render,
  ...rest
}: Passthrough & {
  /** The name beside the logo. It is the link's accessible name. */
  label: ReactNode;
  /** The logo slot's box: sm 20px, md 24px (the default, an `Avatar size="sm"`), lg 32px. An `<img>` or `<svg>` logo fills it. */
  logoSize?: Size;
} & (
    | {
        /** The mark before the label, e.g. an `Avatar` or an `<img>`. */
        logo?: ReactNode;
        collapse?: false | undefined;
      }
    | {
        logo: ReactNode;
        /** Below `sm` only the logo shows; the label is visually hidden and still names the link. Needs a `logo`. */
        collapse: true;
      }
  ) &
  (
    | {
        /** Where the brand links, usually the app's home (`/`). */
        href: string;
        /** Draws the link with the app's own router `<Link>`: `(p) => <Link to="/" {...p} />`. */
        render?: LinkRender | undefined;
      }
    | {
        /** Where the brand links, usually the app's home (`/`). */
        href?: string | undefined;
        /** Draws the link with the app's own router `<Link>`: `(p) => <Link to="/" {...p} />`. */
        render: LinkRender;
      }
  )): ReactElement {
  return renderLink({
    ...rest,
    href,
    render,
    className: cx("flex items-center gap-2 rounded", focusRing),
    children: (
      <>
        {logo && (
          <span
            aria-hidden="true"
            className={cx(
              "flex shrink-0 items-center justify-center [&>img]:size-full [&>svg]:size-full",
              LOGO_BOX[logoSize],
            )}
          >
            {logo}
          </span>
        )}
        <span className={collapse ? "sr-only sm:not-sr-only" : undefined}>{label}</span>
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
    <ContainerFrame
      elementRef={(el) => void (row.current = el)}
      className={cx(ROW, FADE, className)}
    >
      {children}
    </ContainerFrame>
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
 * The page frame: it paints the page canvas and sets the type face and ink, so an app writes no
 * page-background or font rule of its own (a theme remaps the canvas and the font stacks). A sticky one-row header, an optional second `subnav` row, the main area and an
 * optional footer. Header, main and footer each sit in a `Container`, so pages never set their own
 * width or padding. `bleed` drops main's Container (the header keeps its own), for a layout that
 * needs the whole width (`FullBleedLayout`). Main is a flex column. `SidebarLayout` needs no
 * `bleed`: its rail and canvas share the header's Container.
 *
 * The header row is laid out by its slots, left to right: `brand`, `nav`, then `header` (anything
 * the slots do not cover), then `controls`, pushed to the end. An app writes no wrapper or
 * styling for any of them.
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
  ...rest
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
  /** The page footer: small muted text in a `Container`, under a hairline. Hidden in print with `hideChromeInPrint`. */
  footer?: ReactNode;
  /** Main without a Container, for a full-bleed layout. */
  bleed?: boolean;
  /**
   * Print only the page: the header and footer are hidden, and main's Container drops its padding
   * (the page margin is then `@page`'s). Off by default, so a print is unchanged unless an app asks.
   */
  hideChromeInPrint?: boolean;
  children: ReactNode;
} & Unstyled<Omit<HTMLAttributes<HTMLDivElement>, "children">>): ReactElement {
  return (
    <div
      {...rest}
      className={cx(
        "flex min-h-dvh flex-col bg-gray-50 font-sans text-slate-900",
        // The sticky header's height (its rows and the bottom border), for a bar that sticks under it.
        subnav ? "[--app-header:calc(6.5rem+1px)]" : "[--app-header:calc(3.5rem+1px)]",
      )}
    >
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
          <ContainerFrame className={cx("py-8", hideChromeInPrint && "print:p-0")}>
            {children}
          </ContainerFrame>
        )}
      </main>
      {footer && (
        <footer className={cx("border-t border-slate-200", hideChromeInPrint && "print:hidden")}>
          <ContainerFrame className="py-6 text-sm text-slate-500">{footer}</ContainerFrame>
        </footer>
      )}
    </div>
  );
}
