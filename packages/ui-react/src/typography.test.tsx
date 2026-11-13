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
    expect(out).toContain("text-3xl/9 font-bold");
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
    expect(out).toContain('class="text-base/6 font-semibold scroll-mt-28 text-slate-900"');
    expect(out).toContain('id="s1"');
  });

  it("gives a heading with an id the scroll margin that clears the sticky header, and no other one it", () => {
    expect(renderToStaticMarkup(<SectionHeading id="s1">x</SectionHeading>)).toContain(
      "scroll-mt-28",
    );
    expect(renderToStaticMarkup(<SectionHeading>x</SectionHeading>)).not.toContain("scroll-mt-28");
    expect(
      renderToStaticMarkup(
        <SectionHeading id="s1" description="More">
          x
        </SectionHeading>,
      ),
    ).toContain("scroll-mt-28");
    expect(
      renderToStaticMarkup(<SectionHeading id="s1">x</SectionHeading>).match(/scroll-mt-28/g),
    ).toHaveLength(1);
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

describe("typography options: align, italic, breakWords, minWidth", () => {
  it.each([
    ["Text", (p: { align?: "start" | "center" | "end" }) => <Text {...p}>x</Text>],
    ["Caption", (p: { align?: "start" | "center" | "end" }) => <Caption {...p}>x</Caption>],
    ["Overline", (p: { align?: "start" | "center" | "end" }) => <Overline {...p}>x</Overline>],
  ])("%s `align` sets the text alignment and makes the run block-level", (_name, Role) => {
    expect(renderToStaticMarkup(Role({ align: "start" }))).toContain("text-start");
    expect(renderToStaticMarkup(Role({ align: "center" }))).toContain("text-center");
    const end = renderToStaticMarkup(Role({ align: "end" }));
    expect(end).toContain("text-end");
    expect(end).toMatch(/class="[^"]*\bblock\b/);
    expect(end).not.toContain("align=");
    const plain = renderToStaticMarkup(Role({}));
    expect(plain).not.toMatch(/text-(start|center|end)/);
    expect(plain).not.toMatch(/\bblock\b/);
  });

  it("`align` with `truncate` is a block that clips, not an inline box", () => {
    const out = renderToStaticMarkup(
      <Overline align="end" truncate>
        A long label
      </Overline>,
    );
    expect(out).toContain("block");
    expect(out).not.toContain("inline-block");
    expect(out).toContain("truncate");
    expect(out).toContain("text-end");
  });

  it.each([
    ["Text", Text],
    ["Caption", Caption],
  ])("%s `italic` slants the run and is opt-in", (_name, Role) => {
    expect(renderToStaticMarkup(<Role italic>hint</Role>)).toContain('class="');
    expect(renderToStaticMarkup(<Role italic>hint</Role>)).toMatch(/class="[^"]*\bitalic\b/);
    expect(renderToStaticMarkup(<Role italic>hint</Role>)).not.toContain("italic=");
    expect(renderToStaticMarkup(<Role>hint</Role>)).not.toMatch(/\bitalic\b/);
  });

  it.each([
    ["Text", Text],
    ["Caption", Caption],
  ])("%s `breakWords` breaks long strings and is opt-in", (_name, Role) => {
    const out = renderToStaticMarkup(<Role breakWords>https://example.com/a/very/long/path</Role>);
    expect(out).toMatch(/class="[^"]*\bbreak-words\b/);
    expect(out).not.toContain("breakWords");
    expect(renderToStaticMarkup(<Role>x</Role>)).not.toContain("break-words");
  });

  it("Text `italic` and `breakWords` keep the strong face and the colour", () => {
    const out = renderToStaticMarkup(
      <Text strong italic breakWords>
        x
      </Text>,
    );
    expect(out).toMatch(/\bfont-medium\b/);
    expect(out).toContain("text-slate-900");
    expect(out).toMatch(/\bitalic\b/);
    expect(out).toMatch(/\bbreak-words\b/);
  });

  it('Text `minWidth="amount"` fixes a width, right-aligns and lines figures up', () => {
    const out = renderToStaticMarkup(
      <Text strong minWidth="amount" numeric>
        1,111.11
      </Text>,
    );
    expect(out).toContain("inline-block min-w-24 text-end");
    expect(out.match(/tabular-nums/g)).toHaveLength(1);
    expect(out).toMatch(/\bfont-medium\b/);
    expect(out).toContain("text-slate-900");
    expect(renderToStaticMarkup(<Text minWidth="amount">1</Text>)).toContain("tabular-nums");
    expect(out).not.toContain("minWidth");
    expect(renderToStaticMarkup(<Text>x</Text>)).not.toContain("min-w-24");
  });
});

describe("SectionHeading description", () => {
  it("puts a muted paragraph under the heading, outside the h2", () => {
    const out = renderToStaticMarkup(
      <SectionHeading id="s1" description="What you owe each month.">
        Plan
      </SectionHeading>,
    );
    expect(out).toContain(
      '<h2 id="s1" class="text-base/6 font-semibold scroll-mt-28 text-slate-900">Plan</h2>',
    );
    expect(out).toContain("<p ");
    expect(out).toContain(">What you owe each month.</p>");
    expect(out).toContain("text-slate-500");
    expect(out).not.toContain("description=");
  });

  it("moves the rule under the description", () => {
    const out = renderToStaticMarkup(
      <SectionHeading rule description="More">
        Plan
      </SectionHeading>,
    );
    expect(out.startsWith('<div class="flex flex-col gap-1 mb-4 border-b')).toBe(true);
    expect(out.match(/border-b/g)).toHaveLength(1);
  });

  it("is the bare heading without a description", () => {
    const out = renderToStaticMarkup(<SectionHeading>Plan</SectionHeading>);
    expect(out.startsWith("<h2")).toBe(true);
    expect(renderToStaticMarkup(<SectionHeading description={false}>Plan</SectionHeading>)).toBe(
      out,
    );
  });
});
