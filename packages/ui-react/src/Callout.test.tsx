import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Callout } from "./Callout.js";
import { TextLink } from "./TextLink.js";

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

  it("puts actions at the end of the row", () => {
    const out = renderToStaticMarkup(
      <Callout title="Heads up." actions={<button type="button">Fix</button>}>
        Body.
      </Callout>,
    );
    expect(out).toContain('<div class="min-w-0"><p class="font-semibold">Heads up.</p>');
    expect(out).toContain('<div class="flex shrink-0 items-center gap-2"><button');
  });

  it("renders the same markup as before with no actions", () => {
    expect(renderToStaticMarkup(<Callout>Body.</Callout>)).toBe(
      '<div class="rounded-xl border p-4 text-sm border-blue-200 bg-blue-50 text-blue-800">Body.</div>',
    );
  });

  it("banner is a flat strip with a bottom border and no radius", () => {
    const out = renderToStaticMarkup(
      <Callout banner tone="warn">
        Body.
      </Callout>,
    );
    expect(out).toContain("border-b");
    expect(out).toContain("border-amber-200");
    expect(out).not.toContain("rounded");
  });
});

describe("Callout link", () => {
  it("is relative, so a stretched link in actions covers the whole callout", () => {
    const out = renderToStaticMarkup(
      <Callout
        title="3 due."
        actions={
          <TextLink stretch href="/bills">
            Review
          </TextLink>
        }
      >
        Sort them.
      </Callout>,
    );
    expect(out).toMatch(/^<div class="relative /);
    expect(out.match(/<a /g)).toHaveLength(1);
    expect(out).toContain("after:absolute after:inset-0");
  });
});
