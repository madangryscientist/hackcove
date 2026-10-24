import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { buttonClass } from "./Button.js";
import { ButtonLink } from "./ButtonLink.js";
import type { LinkRenderProps } from "./link.js";

// A stand-in for a router's <Link>: it takes `to` and spreads the props it is handed.
const Link = ({ to, ...rest }: { to: string } & LinkRenderProps): ReactElement => (
  <a data-router-link="" data-to={to} {...rest} />
);

describe("ButtonLink", () => {
  it("renders an <a href> in the button classes", () => {
    const out = renderToStaticMarkup(<ButtonLink href="/new">New</ButtonLink>);
    expect(out).toBe(`<a href="/new" class="${buttonClass("primary")}">New</a>`);
  });

  it("appends className and passes anchor props through", () => {
    const out = renderToStaticMarkup(
      <ButtonLink href="/x" className="w-full" download="x.pdf">
        X
      </ButtonLink>,
    );
    expect(out).toContain(`${buttonClass("primary")} w-full`);
    expect(out).toContain('download="x.pdf"');
  });

  it("external opens in a new tab", () => {
    const out = renderToStaticMarkup(
      <ButtonLink href="https://example.com" external>
        X
      </ButtonLink>,
    );
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noreferrer"');
    expect(renderToStaticMarkup(<ButtonLink href="/x">X</ButtonLink>)).not.toContain("target");
  });

  it("render draws the app's own Link with the button classes and no href", () => {
    const out = renderToStaticMarkup(
      <ButtonLink variant="ghost" render={(p) => <Link to="/quotes" {...p} />}>
        Back
      </ButtonLink>,
    );
    expect(out).toContain('data-router-link=""');
    expect(out).toContain('data-to="/quotes"');
    expect(out).toContain(buttonClass("ghost"));
    expect(out).toContain(">Back</a>");
    expect(out).not.toContain("href=");
  });

  it("render with external hands target and rel to the Link", () => {
    const out = renderToStaticMarkup(
      <ButtonLink external render={(p) => <Link to="/x" {...p} />}>
        X
      </ButtonLink>,
    );
    expect(out).toContain('target="_blank"');
  });
});
