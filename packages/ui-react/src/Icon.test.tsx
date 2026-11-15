// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server"; // markup read as data, below
import { describe, expect, it } from "vitest";
import { Icon } from "./Icon.js";
import { ICON_NAMES, iconGlyph } from "./icons.js";
import { render, screen } from "./render.harness.js";

const svg = <svg viewBox="0 0 20 20" />;

describe("Icon", () => {
  it("is decorative by default: hidden from assistive tech, no image role", () => {
    // A decorative icon has no accessible name to find it by, which is the point: a test id.
    render(<Icon data-testid="icon">{svg}</Icon>);
    expect(screen.getByTestId("icon").getAttribute("aria-hidden")).toBe("true");
    expect(screen.queryByRole("img", { hidden: true })).toBeNull();
  });

  it("a `label` makes it an image with that name, no longer hidden", () => {
    render(<Icon label="Flaky">{svg}</Icon>);
    expect(screen.getByRole("img", { name: "Flaky" }).hasAttribute("aria-hidden")).toBe(false);
  });

  it("draws a named icon, decorative unless labelled", () => {
    // A decorative icon has no accessible name to find it by, which is the point: a test id.
    render(<Icon name="diff" size="feature" data-testid="icon" />);
    expect(screen.getByTestId("icon").getAttribute("aria-hidden")).toBe("true");
    expect(screen.queryByRole("img", { hidden: true })).toBeNull();
  });

  it("a named icon with a `label` is an image with that name", () => {
    render(<Icon name="privacy" label="Private" />);
    expect(screen.getByRole("img", { name: "Private" })).not.toBeNull();
  });
});

// The icon data is read as data here (each glyph's markup: its grammar, its ink box, one shape per
// icon), not searched for a look, so a server render is the right tool, as noLeak.test.tsx does.
describe("Icon name data", () => {
  it("covers the product ideas, each named for the idea and not for one product", () => {
    for (const idea of ["diff", "baseline", "review", "ci", "self-host", "privacy"]) {
      expect(ICON_NAMES).toContain(idea);
    }
    for (const name of ICON_NAMES) expect(name).toMatch(/^[a-z]+(-[a-z]+)*$/);
  });

  it.each(ICON_NAMES)(
    "%s is drawn on the shared grammar: one 24 grid, an outline of 1.5, round caps and joins, nothing filled",
    (name) => {
      const out = renderToStaticMarkup(iconGlyph(name)); // markup read as data
      const root = out.slice(0, out.indexOf(">"));
      expect(root.startsWith("<svg")).toBe(true);
      expect(root).toContain('viewBox="0 0 24 24"');
      expect(root).toContain('fill="none"');
      expect(root).toContain('stroke="currentColor"');
      expect(root).toContain('stroke-width="1.5"');
      expect(root).toContain('stroke-linecap="round"');
      expect(root).toContain('stroke-linejoin="round"');
      // The shapes inside carry no paint of their own, so none can drift from the grammar.
      const inner = out.slice(out.indexOf(">") + 1);
      expect(inner).toMatch(/^(<(path|circle|rect)\b[^>]*><\/\2>)+<\/svg>$/);
      expect(inner).not.toMatch(/\b(fill|stroke|stroke-[a-z]+|style|class)=/);
    },
  );

  it.each(ICON_NAMES)(
    "%s keeps its circles and rects inside the grid's padding, ink in 2..22",
    (name) => {
      const out = renderToStaticMarkup(iconGlyph(name)); // markup read as data
      // A stroke reaches half its width (0.75) past the shape.
      const reach = 0.75;
      const inside = (low: number, high: number) => {
        expect(low - reach).toBeGreaterThanOrEqual(1.99);
        expect(high + reach).toBeLessThanOrEqual(22.01);
      };
      for (const [, x, y, r] of out.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/g)) {
        inside(Number(x) - Number(r) + reach, Number(x) + Number(r) - reach);
        inside(Number(y) - Number(r) + reach, Number(y) + Number(r) - reach);
      }
      for (const [, x, y, w, h] of out.matchAll(
        /<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/g,
      )) {
        inside(Number(x), Number(x) + Number(w));
        inside(Number(y), Number(y) + Number(h));
      }
    },
  );

  it("gives every icon a shape of its own", () => {
    const drawn = ICON_NAMES.map((name) => renderToStaticMarkup(iconGlyph(name))); // markup read as data
    expect(new Set(drawn).size).toBe(ICON_NAMES.length);
  });
});
