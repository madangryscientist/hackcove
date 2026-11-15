import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Field } from "./Field.js";
import { Select } from "./Select.js";

const ITEMS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];

describe("Select", () => {
  it("renders an option per item", () => {
    const out = renderToStaticMarkup(<Select items={ITEMS} />);
    expect(out.startsWith("<select")).toBe(true);
    expect(out).toContain('<option value="a">Alpha</option>');
    expect(out).toContain('<option value="b">Beta</option>');
  });

  it("carries the control look and px-3", () => {
    const out = renderToStaticMarkup(<Select items={ITEMS} />);
    expect(out).toContain("border-slate-300");
    expect(out).toContain("px-3");
  });

  it("passes value and disabled through", () => {
    const out = renderToStaticMarkup(
      <Select items={ITEMS} value="b" disabled onChange={() => {}} />,
    );
    expect(out).toContain('disabled=""');
    expect(out).toContain('<option value="b" selected="">Beta</option>');
  });

  it("passes defaultValue through", () => {
    const out = renderToStaticMarkup(<Select items={ITEMS} defaultValue="b" />);
    expect(out).toContain('<option value="b" selected="">Beta</option>');
  });

  it("is as wide as its choices on its own, and fills the row in a Field", () => {
    expect(renderToStaticMarkup(<Select items={ITEMS} />)).not.toContain("w-full");
    expect(
      renderToStaticMarkup(
        <Field label="Plan">
          <Select items={ITEMS} />
        </Field>,
      ),
    ).toContain("w-full");
  });
});
