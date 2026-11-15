// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen, within } from "./render.harness.js";
import { Legend, StackedBar, type StackedSegment } from "./StackedBar.js";

const parts: StackedSegment[] = [
  { label: "Changed", value: 20, tone: "warn" },
  { label: "New", value: 10, tone: "info" },
  { label: "Removed", value: 10, tone: "danger" },
  { label: "Same", value: 60, tone: "muted" },
];

const follows = (a: Node, b: Node) =>
  a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING;

describe("StackedBar", () => {
  it("is an image naming every part and its share, in order", () => {
    render(<StackedBar segments={parts} label="Snapshot" />);
    expect(
      screen.getByRole("img", { name: "Snapshot: Changed 20%, New 10%, Removed 10%, Same 60%" }),
    ).not.toBeNull();
  });

  it("names every tone's part, neutral and violet included", () => {
    render(
      <StackedBar
        segments={[
          { label: "Unmeasured", value: 1, tone: "neutral" },
          { label: "Same", value: 1, tone: "muted" },
          { label: "Overlay", value: 1, tone: "violet" },
        ]}
        label="x"
      />,
    );
    expect(
      screen.getByRole("img", { name: "x: Unmeasured 33%, Same 33%, Overlay 33%" }),
    ).not.toBeNull();
  });

  it("announces a zero part as 0%", () => {
    render(
      <StackedBar
        segments={[
          { label: "A", value: 0, tone: "warn" },
          { label: "B", value: 5, tone: "info" },
        ]}
        label="x"
      />,
    );
    expect(screen.getByRole("img", { name: "x: A 0%, B 100%" })).not.toBeNull();
  });

  it("announces 0% when every part is zero", () => {
    render(<StackedBar segments={[{ label: "A", value: 0, tone: "warn" }]} label="x" />);
    expect(screen.getByRole("img", { name: "x: A 0%" })).not.toBeNull();
  });

  it("draws no key unless asked", () => {
    render(<StackedBar segments={parts} label="x" />);
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("legend draws the key after the bar, outside the image, with each part's value", () => {
    render(<StackedBar segments={parts} label="x" legend />);
    const bar = screen.getByRole("img");
    const key = screen.getByRole("list");
    expect(follows(bar, key)).toBeTruthy();
    expect(bar.contains(key)).toBe(false);
    expect(
      within(key)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["Changed20", "New10", "Removed10", "Same60"]);
  });
});

describe("Legend", () => {
  it("is a list of each label with its optional detail after it", () => {
    render(
      <Legend
        items={[
          { label: "Changed", tone: "warn", detail: 3 },
          { label: "Same", tone: "muted" },
        ]}
      />,
    );
    const items = screen.getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual(["Changed3", "Same"]);
    expect(follows(screen.getByText("Changed"), screen.getByText("3"))).toBeTruthy();
  });
});
