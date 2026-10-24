import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Divider } from "./Divider.js";

describe("Divider", () => {
  it("renders an hr with the line colour on its top border", () => {
    const out = renderToStaticMarkup(<Divider />);
    expect(out.startsWith("<hr")).toBe(true);
    expect(out).toContain('class="border-t border-slate-200/70"');
  });

  it("keeps caller classes after the pinned ones and forwards props", () => {
    const out = renderToStaticMarkup(<Divider className="mt-16" aria-hidden="true" />);
    expect(out).toContain('class="border-t border-slate-200/70 mt-16"');
    expect(out).toContain('aria-hidden="true"');
  });
});
