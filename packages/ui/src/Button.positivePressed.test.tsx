import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button, buttonClass } from "./Button.js";

const html = renderToStaticMarkup;

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

  it("pressed={false} sets aria-pressed=false and keeps the resting look", () => {
    const out = html(
      <Button variant="outline" pressed={false}>
        X
      </Button>,
    );
    expect(out).toContain('aria-pressed="false"');
    expect(out).toContain(`class="${buttonClass("outline")}`);
  });

  it("pressed sets aria-pressed=true and draws the selected look on outline and ghost", () => {
    for (const variant of ["outline", "ghost"] as const) {
      const out = html(
        <Button variant={variant} pressed>
          X
        </Button>,
      );
      expect(out).toContain('aria-pressed="true"');
      expect(out).toContain("border-violet-600");
      expect(out).toContain("bg-violet-50");
      expect(out).toContain("text-violet-700");
    }
  });

  it("the selected look follows the tone", () => {
    const positive = html(
      <Button variant="outline" tone="positive" pressed>
        X
      </Button>,
    );
    expect(positive).toContain("border-emerald-600");
    expect(positive).toContain("bg-emerald-50");
    expect(positive).not.toMatch(/(?:bg|border|text)-violet/);
    const danger = html(
      <Button variant="ghost" tone="danger" pressed>
        X
      </Button>,
    );
    expect(danger).toContain("border-red-600");
    expect(danger).toContain("bg-red-50");
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

  it("blocked stays grey and busy keeps the selected colour", () => {
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
    expect(busy).toContain("bg-violet-50");
    expect(busy).toContain("cursor-progress");
  });
});
