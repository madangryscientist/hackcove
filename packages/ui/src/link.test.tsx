import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { type LinkRenderProps, renderLink } from "./link.js";

// A stand-in for a router's <Link> (TanStack's): its optional props are `?: T`, with no
// `| undefined`, as under `exactOptionalPropertyTypes` a spread of a `?: T | undefined` field fails.
type StrictLinkProps = {
  to: string;
  className?: string;
  children?: ReactNode;
  "aria-current"?: boolean | "page" | "true" | "false" | "date" | "location" | "step" | "time";
  target?: string;
  rel?: string;
  title?: string;
  id?: string;
};
const StrictLink = ({ to, ...rest }: StrictLinkProps): ReactElement => <a data-to={to} {...rest} />;

const toStrictLink = (props: LinkRenderProps) => <StrictLink to="/x" {...props} />;

describe("LinkRenderProps", () => {
  it("spreads onto a link whose optional props carry no `| undefined`", () => {
    const render = toStrictLink;
    const out = renderToStaticMarkup(
      renderLink({ render, className: "c", children: "X", "aria-current": "page", external: true }),
    );
    expect(out).toContain('data-to="/x"');
    expect(out).toContain('aria-current="page"');
    expect(out).toContain('target="_blank"');
  });
});

const seen = (args: Parameters<typeof renderLink>[0]): LinkRenderProps => {
  let got: LinkRenderProps | undefined;
  renderToStaticMarkup(
    renderLink({
      ...args,
      render: (props) => {
        got = props;
        return null;
      },
    }),
  );
  if (!got) throw new Error("render was not called");
  return got;
};

describe("renderLink", () => {
  it("leaves out a key with no value instead of handing render `undefined`", () => {
    const props = seen({
      className: "c",
      children: "X",
      "aria-current": undefined,
      target: undefined,
      rel: undefined,
      title: undefined,
    });
    expect(Object.keys(props).toSorted()).toEqual(["children", "className"]);
  });
});
