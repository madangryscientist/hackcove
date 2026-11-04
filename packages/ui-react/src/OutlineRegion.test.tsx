import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OutlineRegion, RegionFrame } from "./OutlineRegion.js";

const within = { width: 200, height: 100 };

describe("OutlineRegion", () => {
  it("places the area in percent of the picture, with an accent outline", () => {
    const out = renderToStaticMarkup(
      <OutlineRegion rect={{ x: 50, y: 10, width: 100, height: 25 }} within={within} />,
    );
    expect(out).toContain("left:25%;top:10%;width:50%;height:25%");
    expect(out).toContain("border-violet-600");
    expect(out).toContain("pointer-events-none");
  });

  it("draws the label tag and the hatch only when asked", () => {
    const rect = { x: 0, y: 0, width: 10, height: 10 };
    const plain = renderToStaticMarkup(<OutlineRegion rect={rect} within={within} />);
    expect(plain).not.toContain("repeating-linear-gradient");
    expect(plain).not.toContain("bg-violet-600");
    const full = renderToStaticMarkup(
      <OutlineRegion rect={rect} within={within} label="config" hatched />,
    );
    expect(full).toContain("repeating-linear-gradient");
    expect(full).toContain('aria-hidden="true"');
    expect(full).toContain("config</span>");
  });

  it("passes data and aria attributes through", () => {
    const out = renderToStaticMarkup(
      <OutlineRegion
        rect={{ x: 0, y: 0, width: 1, height: 1 }}
        within={within}
        data-testid="ignore-box"
        data-source="UI"
        title="ignored"
      />,
    );
    expect(out).toContain('data-testid="ignore-box"');
    expect(out).toContain('data-source="UI"');
    expect(out).toContain('title="ignored"');
  });
});

describe("RegionFrame", () => {
  it("is the positioned box: the picture full width, the regions over it", () => {
    const out = renderToStaticMarkup(
      <RegionFrame src="/shot.png" alt="A shot" loading="lazy">
        <OutlineRegion rect={{ x: 0, y: 0, width: 1, height: 1 }} within={within} />
      </RegionFrame>,
    );
    expect(out).toMatch(
      /^<div class="relative border border-slate-200"><img loading="lazy" src="\/shot.png" alt="A shot" class="block w-full"\/><div/,
    );
  });
});
