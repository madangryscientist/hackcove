// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { mount, unmount } from "./dom.harness.js";
import { SortableItem, SortableList, SortableSection } from "./index.js";
import { dropOperation, moveOf } from "./SortableList.js";

afterEach(unmount);

const noop = () => undefined;

const queue = () =>
  mount(
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

const section = (container: HTMLElement, name: string) => {
  const group = container.querySelector(`[role="rowgroup"][aria-label="${name}"]`);
  if (!group) throw new Error(`no section ${name}`);
  return group;
};

describe("SortableList", () => {
  it("each heading's count is its number of items, the empty section's placeholder not counted", () => {
    const container = queue();
    const counts = ["Urgent", "High", "Low"].map(
      (name) => section(container, name).querySelector(".tabular-nums")?.textContent,
    );
    expect(counts).toEqual(["3", "1", "0"]);
  });

  it("ends a section with items with an empty, disabled tail row", () => {
    const container = queue();
    const rows = [...section(container, "High").querySelectorAll('[role="row"][data-key]')];
    expect(rows.map((r) => r.getAttribute("aria-label"))).toEqual(["Delta", "End of High"]);
    expect(rows[1]?.textContent).toBe("");
    expect(rows[1]?.getAttribute("aria-disabled")).toBe("true");
  });

  it("keeps a section and an item with the same id apart", () => {
    const container = mount(
      <SortableList label="Queue" onReorder={noop}>
        <SortableSection id="1" title="One">
          <SortableItem id="1" title="Ticket one" />
        </SortableSection>
      </SortableList>,
    );
    expect(section(container, "One").querySelector('[data-key="1"]')?.textContent).toBe(
      "Ticket one",
    );
  });

  it("names each handle Reorder <title>", () => {
    const container = queue();
    const names = [...container.querySelectorAll('[slot="drag"]:not([disabled])')].map((b) =>
      b.getAttribute("aria-label"),
    );
    expect(names).toEqual(["Reorder Alpha", "Reorder Bravo", "Reorder Charlie", "Reorder Delta"]);
  });

  it("shows the empty section a Drop here row that is disabled and never a tab stop", () => {
    const container = queue();
    const placeholder = section(container, "Low").querySelector('[role="row"][data-key]');
    expect(section(container, "Low").querySelectorAll('[role="row"][data-key]')).toHaveLength(1);
    expect(placeholder?.textContent).toBe("Drop here");
    expect(placeholder?.getAttribute("aria-disabled")).toBe("true");
    expect(placeholder?.hasAttribute("tabindex")).toBe(false);
    expect(placeholder?.querySelector('[slot="drag"]')?.hasAttribute("disabled")).toBe(true);
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
