import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Checkbox } from "./Checkbox.js";

describe("Checkbox", () => {
  it("renders a native checkbox next to its label text", () => {
    const out = renderToStaticMarkup(<Checkbox label="Open now" />);
    expect(out).toContain('type="checkbox"');
    expect(out).toContain("Open now");
  });

  it("passes defaultChecked through as checked", () => {
    const out = renderToStaticMarkup(<Checkbox label="Open now" defaultChecked />);
    expect(out).toContain('checked=""');
  });

  it("puts disabled on the input, not the label", () => {
    const out = renderToStaticMarkup(<Checkbox label="Open now" disabled />);
    expect(out).toMatch(/<input[^>]*disabled/);
    expect(out.match(/<label[^>]*disabled/)).toBeNull();
  });

  it("puts className on the label", () => {
    const out = renderToStaticMarkup(<Checkbox label="Open now" className="mt-2" />);
    expect(out).toMatch(/<label[^>]*class="[^"]*mt-2/);
    expect(out).not.toMatch(/<input[^>]*mt-2/);
  });
});
