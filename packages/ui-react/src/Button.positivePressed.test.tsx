import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button, buttonClass } from "./Button.js";

const html = renderToStaticMarkup;
const classOf = (out: string) => /class="([^"]*)"/.exec(out)?.[1] ?? "";

describe("Button positive tone", () => {
  it("primary is a solid green with the green hover and no violet or red", () => {
    const out = html(<Button tone="positive">Accept</Button>);
    expect(out).toContain("bg-emerald-600");
    expect(out).toContain("text-emerald-50");
    expect(out).toContain("hover:bg-emerald-700");
    expect(out).not.toMatch(/(?:bg|border|text)-(?:violet|red)/);
  });

  it("outline, ghost and link are green text with no fill at rest", () => {
    for (const variant of ["outline", "ghost", "link"] as const) {
      const out = html(
        <Button tone="positive" variant={variant}>
          Accept
        </Button>,
      );
      expect(out).toContain("text-emerald-700");
      expect(out).not.toContain("bg-emerald-600");
      expect(out).not.toMatch(/(?:bg|border|text)-(?:violet|red)/);
    }
    expect(
      html(
        <Button tone="positive" variant="outline">
          A
        </Button>,
      ),
    ).toContain("border-emerald-200");
  });

  it("is flat grey when blocked, keeps its colour when busy, and matches buttonClass", () => {
    const blocked = html(
      <Button tone="positive" disabledReason="No">
        X
      </Button>,
    );
    expect(blocked).not.toContain("emerald");
    expect(blocked).toContain("cursor-not-allowed");
    const busy = html(
      <Button tone="positive" busy>
        X
      </Button>,
    );
    expect(busy).toContain("bg-emerald-600");
    expect(busy).toContain("cursor-progress");
    expect(html(<Button tone="positive">X</Button>)).toContain(
      buttonClass("primary", { tone: "positive" }),
    );
  });
});

describe("Button pressed", () => {
  it("is not a toggle until `pressed` is given: no aria-pressed", () => {
    expect(html(<Button variant="outline">X</Button>)).not.toContain("aria-pressed");
  });

  it("pressed={false} sets aria-pressed=false and draws the neutral off look", () => {
    for (const variant of ["outline", "ghost"] as const) {
      const out = html(
        <Button variant={variant} pressed={false}>
          X
        </Button>,
      );
      expect(out).toContain('aria-pressed="false"');
      expect(out).toContain("border-slate-200 bg-white text-slate-600");
      expect(out).toContain("hover:border-violet-400");
      expect(out).not.toMatch(/(?:bg|border|text)-violet-600/);
    }
  });

  it("pressed sets aria-pressed=true and draws the tone's primary fill on outline and ghost", () => {
    for (const variant of ["outline", "ghost"] as const) {
      const out = html(
        <Button variant={variant} pressed>
          X
        </Button>,
      );
      expect(out).toContain('aria-pressed="true"');
      expect(out).toContain("border-violet-600 bg-violet-600 text-violet-50");
      expect(out).toContain("hover:bg-violet-700");
    }
  });

  it("on and off differ, on is the primary fill, and left out keeps the variant's own look", () => {
    const on = classOf(
      html(
        <Button variant="outline" size="sm" pressed>
          X
        </Button>,
      ),
    );
    const off = classOf(
      html(
        <Button variant="outline" size="sm" pressed={false}>
          X
        </Button>,
      ),
    );
    expect(on).not.toBe(off);
    const primary = buttonClass("primary", { size: "sm" });
    for (const fill of ["bg-violet-600", "text-violet-50", "hover:bg-violet-700"]) {
      expect(primary).toContain(fill);
      expect(on).toContain(fill);
      expect(off).not.toContain(fill);
    }
    expect(classOf(html(<Button variant="outline">X</Button>))).toBe(buttonClass("outline"));
    expect(classOf(html(<Button variant="ghost">X</Button>))).toBe(buttonClass("ghost"));
  });

  it("the on fill follows the tone", () => {
    const positive = html(
      <Button variant="outline" tone="positive" pressed>
        X
      </Button>,
    );
    expect(positive).toContain("border-emerald-600 bg-emerald-600 text-emerald-50");
    expect(positive).not.toMatch(/(?:bg|border|text)-violet/);
    const danger = html(
      <Button variant="ghost" tone="danger" pressed>
        X
      </Button>,
    );
    expect(danger).toContain("border-red-600 bg-red-600 text-red-50");
    expect(danger).not.toMatch(/(?:bg|border|text)-violet/);
  });

  it("primary, link and dashed keep their own look but still carry aria-pressed", () => {
    for (const variant of ["primary", "link", "dashed"] as const) {
      const pressed = html(
        <Button variant={variant} pressed>
          X
        </Button>,
      );
      expect(pressed).toContain('aria-pressed="true"');
      expect(pressed.replace(' aria-pressed="true"', "")).toBe(
        html(<Button variant={variant}>X</Button>),
      );
    }
  });

  it("blocked stays grey and busy keeps the on fill", () => {
    const blocked = html(
      <Button variant="outline" pressed disabledReason="No">
        X
      </Button>,
    );
    expect(blocked).not.toMatch(/(?:bg|border|text)-violet/);
    expect(blocked).toContain("cursor-not-allowed");
    const busy = html(
      <Button variant="outline" pressed busy>
        X
      </Button>,
    );
    expect(busy).toContain("bg-violet-600");
    expect(busy).toContain("cursor-progress");
  });
});
