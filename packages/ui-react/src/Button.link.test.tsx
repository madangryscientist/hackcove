import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button, buttonClass } from "./Button.js";
import type { LinkRenderProps } from "./link.js";

// A stand-in for a router's <Link>: it takes `to` and spreads the props it is handed.
const Link = ({ to, ...rest }: { to: string } & LinkRenderProps): ReactElement => (
  <a data-router-link="" data-to={to} {...rest} />
);

describe("Button href", () => {
  it("renders an <a href> in the button classes", () => {
    const out = renderToStaticMarkup(<Button href="/new">New</Button>);
    expect(out).toBe(`<a href="/new" class="${buttonClass("primary")}">New</a>`);
  });

  it("passes anchor props through", () => {
    const out = renderToStaticMarkup(
      <Button href="/x" download="x.pdf">
        X
      </Button>,
    );
    expect(out).toContain(buttonClass("primary"));
    expect(out).toContain('download="x.pdf"');
  });

  it("external opens in a new tab", () => {
    const out = renderToStaticMarkup(
      <Button href="https://example.com" external>
        X
      </Button>,
    );
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noreferrer"');
    expect(renderToStaticMarkup(<Button href="/x">X</Button>)).not.toContain("target");
  });

  it("render draws the app's own Link with the button classes and no href", () => {
    const out = renderToStaticMarkup(
      <Button variant="ghost" render={(p) => <Link to="/quotes" {...p} />}>
        Back
      </Button>,
    );
    expect(out).toContain('data-router-link=""');
    expect(out).toContain('data-to="/quotes"');
    expect(out).toContain(buttonClass("ghost"));
    expect(out).toContain(">Back</a>");
    expect(out).not.toContain("href=");
  });

  it("render with external hands target and rel to the Link", () => {
    const out = renderToStaticMarkup(
      <Button external render={(p) => <Link to="/x" {...p} />}>
        X
      </Button>,
    );
    expect(out).toContain('target="_blank"');
  });
});
