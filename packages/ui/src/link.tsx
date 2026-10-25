import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";

type AriaCurrent = NonNullable<ComponentPropsWithoutRef<"a">["aria-current"]>;

/**
 * What a `render` function receives to draw a link with the app's own router `<Link>`: the
 * component's classes, its label as `children`, and (for a tab that is current, a link that is
 * external or an option with a tooltip) `aria-current`, `target`, `rel` and `title`. Spread it on
 * the router's link: `render: (props) => <Link to="/quotes" {...props} />`. `@hackcove/ui` has no
 * router dependency.
 *
 * An optional field is `?: T`, never `?: T | undefined`, and a key that has no value is left out
 * rather than set to `undefined`. A router's `<Link>` declares its props that way, so under
 * `exactOptionalPropertyTypes` the spread compiles. Any other anchor prop the caller gave the
 * component (`id`, `data-*`, `download`, a handler) arrives too, untyped here, and `<Link>`
 * takes it as its own.
 */
export type LinkRenderProps = {
  className: string;
  children: ReactNode;
  "aria-current"?: AriaCurrent;
  target?: string;
  rel?: string;
  title?: string;
};

/** Draws one link. The component hands it `LinkRenderProps`; it returns the app's own link element. */
export type LinkRender = (props: LinkRenderProps) => ReactNode;

/**
 * A link drawn by `render` when there is one, otherwise a plain `<a href>`. `external` adds
 * `target="_blank"` and `rel="noreferrer"` to either, unless the caller passes its own.
 */
export function renderLink({
  href,
  render,
  external = false,
  className,
  children,
  "aria-current": current,
  target,
  rel,
  title,
  ...rest
}: {
  className: string;
  children: ReactNode;
  "aria-current"?: AriaCurrent | undefined;
  target?: string | undefined;
  rel?: string | undefined;
  title?: string | undefined;
  href?: string | undefined;
  render?: LinkRender | undefined;
  external?: boolean | undefined;
} & Omit<
  ComponentPropsWithoutRef<"a">,
  "href" | "className" | "children" | "aria-current"
>): ReactElement {
  const opened = external ? { target: "_blank", rel: "noreferrer" } : {};
  const all = {
    ...rest,
    className,
    children,
    ...(current === undefined ? {} : { "aria-current": current }),
    ...opened,
    ...(target === undefined ? {} : { target }),
    ...(rel === undefined ? {} : { rel }),
    ...(title === undefined ? {} : { title }),
  };
  if (render) return <>{render(all)}</>;
  return <a {...(href === undefined ? {} : { href })} {...all} />;
}
