import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Divider } from "./Divider.js";

describe("Divider", () => {
  it("renders an hr with the line colour on its top border", () => {
    const out = renderToStaticMarkup(<Divider />);
    expect(out.startsWith("<hr")).toBe(true);
    expect(out).toContain('class="border-t border-slate-200/70"');
  });

  it("forwards props", () => {
    const out = renderToStaticMarkup(<Divider aria-hidden="true" />);
    expect(out).toContain('aria-hidden="true"');
  });
});
