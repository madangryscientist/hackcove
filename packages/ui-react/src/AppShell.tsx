import { type ReactElement, type ReactNode, useCallback, useState } from "react";
import { AppShellMenu } from "./AppShellMenu.js";
import { ContainerFrame } from "./Container.js";
import { schemeClass, type ColourScheme, type ColourSchemeClasses } from "./colourScheme.js";
import { cx, focusRing } from "./cx.js";
import { DensityProvider } from "./density.js";
import { renderLink } from "./link.js";
import { useNavFold } from "./navFold.js";
import type { Passthrough } from "./props.js";
import { useScrollEdges } from "./scrollEdges.js";
import type { Size } from "./size.js";

/**
 * The class an app puts on its own `<html>`: it always reserves the scrollbar, so centred content
 * does not shift between a short page and a long one. AppShell never touches `<html>` itself.
 */
export const appShellRootClass = "overflow-y-scroll";

/**
 * Everything an app puts on its own `<html>` from the scheme the server knows: that scheme's class
 * (`schemeClass`) and the shell's root class, joined: `<html className={appShellRootClassFor(scheme,
 * schemes)}>`.
 */
export function appShellRootClassFor(scheme: ColourScheme, schemes?: ColourSchemeClasses): string {
  return cx(schemeClass(scheme, schemes), appShellRootClass);
}

const LOGO_BOX: Record<Size, string> = { sm: "size-5", md: "size-6", lg: "size-8" };

/**
 * The `brand` slot as one link: a logo and a label inside the same `<a>`, so the whole brand is the
 * way home. The label names the link; the logo is decoration and hidden from assistive tech.
 * `collapse` shows only the logo below `sm`, the label staying in the accessible name. An in-app
 * `href` is drawn by the app's router link through `LinkProvider`.
 */
export function AppShellBrand({
  logo,
  logoSize = "md",
  label,
  collapse = false,
  href,
  ...rest
}: Passthrough & {
  /** The name beside the logo. It is the link's accessible name. */
  label: ReactNode;
  /** Where the brand links, usually the app's home (`/`). */
  href: string;
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
  )): ReactElement {
  return renderLink({
    ...rest,
    href,
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

// One fixed-height row that never wraps; its children keep their width. From `md` it scrolls sideways
// if it must; below `md` nothing in the header scrolls (the nav is in the menu), so it only clips.
const ROW = "items-center gap-4 overflow-x-clip whitespace-nowrap md:overflow-x-auto *:shrink-0";

// From `md`, while a row has more to scroll to on a side, that edge fades out (a mask, so it follows
// any theme). `ScrollRow` sets `data-more-start` / `data-more-end` (and `data-more` for either); a
// row that fits has none and is untouched. Below `md` there is no mask, which would clip the menu.
const FADE =
  "md:data-more-start:[--fade-start:2rem] md:data-more-end:[--fade-end:2rem] md:data-more:[mask-image:linear-gradient(to_right,transparent,#000_var(--fade-start,0px),#000_calc(100%_-_var(--fade-end,0px)),transparent)]";

/** A row in a Container, with the fade on whichever side still has content to scroll to. `onRow` is also handed the row. */
function ScrollRow({
  className,
  onRow,
  children,
}: {
  className: string;
  onRow?: (row: HTMLElement | null) => void;
  children: ReactNode;
}) {
  const [row, setRow] = useState<HTMLElement | null>(null);
  useScrollEdges(row, "x");
  const attach = useCallback(
    (element: HTMLElement | null) => {
      setRow(element);
      onRow?.(element);
    },
    [onRow],
  );
  return (
    <ContainerFrame ref={attach} className={cx(ROW, FADE, className)}>
      {children}
    </ContainerFrame>
  );
}

/**
 * The header row's slots in order: brand, nav (from `md`), the free `children`, then `controls` and
 * the menu at the end. `controls` have a wrapper of their own that shrinks and clips, and the menu
 * sits beside it, so a crowded `controls` never pushes the Menu off a phone screen. From `md` the
 * menu is the inline row of `menuControls` after `controls`. `folded` hides the nav from `md` too:
 * it is in the menu.
 */
function HeaderSlots({
  brand,
  nav,
  controls,
  menu,
  menuInline,
  folded,
  children,
}: {
  brand: ReactNode;
  nav: ReactNode;
  controls: ReactNode;
  menu: ReactNode;
  /** The menu shows `menuControls` in the row from `md`, so its wrapper stays from `md`. */
  menuInline: boolean;
  /** The nav did not fit the row from `md`, so it is in the menu there too. */
  folded: boolean;
  children: ReactNode;
}): ReactElement {
  return (
    <>
      {brand && (
        <div className="flex items-center gap-2 text-base font-bold tracking-tight text-slate-900">
          {brand}
        </div>
      )}
      {nav && (
        <div className={cx("hidden items-center gap-4 *:shrink-0", !folded && "md:flex")}>
          {nav}
        </div>
      )}
      {children}
      {(controls || menu) && (
        <div
          className={cx(
            // Below `md` this wrapper may shrink (the row's `*:shrink-0` is overridden), so a crowded
            // `controls` clips inside its own box; from `md` it keeps its width and the row scrolls.
            "ml-auto flex min-w-0 items-center gap-2 max-md:shrink!",
            !controls && !menuInline && !folded && "md:hidden",
          )}
        >
          {controls && (
            // Clips below `md` only, with 4px of room each side so a focus outline is not cut.
            <div className="flex min-w-0 items-center gap-2 *:shrink-0 max-md:-mx-1 max-md:overflow-x-clip max-md:px-1 [&>.w-full]:w-auto">
              {controls}
            </div>
          )}
          {menu}
        </div>
      )}
    </>
  );
}

/**
 * The sticky header: the one-row slots, and from `md` the `subnav` row under them. It pads by the
 * top safe-area inset. From `md` it measures its row: a nav that does not fit folds into the Menu
 * (`data-nav-folded`) and comes back when the row is wide enough again (`useNavFold`).
 */
function AppShellHeader({
  brand,
  nav,
  controls,
  menuControls,
  subnav,
  menuLabel,
  hideChromeInPrint,
  children,
}: {
  brand: ReactNode;
  nav: ReactNode;
  controls: ReactNode;
  menuControls: ReactNode;
  subnav: ReactNode;
  menuLabel: string;
  hideChromeInPrint: boolean;
  children: ReactNode;
}): ReactElement {
  const [row, setRow] = useState<HTMLElement | null>(null);
  const folded = useNavFold(row, !!nav);
  return (
    <header
      data-nav-folded={folded ? "" : undefined}
      className={cx(
        "sticky top-0 z-10 border-b border-slate-200 bg-white pt-[env(safe-area-inset-top)]",
        hideChromeInPrint && "print:hidden",
      )}
    >
      <ScrollRow className="flex h-14" onRow={setRow}>
        <HeaderSlots
          brand={brand}
          nav={nav}
          controls={controls}
          menuInline={!!menuControls}
          folded={folded}
          menu={
            (nav || subnav || menuControls) && (
              <AppShellMenu
                label={menuLabel}
                controls={menuControls}
                nav={nav}
                subnav={subnav}
                folded={folded}
              />
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

/** The type step an app sets once on its `AppShell`: `compact` is one step down for the whole app. */
export type AppShellDensity = "compact";

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
 * styling for any of them: an item that only fits a wide screen goes in a `Show from`. A bar
 * that sticks under the header as the page scrolls is a `StickyBar`.
 *
 * On a phone (below `md`) the header is one 56px row at every page: `brand`, `header`, `controls`
 * and a "Menu" button (`menuLabel`), and `nav` and `subnav` move into that menu, so every link is
 * reachable and nothing scrolls sideways. The menu is a native `<details>`, so it works with the
 * keyboard, with a screen reader and on a page that never hydrates. From `md` the header is the
 * row, and the `subnav` row, as they are, except that a `nav` too wide for the row folds into the
 * Menu and comes back when the screen is wide enough (measured, with script; a `subnav` never
 * folds, it scrolls sideways with a fade).
 *
 * The edges need nothing from the app: with `viewport-fit=cover` every Container clears the
 * safe-area insets at the sides, the header the top one and the shell the bottom one; and an
 * element with an `id` anywhere inside lands below the sticky header when a link or focus scrolls
 * to it.
 *
 * `controls` stay in the row at every width, so keep them few (a theme toggle, the viewer's avatar);
 * on a phone a crowded `controls` clips, and the Menu button is never the part cut off. Pickers and
 * actions that do not fit a phone row go in `menuControls`: rendered once, they sit in the row after
 * `controls` from `md`, and below `md` at the top of the Menu, above `nav` and `subnav`.
 */
export function AppShell({
  brand,
  nav,
  controls,
  menuControls,
  header,
  subnav,
  menuLabel = "Menu",
  footer,
  bleed = false,
  printChrome = true,
  density,
  children,
  ...rest
}: {
  /** The brand: a logo and a name, in the header's brand type, with the gap between them. `AppShellBrand` makes both one link. */
  brand?: ReactNode;
  /** The main navigation, e.g. a `Tabs` of links (it is already a `<nav>`). Below `md` it is in the menu. */
  nav?: ReactNode;
  /** The end of the row: a picker, a theme toggle. Gap-2, vertically centred; no child shrinks, and a full-width control (a `Select` at its default) sizes to its content. */
  controls?: ReactNode;
  /**
   * Pickers and actions that do not fit a phone row, such as a project `Select` and a Sign out
   * `Button`. From `md` they sit in the row after `controls`; below `md` they are at the top of the
   * Menu, above `nav` and `subnav`. Rendered once, so a field keeps its state and ids stay unique.
   * `controls` stay in the row at every width, so keep those few.
   */
  menuControls?: ReactNode;
  /** The escape hatch: a free node in the header row, after `brand` and `nav`. */
  header?: ReactNode;
  /** A second fixed-height row under the header from `md`, e.g. a `Tabs` of links. Below `md` it is in the menu with `nav`. */
  subnav?: ReactNode;
  /**
   * The phone menu button's name, for an app in another language. Only drawn below `md`, and only
   * when `nav`, `subnav` or `menuControls` is given.
   * @default Menu
   */
  menuLabel?: string;
  /** The page footer: small muted text in a `Container`, under a hairline. Hidden in print with `printChrome={false}`. */
  footer?: ReactNode;
  /** Main without a Container, for a full-bleed layout. */
  bleed?: boolean;
  /**
   * Whether a print shows the header and footer. `false` prints only the page: the header and
   * footer are hidden, and main's Container drops its padding (the page margin is then `@page`'s).
   * @default true
   */
  printChrome?: boolean;
  /**
   * The app's type step, set once here and nowhere else: `compact` sets text, headings and controls
   * one step down everywhere inside, for an app's dense chrome. Left out, text is 16px, as a site's.
   */
  density?: AppShellDensity | undefined;
  children: ReactNode;
} & Passthrough): ReactElement {
  const hideChromeInPrint = !printChrome;
  return (
    <DensityProvider type={density}>
      <div
        {...rest}
        className={cx(
          "flex min-h-dvh flex-col bg-gray-50 pb-[env(safe-area-inset-bottom)] font-sans text-slate-900 antialiased",
          // The sticky header's height (its rows, the top inset and the bottom border), for a bar
          // that sticks under it. Below `md` it is one row whatever the slots are: the subnav is in the menu.
          "[--app-header:calc(3.5rem+1px+env(safe-area-inset-top))]",
          subnav ? "md:[--app-header:calc(6.5rem+1px+env(safe-area-inset-top))]" : undefined,
          // A link or focus that scrolls to any element with an id stops below the sticky header.
          "[&_[id]]:scroll-mt-[calc(var(--app-header,0px)+1rem)]",
        )}
      >
        <AppShellHeader
          brand={brand}
          nav={nav}
          controls={controls}
          menuControls={menuControls}
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
    </DensityProvider>
  );
}
