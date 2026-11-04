import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Kbd } from "./Kbd.js";

describe("Kbd", () => {
  it("renders a kbd element with the key's children", () => {
    const out = renderToStaticMarkup(<Kbd>Esc</Kbd>);
    expect(out.startsWith("<kbd")).toBe(true);
    expect(out).toContain(">Esc</kbd>");
  });

  it("uses a current-colour border so it reads on filled and plain text", () => {
    const out = renderToStaticMarkup(<Kbd>k</Kbd>);
    expect(out).toContain("border-current/30");
    expect(out).toContain("font-mono");
  });

  it("is not aria-hidden by default, and passes other props through", () => {
    const plain = renderToStaticMarkup(<Kbd>k</Kbd>);
    expect(plain).not.toContain("aria-hidden");
    const hidden = renderToStaticMarkup(<Kbd aria-hidden="true">k</Kbd>);
    expect(hidden).toContain('aria-hidden="true"');
  });
});
