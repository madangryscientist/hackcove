import type { ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { IconButton } from "./IconButton.js";
import { focusRing } from "./cx.js";
import { Pill } from "./Pill.js";
import { Card } from "./Card.js";

// `href` makes the whole part the link:
// Card, IconButton and Pill. Pill also has a button form.

describe("Card href", () => {
  it("is a card with the link stretched over it: the card holds the hover border and the body, the empty link the focus ring", () => {
    const out = renderToStaticMarkup(
      <Card href="/shots/1" title="Shot" count={3}>
        body
      </Card>,
    );
    expect(out.startsWith('<div id="')).toBe(true);
    expect(out).toContain("relative scroll-mt-28 rounded-xl border");
    expect(out).toContain("hover:border-violet-400");
    expect(out).toMatch(/<a [^>]*href="\/shots\/1"[^>]*class="link-stretch absolute inset-0 /);
    expect(out).toContain('aria-labelledby="');
    expect(out).toContain(focusRing);
    expect(out).toContain("></a>");
    expect(out).toContain("<h2");
    expect(out.endsWith("body</div>")).toBe(true);
    expect(out).not.toContain("<section");
  });

  it("opens a new tab when external, and passes data-* and aria-* to the anchor", () => {
    const out = renderToStaticMarkup(
      <Card href="https://example.com" external data-testid="shot" aria-describedby="d">
        body
      </Card>,
    );
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noreferrer"');
    expect(out).toContain('data-testid="shot"');
    expect(out).toContain('aria-describedby="d"');
  });

  it("keeps every form: bar, flush, tone and size still style the link", () => {
    const out = renderToStaticMarkup(
      <Card href="/x" tone="warn" size="sm">
        body
      </Card>,
    );
    expect(out).toContain("bg-amber-50");
    expect(out).toContain("p-3");
  });

  it("a card without href stays a relative section", () => {
    const out = renderToStaticMarkup(<Card>body</Card>);
    expect(out.startsWith('<section class="relative ')).toBe(true);
    expect(out).not.toContain("hover:border-violet-400");
  });

  it("takes no actions or as with href", () => {
    // @ts-expect-error a card that is a link has no actions
    const withActions: ComponentProps<typeof Card> = {
      href: "/x",
      actions: "a",
      children: "b",
    };
    const withAs: ComponentProps<typeof Card> = {
      href: "/x",
      // @ts-expect-error a card that is a link is not an `as` element
      as: "article",
      children: "b",
    };
    expect([withActions, withAs]).toHaveLength(2);
  });
});

describe("IconButton href", () => {
  it("is an anchor with the button's classes, an accessible name and a title", () => {
    const out = renderToStaticMarkup(
      <IconButton href="/settings" label="Settings" variant="ghost" icon="close" />,
    );
    expect(out.startsWith("<a ")).toBe(true);
    expect(out).toContain('href="/settings"');
    expect(out).toContain('aria-label="Settings"');
    expect(out).toContain('title="Settings"');
    expect(out).toContain("size-9.5");
    expect(out).toContain("border-transparent");
    expect(out).toContain(focusRing);
    expect(out).not.toContain("type=");
    expect(out).not.toContain("<button");
  });

  it("badge pins a count to the corner and names it, on a link and on a button", () => {
    for (const out of [
      renderToStaticMarkup(<IconButton href="/alerts" label="Alerts" count={3} icon="close" />),
      renderToStaticMarkup(<IconButton label="Alerts" count={3} icon="close" />),
    ]) {
      expect(out).toContain('aria-label="Alerts, 3"');
      expect(out).toContain('title="Alerts, 3"');
      expect(out).toContain("absolute");
      expect(out).toContain(">3</span>");
      expect(out).toContain('aria-hidden="true"');
    }
  });

  it("shows no badge at 0 or without one, and caps above 99", () => {
    const zero = renderToStaticMarkup(<IconButton label="Alerts" count={0} icon="close" />);
    expect(zero).not.toContain("absolute");
    expect(zero).toContain('aria-label="Alerts"');
    expect(renderToStaticMarkup(<IconButton label="Alerts" count={120} icon="close" />)).toContain(
      "99+",
    );
  });

  it("passes data-* and aria-* to the anchor", () => {
    const out = renderToStaticMarkup(
      <IconButton href="/x" label="L" data-testid="gear" aria-describedby="d" icon="close" />,
    );
    expect(out).toContain('data-testid="gear"');
    expect(out).toContain('aria-describedby="d"');
  });
});

describe("Pill href and onClick", () => {
  it("a plain Pill is unchanged: a span with no interaction classes", () => {
    const out = renderToStaticMarkup(<Pill>x</Pill>);
    expect(out.startsWith("<span")).toBe(true);
    expect(out).not.toContain("hover:");
    expect(out).not.toContain(focusRing);
  });

  it("href makes it an anchor with the tone, a hover dim and the focus ring", () => {
    const out = renderToStaticMarkup(
      <Pill href="/flakes" tone="warn" round>
        flaky
      </Pill>,
    );
    expect(out.startsWith("<a ")).toBe(true);
    expect(out).toContain('href="/flakes"');
    expect(out).toContain("bg-amber-50 text-amber-700");
    expect(out).toContain("rounded-full");
    expect(out).toContain("hover:opacity-80");
    expect(out).toContain(focusRing);
  });

  it("onClick makes it a type=button button", () => {
    const out = renderToStaticMarkup(
      <Pill onClick={() => undefined} dot>
        filter
      </Pill>,
    );
    expect(out.startsWith('<button type="button"')).toBe(true);
    expect(out).toContain("hover:opacity-80");
    expect(out).toContain(focusRing);
    expect(out).toContain("cursor-pointer");
    expect(out).toContain("inline-flex items-center gap-1");
  });

  it("passes data-* and aria-* to the link and the button", () => {
    for (const out of [
      renderToStaticMarkup(
        <Pill href="/x" data-testid="chip" aria-label="Chip">
          x
        </Pill>,
      ),
      renderToStaticMarkup(
        <Pill onClick={() => undefined} data-testid="chip" aria-label="Chip">
          x
        </Pill>,
      ),
    ]) {
      expect(out).toContain('data-testid="chip"');
      expect(out).toContain('aria-label="Chip"');
    }
  });

  it("is a link or a button, never both", () => {
    // @ts-expect-error href and onClick are two forms
    const both: ComponentProps<typeof Pill> = {
      href: "/x",
      onClick: () => undefined,
      children: "x",
    };
    expect(both).toBeDefined();
  });
});
