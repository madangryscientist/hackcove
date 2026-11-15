// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { SortableItem, SortableList, SortableSection } from "./index.js";
import { render, screen, within } from "./render.harness.js";
import { dropOperation, moveOf } from "./SortableList.js";

const noop = () => undefined;

const queue = () =>
  render(
    <SortableList label="Queue" onReorder={noop}>
      <SortableSection id="urgent" title="Urgent">
        <SortableItem id="a" title="Alpha" />
        <SortableItem id="b" title="Bravo" />
        <SortableItem id="c" title="Charlie" />
      </SortableSection>
      <SortableSection id="high" title="High">
        <SortableItem id="d" title="Delta" />
      </SortableSection>
      <SortableSection id="low" title="Low" />
    </SortableList>,
  );

/** A section, found by the title its name starts with (the heading, count included, follows it). */
const section = (title: string) =>
  within(screen.getByRole("rowgroup", { name: new RegExp(`^${title} `) }));

/** A section's rows below its heading. */
const rowsOf = (title: string) =>
  section(title)
    .getAllByRole("row")
    .filter((row) => within(row).queryByRole("rowheader") === null);

function disabled(button: HTMLElement): boolean {
  expect(button).toBeInstanceOf(HTMLButtonElement);
  return button instanceof HTMLButtonElement && button.disabled;
}

describe("SortableList", () => {
  it("is a grid named by its label", () => {
    queue();
    expect(screen.getByRole("grid", { name: "Queue" })).not.toBeNull();
  });

  it("each heading's count is its number of items, the empty section's placeholder not counted", () => {
    queue();
    const counts = ["Urgent", "High", "Low"].map(
      (title) => within(section(title).getByRole("rowheader")).getByText(/^\d+$/).textContent,
    );
    expect(counts).toEqual(["3", "1", "0"]);
  });

  it("ends a section with items with an empty, disabled tail row", () => {
    queue();
    const rows = rowsOf("High");
    expect(rows.map((row) => row.getAttribute("aria-label"))).toEqual(["Delta", "End of High"]);
    const tail = section("High").getByRole("row", { name: "End of High" });
    expect(tail.textContent).toBe("");
    expect(tail.getAttribute("aria-disabled")).toBe("true");
  });

  it("keeps a section and an item with the same id apart", () => {
    render(
      <SortableList label="Queue" onReorder={noop}>
        <SortableSection id="1" title="One">
          <SortableItem id="1" title="Ticket one" />
        </SortableSection>
      </SortableList>,
    );
    expect(section("One").getByRole("row", { name: "Ticket one" }).textContent).toBe("Ticket one");
  });

  it("names each handle Reorder <title>", () => {
    queue();
    const names = screen
      .getAllByRole("button", { name: /^Reorder / })
      .map((button) => button.getAttribute("aria-label"));
    expect(names).toEqual(["Reorder Alpha", "Reorder Bravo", "Reorder Charlie", "Reorder Delta"]);
  });

  it("shows the empty section a Drop here row that is disabled and never a tab stop", () => {
    queue();
    expect(rowsOf("Low")).toHaveLength(1);
    const placeholder = section("Low").getByRole("row", { name: "Drop here" });
    expect(placeholder.textContent).toBe("Drop here");
    expect(placeholder.getAttribute("aria-disabled")).toBe("true");
    expect(placeholder.hasAttribute("tabindex")).toBe(false);
    expect(disabled(within(placeholder).getByRole("button"))).toBe(true);
  });

  it("refuses a drop on a row's centre or on the list, and takes one before or after a row", () => {
    expect(dropOperation({ type: "item", key: "a", dropPosition: "on" })).toBe("cancel");
    expect(dropOperation({ type: "root" })).toBe("cancel");
    expect(dropOperation({ type: "item", key: "a", dropPosition: "before" })).toBe("move");
    expect(dropOperation({ type: "item", key: "a", dropPosition: "after" })).toBe("move");
  });

  it("reports the section and the neighbour of a move, the end of a section as after its last item, and no target for a drop into an empty section", () => {
    const places = new Map([
      ["a", { section: "urgent", title: "Alpha" }],
      ["d", { section: "high", title: "Delta" }],
      ["end-high", { section: "high", title: "", tail: ["d"] }],
      ["empty", { section: "low", title: "", tail: [] }],
    ]);
    expect(moveOf(places, ["a"], { type: "item", key: "d", dropPosition: "before" })).toEqual({
      id: "a",
      section: "high",
      target: { id: "d", position: "before" },
    });
    expect(moveOf(places, ["a"], { type: "item", key: "empty", dropPosition: "after" })).toEqual({
      id: "a",
      section: "low",
    });
    expect(
      moveOf(places, ["a"], { type: "item", key: "end-high", dropPosition: "before" }),
    ).toEqual({ id: "a", section: "high", target: { id: "d", position: "after" } });
    expect(
      moveOf(places, ["d"], { type: "item", key: "end-high", dropPosition: "before" }),
    ).toEqual({ id: "d", section: "high" });
    expect(moveOf(places, ["a"], { type: "item", key: "d", dropPosition: "on" })).toBeNull();
    expect(moveOf(places, ["a"], { type: "item", key: "a", dropPosition: "after" })).toBeNull();
  });

  it("a list with no sections reports moves with no section", () => {
    const places = new Map([["b", { title: "Bravo" }]]);
    expect(moveOf(places, ["a"], { type: "item", key: "b", dropPosition: "after" })).toEqual({
      id: "a",
      target: { id: "b", position: "after" },
    });
  });
});
