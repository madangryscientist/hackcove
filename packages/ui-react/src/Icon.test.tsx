import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Icon } from "./Icon.js";

const svg = <svg viewBox="0 0 20 20" />;

describe("Icon", () => {
  it("is decorative by default: hidden from assistive tech, no role", () => {
    const out = renderToStaticMarkup(<Icon>{svg}</Icon>);
    expect(out).toContain('aria-hidden="true"');
    expect(out).not.toContain("role=");
    expect(out).not.toContain("aria-label");
  });

  it("a `label` makes it an image with that name, and no longer hidden", () => {
    const out = renderToStaticMarkup(<Icon label="Flaky">{svg}</Icon>);
    expect(out).toContain('role="img"');
    expect(out).toContain('aria-label="Flaky"');
    expect(out).not.toContain("aria-hidden");
  });

  it("sizes the box sm 14px, md 16px (the default), lg 20px, and the svg fills it", () => {
    expect(renderToStaticMarkup(<Icon size="sm">{svg}</Icon>)).toContain("size-3.5");
    expect(renderToStaticMarkup(<Icon>{svg}</Icon>)).toContain("size-4");
    expect(renderToStaticMarkup(<Icon size="lg">{svg}</Icon>)).toContain("size-5");
    expect(renderToStaticMarkup(<Icon>{svg}</Icon>)).toContain("[&amp;&gt;svg]:size-full");
  });

  it("inherits the text colour by default; a tone takes the text tone's colour", () => {
    expect(renderToStaticMarkup(<Icon>{svg}</Icon>)).not.toMatch(/text-/);
    expect(renderToStaticMarkup(<Icon tone="muted">{svg}</Icon>)).toContain("text-slate-500");
    expect(renderToStaticMarkup(<Icon tone="warn">{svg}</Icon>)).toContain("text-amber-700");
    expect(renderToStaticMarkup(<Icon tone="danger">{svg}</Icon>)).toContain("text-red-700");
  });
});
