import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Card } from "./Card.js";
import { Pill } from "./Pill.js";

const headingOf = (out: string) => out.match(/<h2 [^>]*class="([^"]*)"/)?.[1] ?? "";

describe("Card titleStyle", () => {
  it("is an uppercase overline by default", () => {
    const out = renderToStaticMarkup(<Card title="Shop">body</Card>);
    expect(headingOf(out)).toContain("uppercase");
    expect(headingOf(out)).toContain("tracking-wide");
    const explicit = renderToStaticMarkup(
      <Card title="Shop" titleStyle="overline">
        body
      </Card>,
    );
    expect(explicit).toBe(out);
  });

  it("name is the same h2 in sentence case and the primary ink", () => {
    const out = renderToStaticMarkup(
      <Card title="Corner Books" titleStyle="name">
        body
      </Card>,
    );
    expect(out).toMatch(/<h2 [^>]*>Corner Books<\/h2>/);
    expect(headingOf(out)).toContain("text-slate-900");
    expect(headingOf(out)).toContain("text-base font-semibold");
    expect(headingOf(out)).not.toContain("uppercase");
    expect(headingOf(out)).not.toContain("tracking");
  });

  it("still names the card, and keeps count, status and actions", () => {
    const out = renderToStaticMarkup(
      <Card
        title="Corner Books"
        titleStyle="name"
        count={4}
        status={<Pill tone="amber">Open</Pill>}
        actions={<button>Edit</button>}
        bar
      >
        body
      </Card>,
    );
    const id = out.match(/<h2 id="([^"]+)"/)?.[1];
    expect(id).toBeDefined();
    expect(out).toContain(`aria-labelledby="${id}"`);
    expect(out).toContain(">4</span>");
    expect(out).toContain("Open");
    expect(out).toContain("Edit");
  });

  it("works on a card that is a link", () => {
    const out = renderToStaticMarkup(
      <Card title="Corner Books" titleStyle="name" href="/shops/1">
        body
      </Card>,
    );
    expect(headingOf(out)).not.toContain("uppercase");
  });
});
