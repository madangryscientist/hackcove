import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Select } from "./Select.js";

describe("Select", () => {
  it("renders its option children", () => {
    const out = renderToStaticMarkup(
      <Select>
        <option value="a">Alpha</option>
        <option value="b">Beta</option>
      </Select>,
    );
    expect(out.startsWith("<select")).toBe(true);
    expect(out).toContain('<option value="a">Alpha</option>');
    expect(out).toContain('<option value="b">Beta</option>');
  });

  it("carries the control look and px-3", () => {
    const out = renderToStaticMarkup(<Select />);
    expect(out).toContain("border-slate-300");
    expect(out).toContain("px-3");
  });

  it("passes value and disabled through", () => {
    const out = renderToStaticMarkup(
      <Select value="b" disabled onChange={() => {}}>
        <option value="a">Alpha</option>
        <option value="b">Beta</option>
      </Select>,
    );
    expect(out).toContain('disabled=""');
    expect(out).toContain('<option value="b" selected="">Beta</option>');
  });

  it("passes defaultValue through", () => {
    const out = renderToStaticMarkup(
      <Select defaultValue="b">
        <option value="a">Alpha</option>
        <option value="b">Beta</option>
      </Select>,
    );
    expect(out).toContain('<option value="b" selected="">Beta</option>');
  });
});
