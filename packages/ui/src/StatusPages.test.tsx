import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button } from "./Button.js";
import { ErrorPage, Forbidden, Maintenance, NotFound, Offline } from "./StatusPages.js";
import type { LinkRenderProps } from "./link.js";

const Link = ({ to, ...rest }: { to: string } & LinkRenderProps): ReactElement => (
  <a data-router-link="" data-to={to} {...rest} />
);

const pages = [
  ["NotFound", NotFound, "Page not found"],
  ["ErrorPage", ErrorPage, "Something went wrong"],
  ["Offline", Offline, "You are offline"],
  ["Maintenance", Maintenance, "Down for maintenance"],
  ["Forbidden", Forbidden, "Access denied"],
] as const;

describe.each(pages)("%s", (_name, Page, heading) => {
  it("is a centred card with its fixed heading and no actions by default", () => {
    const out = renderToStaticMarkup(<Page />);
    expect(out).toMatch(/^<div class="mx-auto w-full max-w-md pt-16">/);
    expect(out).toContain(heading);
    expect(out).not.toContain("<a ");
    expect(out).not.toContain("<button");
  });
});

const home = (variant: "primary" | "outline"): string =>
  renderToStaticMarkup(
    <Button href="/" variant={variant}>
      Back to home
    </Button>,
  );

describe("the shared props", () => {
  it("takes a title and body override", () => {
    const out = renderToStaticMarkup(<NotFound title="Custom title">Custom body</NotFound>);
    expect(out).toContain("Custom title");
    expect(out).toContain("Custom body");
    expect(out).not.toContain("Page not found");
  });

  it("links home as the primary button", () => {
    expect(renderToStaticMarkup(<NotFound homeHref="/" />)).toContain(home("primary"));
  });

  it("draws the home link with the app's own Link", () => {
    const out = renderToStaticMarkup(<NotFound renderHome={(p) => <Link to="/" {...p} />} />);
    expect(out).toContain('data-to="/"');
    expect(out).toContain("Back to home");
  });

  it("puts a custom action before the home link, which then turns outline", () => {
    const out = renderToStaticMarkup(<NotFound action={<button>Go</button>} homeHref="/" />);
    expect(out.indexOf("Go")).toBeLessThan(out.indexOf("Back to home"));
    expect(out).toContain(home("outline"));
  });
});

describe("ErrorPage", () => {
  it("shows the error detail in a code block", () => {
    const out = renderToStaticMarkup(<ErrorPage detail="Request 4f2a failed" />);
    expect(out).toContain("<figure");
    expect(out).toContain("Request 4f2a failed");
  });

  it("shows no detail block without detail", () => {
    expect(renderToStaticMarkup(<ErrorPage />)).not.toContain("<figure");
  });

  it("adds a Try again button with onRetry, and an action replaces it", () => {
    expect(renderToStaticMarkup(<ErrorPage onRetry={() => {}} />)).toContain("Try again");
    const out = renderToStaticMarkup(<ErrorPage onRetry={() => {}} action={<i>Reload</i>} />);
    expect(out).toContain("Reload");
    expect(out).not.toContain("Try again");
  });
});

describe("Offline", () => {
  it("adds a Try again button with onRetry", () => {
    expect(renderToStaticMarkup(<Offline onRetry={() => {}} />)).toContain("Try again");
  });
});
