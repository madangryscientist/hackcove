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
});
