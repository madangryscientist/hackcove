import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Body, Caption, Display, PageHeading, SectionHeading } from "./typography.js";

describe("typography", () => {
  it("renders the semantic default element and pinned classes", () => {
    const out = renderToStaticMarkup(<PageHeading>Status</PageHeading>);
    expect(out).toMatch(/^<h1 /);
    expect(out).toContain("text-2xl/8 font-semibold");
    expect(out).toContain("text-slate-900");
  });

  it("makes inline roles spans, and `as` turns them into blocks", () => {
    expect(renderToStaticMarkup(<Body>x</Body>)).toMatch(/^<span /);
    expect(renderToStaticMarkup(<Body as="p">x</Body>)).toMatch(/^<p /);
  });

  it("maps the colour prop to its slate/violet utility", () => {
    expect(renderToStaticMarkup(<Caption color="brand">x</Caption>)).toContain("text-violet-600");
    expect(renderToStaticMarkup(<Caption color="muted">x</Caption>)).toContain("text-slate-400");
  });

  it("keeps caller classes after the pinned ones and forwards element props", () => {
    const out = renderToStaticMarkup(
      <SectionHeading className="mt-4" id="s1">
        x
      </SectionHeading>,
    );
    expect(out).toContain('class="text-base/6 font-semibold text-slate-900 mt-4"');
    expect(out).toContain('id="s1"');
  });

  it("exposes a display name per role", () => {
    expect(Display.displayName).toBe("Display");
  });
});
