import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Body, Caption, PageHeading, SectionHeading, SubsectionHeading } from "./typography.js";

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

  it("forwards element props", () => {
    const out = renderToStaticMarkup(<SectionHeading id="s1">x</SectionHeading>);
    expect(out).toContain('class="text-base/6 font-semibold text-slate-900"');
    expect(out).toContain('id="s1"');
  });

  it("SectionHeading `rule` builds in the hairline and its spacing, and is not forwarded", () => {
    const out = renderToStaticMarkup(<SectionHeading rule>Experience</SectionHeading>);
    expect(out).toContain(
      'class="mb-4 border-b border-slate-200/70 pb-2 text-base/6 font-semibold text-slate-900"',
    );
    expect(out).not.toContain("rule");
    expect(renderToStaticMarkup(<SectionHeading>x</SectionHeading>)).not.toContain("border-b");
  });

  it("SubsectionHeading `size` steps the scale, and sm is today's default", () => {
    const plain = renderToStaticMarkup(<SubsectionHeading>x</SubsectionHeading>);
    expect(plain).toContain('class="text-sm/5 font-semibold text-slate-900"');
    expect(renderToStaticMarkup(<SubsectionHeading size="sm">x</SubsectionHeading>)).toBe(plain);
    expect(renderToStaticMarkup(<SubsectionHeading size="base">x</SubsectionHeading>)).toContain(
      "text-base/6 font-bold",
    );
    const lg = renderToStaticMarkup(<SubsectionHeading size="lg">x</SubsectionHeading>);
    expect(lg).toContain("text-lg/7 font-semibold");
    expect(lg).not.toContain("size=");
  });

  it("Body stops at a readable 72ch line length, as a paragraph or inline", () => {
    expect(renderToStaticMarkup(<Body as="p">x</Body>)).toContain("max-w-[72ch]");
    expect(renderToStaticMarkup(<Body>x</Body>)).toContain("max-w-[72ch]");
  });

  it("Body `preserveNewlines` keeps a newline as a line break and is opt-in", () => {
    const out = renderToStaticMarkup(
      <Body as="p" preserveNewlines>
        {"line one\nline two"}
      </Body>,
    );
    expect(out).toContain("whitespace-pre-line");
    expect(out).toContain("line one\nline two");
    expect(out).not.toContain("preserve");
    expect(renderToStaticMarkup(<Body>x</Body>)).not.toContain("whitespace-pre-line");
  });
});
