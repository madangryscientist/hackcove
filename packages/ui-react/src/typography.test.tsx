import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  Caption,
  Overline,
  PageHeading,
  SectionHeading,
  SubsectionHeading,
  Text,
  type TextTone,
} from "./typography.js";

describe("typography", () => {
  it("renders the semantic default element and pinned classes", () => {
    const out = renderToStaticMarkup(<PageHeading>Status</PageHeading>);
    expect(out).toMatch(/^<h1 /);
    expect(out).toContain("text-2xl/8 font-semibold");
    expect(out).toContain("text-slate-900");
  });

  it("makes inline roles spans, and `as` turns them into blocks", () => {
    expect(renderToStaticMarkup(<Text>x</Text>)).toMatch(/^<span /);
    expect(renderToStaticMarkup(<Text as="p">x</Text>)).toMatch(/^<p /);
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

  it("SubsectionHeading `truncate` cuts a long title to one line and keeps the text as its title", () => {
    const out = renderToStaticMarkup(
      <SubsectionHeading truncate>A very long section title</SubsectionHeading>,
    );
    expect(out).toContain("truncate");
    expect(out).toContain('title="A very long section title"');
    expect(out).not.toContain("truncate=");
    expect(renderToStaticMarkup(<SubsectionHeading>x</SubsectionHeading>)).not.toContain(
      "truncate",
    );
  });

  it("SubsectionHeading `size` steps the scale, and md is the default", () => {
    const plain = renderToStaticMarkup(<SubsectionHeading>x</SubsectionHeading>);
    expect(plain).toContain('class="text-base/6 font-semibold text-slate-900"');
    expect(renderToStaticMarkup(<SubsectionHeading size="md">x</SubsectionHeading>)).toBe(plain);
    expect(renderToStaticMarkup(<SubsectionHeading size="sm">x</SubsectionHeading>)).toContain(
      "text-sm/5 font-semibold",
    );
    const lg = renderToStaticMarkup(<SubsectionHeading size="lg">x</SubsectionHeading>);
    expect(lg).toContain("text-lg/7 font-semibold");
    expect(lg).not.toContain("size=");
  });

  it("Text stops at a readable 72ch line length, as a paragraph or inline", () => {
    expect(renderToStaticMarkup(<Text as="p">x</Text>)).toContain("max-w-[72ch]");
    expect(renderToStaticMarkup(<Text>x</Text>)).toContain("max-w-[72ch]");
  });

  it("Text `preserveNewlines` keeps a newline as a line break and is opt-in", () => {
    const out = renderToStaticMarkup(
      <Text as="p" preserveNewlines>
        {"line one\nline two"}
      </Text>,
    );
    expect(out).toContain("whitespace-pre-line");
    expect(out).toContain("line one\nline two");
    expect(out).not.toContain("preserve");
    expect(renderToStaticMarkup(<Text>x</Text>)).not.toContain("whitespace-pre-line");
  });

  it("Text `strong` is font-medium in the primary ink, and color and tone still win", () => {
    const strong = renderToStaticMarkup(<Text strong>x</Text>);
    expect(strong).toContain("text-sm/5 font-medium text-slate-900");
    expect(strong).not.toContain("font-normal");
    expect(strong).not.toContain("strong=");
    expect(renderToStaticMarkup(<Text>x</Text>)).toContain("text-sm/5 font-normal text-slate-600");
    expect(
      renderToStaticMarkup(
        <Text strong color="muted">
          x
        </Text>,
      ),
    ).toContain("font-medium text-slate-400");
    expect(
      renderToStaticMarkup(
        <Text strong tone="danger">
          x
        </Text>,
      ),
    ).toContain("font-medium text-red-700");
  });
});

describe("typography inline roles: tone, numeric, mono, truncate", () => {
  const roles = [
    ["Text", Text],
    ["Text strong", (props: Parameters<typeof Text>[0]) => <Text strong {...props} />],
    ["Caption", Caption],
    ["Overline", Overline],
  ] as const;

  it.each(roles)("%s maps each tone to the cell tone's text utility", (_name, Role) => {
    const cases: Array<[TextTone, string]> = [
      ["muted", "text-slate-500"],
      ["positive", "text-emerald-700"],
      ["warn", "text-amber-700"],
      ["danger", "text-red-700"],
      ["info", "text-blue-700"],
    ];
    for (const [tone, utility] of cases) {
      const out = renderToStaticMarkup(<Role tone={tone}>x</Role>);
      expect(out).toContain(utility);
      expect(out).not.toContain("tone=");
    }
  });

  it("a tone replaces the role's colour, and wins over `color`", () => {
    const out = renderToStaticMarkup(
      <Text tone="danger" color="brand">
        x
      </Text>,
    );
    expect(out).toContain("text-red-700");
    expect(out).not.toContain("text-violet-600");
    expect(out).not.toContain("text-slate-600");
    expect(renderToStaticMarkup(<Text>x</Text>)).toContain("text-slate-600");
  });

  it.each(roles)("%s `numeric` and `mono` are opt-in and not forwarded", (_name, Role) => {
    const plain = renderToStaticMarkup(<Role>1</Role>);
    expect(plain).not.toContain("tabular-nums");
    expect(plain).not.toContain("font-mono");
    const numeric = renderToStaticMarkup(<Role numeric>1</Role>);
    expect(numeric).toContain("tabular-nums");
    expect(numeric).not.toContain("numeric=");
    const mono = renderToStaticMarkup(<Role mono>1</Role>);
    expect(mono).toContain("font-mono");
    expect(mono).not.toContain("mono=");
  });

  it.each(roles)(
    "%s `truncate` cuts to one line and keeps the full text as the title",
    (_name, Role) => {
      const out = renderToStaticMarkup(<Role truncate>A long file name.txt</Role>);
      expect(out).toContain("truncate");
      expect(out).toContain("inline-block");
      expect(out).toContain('title="A long file name.txt"');
      expect(out).not.toContain("truncate=");
      expect(renderToStaticMarkup(<Role>x</Role>)).not.toContain("truncate");
      expect(renderToStaticMarkup(<Role>x</Role>)).not.toContain("title=");
    },
  );

  it("truncate keeps a title the caller passed, and adds none for non-text children", () => {
    expect(
      renderToStaticMarkup(
        <Caption truncate title="Own title">
          text
        </Caption>,
      ),
    ).toContain('title="Own title"');
    expect(
      renderToStaticMarkup(
        <Caption truncate>
          <b>bold</b>
        </Caption>,
      ),
    ).not.toContain("title=");
  });

  it("works with `as` and Text's other props", () => {
    const out = renderToStaticMarkup(
      <Text as="p" tone="positive" preserveNewlines mono>
        Saved.
      </Text>,
    );
    expect(out).toMatch(/^<p /);
    expect(out).toContain("text-emerald-700");
    expect(out).toContain("whitespace-pre-line");
    expect(out).toContain("font-mono");
  });
});
