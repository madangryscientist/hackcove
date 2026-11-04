import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FilterGroup } from "./FilterGroup.js";

describe("FilterGroup", () => {
  it("renders a fieldset with the legend text and the children", () => {
    const out = renderToStaticMarkup(
      <FilterGroup legend="Type of shop">
        <span>Charity</span>
      </FilterGroup>,
    );
    expect(out).toContain("<fieldset");
    expect(out).toContain("<legend");
    expect(out).toContain("Type of shop");
    expect(out).toContain("<span>Charity</span>");
  });
});
