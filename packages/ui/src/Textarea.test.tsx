import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Textarea } from "./Textarea.js";

describe("Textarea", () => {
  it("defaults to three rows", () => {
    const out = renderToStaticMarkup(<Textarea />);
    expect(out.startsWith("<textarea")).toBe(true);
    expect(out).toContain('rows="3"');
  });

  it("lets the caller override rows", () => {
    const out = renderToStaticMarkup(<Textarea rows={6} />);
    expect(out).toContain('rows="6"');
    expect(out).not.toContain('rows="3"');
  });

  it("carries the control look and px-3", () => {
    const out = renderToStaticMarkup(<Textarea />);
    expect(out).toContain("border-slate-300");
    expect(out).toContain("px-3");
  });

  it("passes placeholder and maxLength through", () => {
    const out = renderToStaticMarkup(<Textarea placeholder="Notes" maxLength={500} />);
    expect(out).toContain('placeholder="Notes"');
    expect(out).toContain('maxLength="500"');
  });
});
