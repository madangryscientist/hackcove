import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Icon } from "./Icon.js";
import { ICON_NAMES, iconGlyph } from "./icons.js";

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

  it("has a feature size, 32px, for an icon that stands for an idea alone", () => {
    expect(renderToStaticMarkup(<Icon size="feature">{svg}</Icon>)).toContain("size-8");
  });
});

describe("Icon name", () => {
  it("draws the named icon in the box, hidden from assistive tech unless labelled", () => {
    const out = renderToStaticMarkup(<Icon name="diff" size="feature" />);
    expect(out).toContain("size-8");
    expect(out).toContain('aria-hidden="true"');
    expect(out).toContain("<svg");
    expect(renderToStaticMarkup(<Icon name="privacy" label="Private" />)).toContain(
      'aria-label="Private"',
    );
  });

  it("covers the product ideas, each named for the idea and not for one product", () => {
    for (const idea of ["diff", "baseline", "review", "ci", "self-host", "privacy"]) {
      expect(ICON_NAMES).toContain(idea);
    }
    for (const name of ICON_NAMES) expect(name).toMatch(/^[a-z]+(-[a-z]+)*$/);
  });

  it.each(ICON_NAMES)(
    "%s is drawn on the shared grammar: one 24 grid, an outline of 1.5, round caps and joins, nothing filled",
    (name) => {
      const out = renderToStaticMarkup(iconGlyph(name));
      const root = out.match(/^<svg([^>]*)>/)?.[1] ?? "";
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
      const out = renderToStaticMarkup(iconGlyph(name));
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
    const drawn = ICON_NAMES.map((name) => renderToStaticMarkup(iconGlyph(name)));
    expect(new Set(drawn).size).toBe(ICON_NAMES.length);
  });
});
