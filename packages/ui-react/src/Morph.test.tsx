import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Morph } from "./Morph.js";

const nameOf = (out: string): string => {
  const found = /data-morph="([^"]*)"/.exec(out)?.[1];
  if (found === undefined) throw new Error("no morph name");
  return found;
};

const render = (name: string, item: string | number) =>
  renderToStaticMarkup(
    <Morph name={name} item={item}>
      x
    </Morph>,
  );

describe("Morph", () => {
  it("renders its child inside an element named for the transition", () => {
    const out = render("shop", "abc");
    expect(out).toMatch(/<div data-morph="hc-morph-shop-abc"[^>]*>x<\/div>/);
  });

  it("names the element in a stylesheet that carries no colour", () => {
    const out = render("shop", "abc");
    expect(out).toContain(
      '[data-morph="hc-morph-shop-abc"]{view-transition-name:hc-morph-shop-abc}',
    );
    expect(out).not.toMatch(/#[0-9a-f]{3}|rgb|hsl/i);
  });

  it("turns the animations off under prefers-reduced-motion", () => {
    const out = render("shop", "abc");
    expect(out).toMatch(/@media \(prefers-reduced-motion:reduce\)\{[^}]*animation:none/);
    expect(out).toContain("::view-transition-group(hc-morph-shop-abc)");
  });

  it("gives different pairs different names", () => {
    expect(nameOf(render("x", "a-b"))).not.toBe(nameOf(render("x-a", "b")));
    expect(nameOf(render("x", "_"))).not.toBe(nameOf(render("x", "_5f_")));
    expect(nameOf(render("x", 1))).toBe(nameOf(render("x", "1")));
  });

  it("makes any item a safe CSS identifier", () => {
    const out = render("shop", '1 "a"}b');
    const name = nameOf(out);
    expect(name).toMatch(/^hc-morph-[A-Za-z0-9_-]+$/);
    expect(out).toContain(`[data-morph="${name}"]{view-transition-name:${name}}`);
  });

  it("forwards props to the element", () => {
    const out = renderToStaticMarkup(
      <Morph name="m" item="x" id="card">
        x
      </Morph>,
    );
    expect(out).toContain('id="card"');
  });
});
