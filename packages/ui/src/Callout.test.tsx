import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Callout } from "./Callout.js";

describe("Callout", () => {
  it("defaults to the info tone", () => {
    expect(renderToStaticMarkup(<Callout>x</Callout>)).toContain("bg-blue-50");
  });

  it("renders each tone's background", () => {
    expect(renderToStaticMarkup(<Callout tone="neutral">x</Callout>)).toContain("bg-slate-50");
    expect(renderToStaticMarkup(<Callout tone="info">x</Callout>)).toContain("bg-blue-50");
    expect(renderToStaticMarkup(<Callout tone="positive">x</Callout>)).toContain("bg-emerald-50");
    expect(renderToStaticMarkup(<Callout tone="warn">x</Callout>)).toContain("bg-amber-50");
    expect(renderToStaticMarkup(<Callout tone="danger">x</Callout>)).toContain("bg-red-50");
  });

  it("renders a title as a font-semibold paragraph above the body", () => {
    const out = renderToStaticMarkup(
      <Callout title="Draft." tone="warn">
        Body text.
      </Callout>,
    );
    expect(out).toContain('<p class="font-semibold">Draft.</p>');
    expect(out).toContain('<div class="mt-1">Body text.</div>');
  });

  it("renders no title paragraph when there is no title", () => {
    const out = renderToStaticMarkup(<Callout>Body text.</Callout>);
    expect(out).not.toContain("<p");
    expect(out).toContain(">Body text.</div>");
  });
});
