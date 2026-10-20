import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Card, Empty, Pill, groupByEpic } from "./ui.js";

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

  it("returns nothing for no items", () => {
    expect(groupByEpic([], () => null)).toEqual([]);
  });
});

describe("Pill", () => {
  it("defaults to the slate tone and takes a named tone", () => {
    expect(renderToStaticMarkup(<Pill>x</Pill>)).toContain("bg-slate-100");
    expect(renderToStaticMarkup(<Pill tone="red">x</Pill>)).toContain("text-red-900");
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
});

describe("Empty", () => {
  it("renders muted text", () => {
    expect(renderToStaticMarkup(<Empty>none</Empty>)).toContain("text-slate-400");
  });
});
