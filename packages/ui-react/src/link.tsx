import {
  type ComponentPropsWithoutRef,
  createContext,
  type ReactElement,
  type ReactNode,
  type Ref,
  useContext,
  useMemo,
} from "react";

type AriaCurrent = NonNullable<ComponentPropsWithoutRef<"a">["aria-current"]>;

/**
 * What the app's `LinkAdapter` receives to draw an in-app link with its router's `<Link>`: the
 * destination as `href` (search and hash included), the component's classes, its label as
 * `children`, and (for a tab that is current, or an option with a tooltip) `aria-current`, `target`,
 * `rel` and `title`. `@hackcove/ui-react` has no router dependency.
 *
 * An optional field is `?: T`, never `?: T | undefined`, and a key that has no value is left out
 * rather than set to `undefined`. A router's `<Link>` declares its props that way, so under
 * `exactOptionalPropertyTypes` the spread compiles. Any other anchor prop the caller gave the
 * component (`id`, `data-*`, `download`, a handler) arrives too, untyped here, and `<Link>`
 * takes it as its own.
 */
export type LinkAdapterProps = {
  href: string;
  className: string;
  children: ReactNode;
  "aria-current"?: AriaCurrent;
  target?: string;
  rel?: string;
  title?: string;
};

/** Draws one in-app link: the app's router `<Link>`, handed `LinkAdapterProps`. */
export type LinkAdapter = (props: LinkAdapterProps) => ReactNode;

type LinkSettings = { link: LinkAdapter | undefined; home: string };

const LinkContext = createContext<LinkSettings>({ link: undefined, home: "/" });

/**
 * Names the app's router link once, so every part that links (`Button`, `IconButton`, `TextLink`,
 * `Pill`, `Card`, `ListRow`, `Breadcrumbs`, `Tabs`, `SegmentedControl`, `AppShellBrand`,
 * `SiteSearch`, `MediaTile`, `Avatar` and the status pages) takes a plain `href` and draws an in-app
 * one (a path from the root, `/quotes?page=2#top`) through the router. It renders no element.
 *
 * - TanStack Router: `createRouter({ routeTree, InnerWrap: ({ children }) => <LinkProvider link={(p) => <Link to="." {...p} />}>{children}</LinkProvider> })`,
 *   which also reaches the router's not-found and error components. A registered router's `Link`
 *   requires `to`; `to="."` satisfies it, and the `href` wins.
 * - React Router: `<LinkProvider link={({ href, ...p }) => <Link to={href} {...p} />}>` inside the router.
 * - Astro, or no router: no provider; every link is a plain `<a>`.
 *
 * An `external` link, a full URL (`https:`, `mailto:`, `tel:`), a `//` URL, a `#hash` or a relative
 * path never reaches the adapter: the library draws those as a plain `<a>`.
 *
 * `home` is where every status page's "Back to home" goes, `/` by default: the one place an app
 * says it, never a page. A full URL (a home on another site) is a plain `<a>` in the same tab. A
 * provider inside another keeps what it does not set, so `<LinkProvider home="/app">` within the
 * router's provider still draws through the router's link.
 */
export function LinkProvider({
  link,
  home,
  children,
}: {
  /** The app's router link, handed `LinkAdapterProps`. Left out, links are plain `<a>` (or the outer provider's). */
  link?: LinkAdapter | undefined;
  /**
   * Where the status pages' "Back to home" goes: an in-app path or a full URL.
   * @default "/"
   */
  home?: string | undefined;
  children: ReactNode;
}): ReactElement {
  const outer = useContext(LinkContext);
  const value = useMemo(
    () => ({ link: link ?? outer.link, home: home ?? outer.home }),
    [link, home, outer],
  );
  return <LinkContext.Provider value={value}>{children}</LinkContext.Provider>;
}

/** Where "Back to home" goes: the nearest `LinkProvider`'s `home`, or `/` with none. Internal. */
export function useHome(): string {
  return useContext(LinkContext).home;
}

/** Whether `href` is an in-app path the router draws: one that starts with a single `/`. */
export function isAppHref(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

type AppLinkProps = {
  className: string;
  children: ReactNode;
  href: string;
  "aria-current"?: AriaCurrent | undefined;
  target?: string | undefined;
  rel?: string | undefined;
  title?: string | undefined;
  external?: boolean | undefined;
  ref?: Ref<HTMLAnchorElement> | undefined;
} & Omit<ComponentPropsWithoutRef<"a">, "href" | "className" | "children" | "aria-current">;

/**
 * The one link part every component draws through. `external` is a plain `<a>` that opens a new
 * tab (`target="_blank"`, `rel="noreferrer"`, unless the caller passes its own); an in-app `href`
 * goes to the app's `LinkAdapter` when a `LinkProvider` is above; anything else is a plain `<a>`.
 * Internal: not exported from the package.
 */
function AppLink({
  href,
  external = false,
  className,
  children,
  "aria-current": current,
  target,
  rel,
  title,
  ...rest
}: AppLinkProps): ReactElement {
  const { link } = useContext(LinkContext);
  const opened = external ? { target: "_blank", rel: "noreferrer" } : {};
  const all = {
    ...rest,
    href,
    className,
    children,
    ...(current === undefined ? {} : { "aria-current": current }),
    ...opened,
    ...(target === undefined ? {} : { target }),
    ...(rel === undefined ? {} : { rel }),
    ...(title === undefined ? {} : { title }),
  };
  if (link && !external && isAppHref(href)) return <>{link(all)}</>;
  return <a {...all} />;
}

/** Draws one link through `AppLink`, so a part can return it from a branch. Internal. */
export function renderLink(props: AppLinkProps): ReactElement {
  return <AppLink {...props} />;
}

/**
 * The `data-*` attributes an item may carry onto its button or link, so a caller keeps its test
 * ids on a tab. Only `data-*`: there is no `className` or `style`.
 */
export type DataAttributes = { [name: `data-${string}`]: string | number | boolean | undefined };

/** The `data-*` entries of `item`, ready to spread on the element it draws. */
export function dataAttributes(item: object): DataAttributes {
  return Object.fromEntries(Object.entries(item).filter(([name]) => name.startsWith("data-")));
}
