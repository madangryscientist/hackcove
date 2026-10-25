import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Card, Pill, groupByEpic } from "./ui.js";

describe("groupByEpic", () => {
  it("orders real epics by ref and puts 'no epic' last", () => {
    const items = [
      { id: 1, epic: null },
      { id: 2, epic: "b" },
      { id: 3, epic: "a" },
      { id: 4, epic: "b" },
    ];
    const groups = groupByEpic(items, (i) => i.epic);
    expect(groups.map(([epic]) => epic)).toEqual(["a", "b", null]);
    expect(groups[1]?.[1].map((i) => i.id)).toEqual([2, 4]);
  });
});

describe("Pill", () => {
  it("defaults to the slate tone and takes a named tone", () => {
    expect(renderToStaticMarkup(<Pill>x</Pill>)).toContain("bg-slate-100");
    expect(renderToStaticMarkup(<Pill tone="red">x</Pill>)).toContain("text-red-900");
  });

  it("renders the same markup as before when dot is off", () => {
    expect(renderToStaticMarkup(<Pill tone="amber">x</Pill>)).toBe(
      '<span class="rounded-md px-1.5 py-0.5 text-xs font-medium bg-amber-50 text-amber-700">x</span>',
    );
  });

  it("takes the violet and sky tones", () => {
    expect(renderToStaticMarkup(<Pill tone="violet">x</Pill>)).toContain(
      "bg-violet-50 text-violet-700",
    );
    expect(renderToStaticMarkup(<Pill tone="sky">x</Pill>)).toContain("bg-sky-50 text-sky-700");
  });

  it("swaps rounded-md for rounded-full when round is on", () => {
    const markup = renderToStaticMarkup(<Pill round>x</Pill>);
    expect(markup).toContain("rounded-full");
    expect(markup).not.toContain("rounded-md");
  });

  it("adds a leading dot in the text colour when dot is on", () => {
    const markup = renderToStaticMarkup(
      <Pill tone="amber" dot>
        x
      </Pill>,
    );
    expect(markup).toContain("bg-current");
    expect(markup).toContain("inline-flex");
  });
});

describe("Card", () => {
  it("shows the title and count only when given", () => {
    const bare = renderToStaticMarkup(<Card>body</Card>);
    expect(bare).not.toContain("<h2");
    const titled = renderToStaticMarkup(
      <Card title="Open" count={0}>
        body
      </Card>,
    );
    expect(titled).toContain(">Open</h2>");
    expect(titled).toContain(">0</span>");
  });

  it("renders a section by default and the chosen element with as", () => {
    expect(renderToStaticMarkup(<Card>body</Card>)).toContain("<section");
    expect(renderToStaticMarkup(<Card as="article">body</Card>)).toContain("<article");
  });

  it("appends className after the built-in classes", () => {
    expect(renderToStaticMarkup(<Card className="mt-4">body</Card>)).toContain(
      'class="rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm mt-4"',
    );
  });

  it("renders the same markup as before when as and className are off", () => {
    expect(renderToStaticMarkup(<Card>body</Card>)).toBe(
      '<section class="rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm">body</section>',
    );
  });

  it("flush drops the padding and clips the corners", () => {
    const out = renderToStaticMarkup(<Card flush>table</Card>);
    expect(out).toContain("overflow-hidden");
    expect(out).not.toContain("p-5");
    expect(out).toContain("shadow-sm");
  });

  it("bar puts the title, count and actions in a tinted strip over a padded body", () => {
    const out = renderToStaticMarkup(
      <Card bar title="Open" count={3} actions={<a href="/all">All</a>}>
        body
      </Card>,
    );
    expect(out).toContain("bg-slate-50");
    expect(out).toContain("border-b");
    expect(out).toContain(">Open</h2>");
    expect(out).toContain('<a href="/all">All</a>');
    expect(out).toContain('<div class="p-5">body</div>');
  });

  it("bar with flush leaves the body unpadded, and no strip without a title or actions", () => {
    const flush = renderToStaticMarkup(
      <Card bar flush title="Open">
        body
      </Card>,
    );
    expect(flush).toContain("<div>body</div>");
    expect(renderToStaticMarkup(<Card bar>body</Card>)).not.toContain("bg-slate-50");
  });

  it("actions sit beside the title without bar", () => {
    const out = renderToStaticMarkup(
      <Card title="Bills" actions={<b>x</b>}>
        body
      </Card>,
    );
    expect(out).toContain("<b>x</b>");
    expect(out).not.toContain("bg-slate-50");
  });

  it("bar with no title or actions renders the plain padded card", () => {
    const out = renderToStaticMarkup(<Card bar>body</Card>);
    expect(out).toBe(renderToStaticMarkup(<Card>body</Card>));
  });

  it("dashed ignores flush and bar", () => {
    const out = renderToStaticMarkup(
      <Card dashed flush bar title="T">
        Nothing yet
      </Card>,
    );
    expect(out).toContain("p-8");
    expect(out).not.toContain("overflow-hidden");
    expect(out).not.toContain("bg-slate-50");
  });

  it("dashed is an unfilled, shadowless shell with centred muted text", () => {
    const out = renderToStaticMarkup(<Card dashed>Nothing yet</Card>);
    expect(out).toContain("border-dashed");
    expect(out).toContain("text-center");
    expect(out).not.toContain("shadow-sm");
    expect(out).not.toContain("bg-white");
  });
});
