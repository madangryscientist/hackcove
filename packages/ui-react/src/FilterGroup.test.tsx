// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { FilterGroup } from "./FilterGroup.js";
import { render, screen, within } from "./render.harness.js";

describe("FilterGroup", () => {
  it("is a group named by its legend, holding the children", () => {
    render(
      <FilterGroup legend="Type of shop">
        <span>Charity</span>
      </FilterGroup>,
    );
    const group = screen.getByRole("group", { name: "Type of shop" });
    expect(group.tagName).toBe("FIELDSET");
    expect(within(group).getByText("Charity")).not.toBeNull();
  });
});
