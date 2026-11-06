// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { Button } from "./Button.js";
import { mount, unmount } from "./dom.harness.js";

afterEach(unmount);

describe("Button count", () => {
  it("draws the count in a chip after the label", () => {
    const out = renderToStaticMarkup(
      <Button variant="ghost" size="sm" count={3}>
        Splits
      </Button>,
    );
    expect(out).toMatch(
      /Splits<span class="sr-only">, <\/span><span class="[^"]*rounded-full[^"]*">3<\/span>/,
    );
    expect(out).toContain("border-current");
  });

  it("is part of the accessible name: label, comma, count", () => {
    const container = mount(<Button count={3}>Splits</Button>);
    expect(container.querySelector("button")?.textContent).toBe("Splits, 3");
  });

  it("shows a count of 0 and draws no chip when there is no count", () => {
    expect(renderToStaticMarkup(<Button count={0}>Splits</Button>)).toContain(">0</span>");
    const none = renderToStaticMarkup(<Button>Splits</Button>);
    expect(none).not.toContain("rounded-full");
    expect(none).not.toContain("sr-only");
  });

  it("keeps aria-expanded for a button that opens something", () => {
    const out = renderToStaticMarkup(
      <Button variant="ghost" count={3} aria-expanded={true} aria-controls="splits">
        Splits
      </Button>,
    );
    expect(out).toContain('aria-expanded="true"');
    expect(out).toContain('aria-controls="splits"');
  });

  it("works on every variant, a toggle and a link, using the button's own colour", () => {
    for (const variant of ["primary", "outline", "ghost", "link", "dashed"] as const) {
      const out = renderToStaticMarkup(
        <Button variant={variant} count={2}>
          Notes
        </Button>,
      );
      expect(out).toContain(">2</span>");
    }
    const pressed = renderToStaticMarkup(
      <Button variant="outline" pressed count={4}>
        Open
      </Button>,
    );
    expect(pressed).toContain('aria-pressed="true"');
    expect(pressed).toContain(">4</span>");
    const link = renderToStaticMarkup(
      <Button href="/comments" count={5}>
        Comments
      </Button>,
    );
    expect(link).toMatch(/<a [^>]*>Comments<span class="sr-only">, <\/span>.*>5<\/span><\/a>/);
  });

  it("drops the chip while busy, since busyLabel replaces the content", () => {
    const out = renderToStaticMarkup(
      <Button busy busyLabel="Loading…" count={3}>
        Splits
      </Button>,
    );
    expect(out).toContain("Loading…");
    expect(out).not.toContain("rounded-full");
  });
});
