import { type HTMLAttributes, type ReactElement, type ReactNode, useState } from "react";
import { AppShellMenu } from "./AppShellMenu.js";
import { ContainerFrame } from "./Container.js";
import { schemeClass, type ColourScheme, type ColourSchemeClasses } from "./colourScheme.js";
import { cx, focusRing } from "./cx.js";
import { type LinkRender, renderLink } from "./link.js";
import type { Passthrough, Unstyled } from "./props.js";
import { useScrollEdges } from "./scrollEdges.js";
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

/** The breakpoint below which an `AppShellHideBelow` item is hidden. */
export type AppShellBreakpoint = "sm" | "md" | "lg";

const SHOWN_FROM: Record<AppShellBreakpoint, string> = {
  sm: "hidden sm:flex",
  md: "hidden md:flex",
  lg: "hidden lg:flex",
};

/**
 * An inline header item that only shows from a breakpoint up, such as the viewer's avatar and name
 * in `controls`: below `breakpoint` it is gone (`display: none`, so assistive tech skips it too).
 * Its children sit in a row with the header's gap.
 */
export function AppShellHideBelow({
  breakpoint = "sm",
  children,
  ...rest
}: Passthrough & {
  /**
   * Hidden below `sm` (640px), `md` (768px) or `lg` (1024px).
   * @default sm
   */
  breakpoint?: AppShellBreakpoint;
  children: ReactNode;
}): ReactElement {
  return (
    <span {...rest} className={cx(SHOWN_FROM[breakpoint], "items-center gap-2")}>
      {children}
    </span>
  );
}

// One fixed-height row that never wraps; its children keep their width. From `md` it scrolls sideways
// if it must; below `md` nothing in the header scrolls (the nav is in the menu), so it only clips.
const ROW = "items-center gap-4 overflow-x-clip whitespace-nowrap md:overflow-x-auto *:shrink-0";

// From `md`, while a row has more to scroll to on a side, that edge fades out (a mask, so it follows
// any theme). `ScrollRow` sets `data-more-start` / `data-more-end` (and `data-more` for either); a
// row that fits has none and is untouched. Below `md` there is no mask, which would clip the menu.
const FADE =
  "md:data-more-start:[--fade-start:2rem] md:data-more-end:[--fade-end:2rem] md:data-more:[mask-image:linear-gradient(to_right,transparent,#000_var(--fade-start,0px),#000_calc(100%_-_var(--fade-end,0px)),transparent)]";

/** A row in a Container, with the fade on whichever side still has content to scroll to. */
function ScrollRow({ className, children }: { className: string; children: ReactNode }) {
  const [row, setRow] = useState<HTMLElement | null>(null);
  useScrollEdges(row, "x");
  return (
    <ContainerFrame elementRef={setRow} className={cx(ROW, FADE, className)}>
      {children}
    </ContainerFrame>
  );
}

/**
 * The header row's slots in order: brand, nav (from `md`), the free `children`, then controls and,
 * below `md`, the menu at the end.
 */
function HeaderSlots({
  brand,
  nav,
  controls,
  menu,
  children,
}: {
  brand: ReactNode;
  nav: ReactNode;
  controls: ReactNode;
  menu: ReactNode;
  children: ReactNode;
}): ReactElement {
  return (
    <>
      {brand && (
        <div className="flex items-center gap-2 text-base font-bold tracking-tight text-slate-900">
          {brand}
        </div>
      )}
      {nav && <div className="hidden items-center gap-4 *:shrink-0 md:flex">{nav}</div>}
      {children}
      {(controls || menu) && (
        <div
          className={
            controls
              ? "ml-auto flex items-center gap-2 *:shrink-0 [&>.w-full]:w-auto"
              : "ml-auto flex items-center gap-2 *:shrink-0 md:hidden"
          }
        >
          {controls}
          {menu}
        </div>
      )}
    </>
  );
}

/** The sticky header: the one-row slots, and from `md` the `subnav` row under them. */
function AppShellHeader({
  brand,
  nav,
  controls,
  subnav,
  menuLabel,
  hideChromeInPrint,
  children,
}: {
  brand: ReactNode;
  nav: ReactNode;
  controls: ReactNode;
  subnav: ReactNode;
  menuLabel: string;
  hideChromeInPrint: boolean;
  children: ReactNode;
}): ReactElement {
  return (
    <header
      className={cx(
        "sticky top-0 z-10 border-b border-slate-200 bg-white",
        hideChromeInPrint && "print:hidden",
      )}
    >
      <ScrollRow className="flex h-14">
        <HeaderSlots
          brand={brand}
          nav={nav}
          controls={controls}
          menu={
            (nav || subnav) && (
              <AppShellMenu label={menuLabel}>
                {nav}
                {subnav}
              </AppShellMenu>
            )
          }
        >
          {children}
        </HeaderSlots>
      </ScrollRow>
      {subnav && <ScrollRow className="hidden h-12 md:flex">{subnav}</ScrollRow>}
    </header>
  );
}

/**
 * The page frame: it paints the page canvas and sets the type face, ink and font smoothing
 * (`antialiased`), so an app writes no page-background or font rule of its own (a theme remaps
 * the canvas and the font stacks). A sticky one-row header, an optional second `subnav` row, the main area and an
 * optional footer. Header, main and footer each sit in a `Container`, so pages never set their own
 * width or padding. `bleed` drops main's Container (the header keeps its own), for a layout that
 * needs the whole width (`FullBleedLayout`). Main is a flex column. `SidebarLayout` needs no
 * `bleed`: its rail and canvas share the header's Container.
 *
 * The header row is laid out by its slots, left to right: `brand`, `nav`, then `header` (anything
 * the slots do not cover), then `controls`, pushed to the end. An app writes no wrapper or
 * styling for any of them: an item that only fits a wide screen goes in `AppShellHideBelow`. A bar
 * that sticks under the header as the page scrolls is a `StickyBar`.
 *
 * On a phone (below `md`) the header is one 56px row at every page: `brand`, `header`, `controls`
 * and a "Menu" button (`menuLabel`), and `nav` and `subnav` move into that menu, so every link is
 * reachable and nothing scrolls sideways. The menu is a native `<details>`, so it works with the
 * keyboard, with a screen reader and on a page that never hydrates. From `md` the header is the
 * row, and the `subnav` row, as they are.
 */
export function AppShell({
  brand,
  nav,
  controls,
  header,
  subnav,
  menuLabel = "Menu",
  footer,
  bleed = false,
  hideChromeInPrint = false,
  children,
  ...rest
}: {
  /** The brand: a logo and a name, in the header's brand type, with the gap between them. `AppShellBrand` makes both one link. */
  brand?: ReactNode;
  /** The main navigation, e.g. a `Tabs variant="pill"` of links (it is already a `<nav>`). Below `md` it is in the menu. */
  nav?: ReactNode;
  /** The end of the row: a picker, a theme toggle. Gap-2, vertically centred; no child shrinks, and a full-width control (a `Select` at its default) sizes to its content. */
  controls?: ReactNode;
  /** The escape hatch: a free node in the header row, after `brand` and `nav`. */
  header?: ReactNode;
  /** A second fixed-height row under the header from `md`, e.g. a `Tabs variant="pill"` of links. Below `md` it is in the menu with `nav`. */
  subnav?: ReactNode;
  /**
   * The phone menu button's name, for an app in another language. Only drawn below `md`, and only
   * when `nav` or `subnav` is given.
   * @default Menu
   */
  menuLabel?: string;
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
        "flex min-h-dvh flex-col bg-gray-50 font-sans text-slate-900 antialiased",
        // The sticky header's height (its rows and the bottom border), for a bar that sticks under it.
        // Below `md` it is one row whatever the slots are: the subnav is in the menu.
        "[--app-header:calc(3.5rem+1px)]",
        subnav ? "md:[--app-header:calc(6.5rem+1px)]" : undefined,
      )}
    >
      <AppShellHeader
        brand={brand}
        nav={nav}
        controls={controls}
        subnav={subnav}
        menuLabel={menuLabel}
        hideChromeInPrint={hideChromeInPrint}
      >
        {header}
      </AppShellHeader>
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
