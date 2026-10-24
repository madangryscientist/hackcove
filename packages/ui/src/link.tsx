import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";

/**
 * What a `render` function receives to draw a link with the app's own router `<Link>`: the
 * component's classes, its label as `children`, and (for a tab that is current or a link that is
 * external) `aria-current`, `target` and `rel`. Spread it on the router's link:
 * `render: (props) => <Link to="/quotes" {...props} />`. `@hackcove/ui` has no router dependency.
 */
export type LinkRenderProps = Omit<
  ComponentPropsWithoutRef<"a">,
  "href" | "className" | "children"
> & {
  className: string;
  children: ReactNode;
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
  ...props
}: LinkRenderProps & {
  href?: string | undefined;
  render?: LinkRender | undefined;
  external?: boolean | undefined;
}): ReactElement {
  const all = external ? { target: "_blank", rel: "noreferrer", ...props } : props;
  if (render) return <>{render(all)}</>;
  return <a {...(href === undefined ? {} : { href })} {...all} />;
}
