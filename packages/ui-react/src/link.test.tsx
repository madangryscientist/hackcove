// @vitest-environment jsdom
import type { ReactElement, ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { isAppHref, type LinkAdapterProps, LinkProvider } from "./link.js";
import { render, screen } from "./render.harness.js";
import { TextLink } from "./TextLink.js";

// A stand-in for a router's <Link> (TanStack's): its optional props are `?: T`, with no
// `| undefined`, as under `exactOptionalPropertyTypes` a spread of a `?: T | undefined` field fails.
type StrictLinkProps = {
  href?: string;
  className?: string;
  children?: ReactNode;
  "aria-current"?: boolean | "page" | "true" | "false" | "date" | "location" | "step" | "time";
  target?: string;
  rel?: string;
  title?: string;
  id?: string;
};
const StrictLink = (props: StrictLinkProps): ReactElement => <a data-router="" {...props} />;
const strictAdapter = (props: LinkAdapterProps) => <StrictLink {...props} />;

describe("LinkAdapterProps", () => {
  it("spreads onto a router link whose optional props carry no `| undefined`", () => {
    render(
      <LinkProvider link={strictAdapter}>
        <TextLink href="/terms" title="Read the terms">
          Terms
        </TextLink>
      </LinkProvider>,
    );
    const link = screen.getByRole("link", { name: "Terms" });
    expect(link.getAttribute("href")).toBe("/terms");
    expect(link.hasAttribute("data-router")).toBe(true);
    expect(link.getAttribute("title")).toBe("Read the terms");
  });

  it("leaves out a key with no value instead of handing the adapter `undefined`", () => {
    const seen: LinkAdapterProps[] = [];
    render(
      <LinkProvider
        link={(props) => {
          seen.push(props);
          return null;
        }}
      >
        <TextLink href="/x">X</TextLink>
      </LinkProvider>,
    );
    expect(Object.keys(seen[0] ?? {}).toSorted()).toEqual(["children", "className", "href"]);
  });
});

describe("isAppHref", () => {
  it.each([
    ["/x", true],
    ["/", true],
    ["/x?y=1#z", true],
    ["//cdn.x", false],
    ["https://x", false],
    ["mailto:a@b", false],
    ["#top", false],
    ["x/y", false],
  ])("%s is an in-app path: %s", (href, expected) => {
    expect(isAppHref(href)).toBe(expected);
  });
});
