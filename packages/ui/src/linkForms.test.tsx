import type { ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { IconButton } from "./IconButton.js";
import type { LinkRenderProps } from "./link.js";
import { focusRing } from "./cx.js";
import { Pill } from "./Pill.js";
import { Card } from "./Card.js";

// `href` (and `render`, the router hook TextLink and ButtonLink use) makes the whole part the link:
// Card, IconButton and Pill. Pill also has a button form.

function Router({ to, ...rest }: { to: string } & LinkRenderProps) {
  return <a data-router="yes" href={`/app${to}`} {...rest} />;
}

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

  it("draws the app's router link with the card classes through render", () => {
    const out = renderToStaticMarkup(
      <Card render={(p) => <Router to="/shots/1" {...p} />}>body</Card>,
    );
    expect(out).toContain('data-router="yes"');
    expect(out).toContain('href="/app/shots/1"');
    expect(out).toContain("rounded-xl border");
    expect(out).toContain("link-stretch");
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
      <IconButton href="/settings" label="Settings" variant="ghost">
        x
      </IconButton>,
    );
    expect(out.startsWith("<a ")).toBe(true);
    expect(out).toContain('href="/settings"');
    expect(out).toContain('aria-label="Settings"');
    expect(out).toContain('title="Settings"');
    expect(out).toContain("h-9 w-9");
    expect(out).toContain("border-transparent");
    expect(out).toContain(focusRing);
    expect(out).not.toContain("type=");
    expect(out).not.toContain("<button");
  });

  it("draws the app's router link through render", () => {
    const out = renderToStaticMarkup(
      <IconButton render={(p) => <Router to="/settings" {...p} />} label="Settings" tone="danger">
        x
      </IconButton>,
    );
    expect(out).toContain('data-router="yes"');
    expect(out).toContain('href="/app/settings"');
    expect(out).toContain("text-red-700");
  });

  it("badge pins a count to the corner and names it, on a link and on a button", () => {
    for (const out of [
      renderToStaticMarkup(
        <IconButton href="/alerts" label="Alerts" badge={3}>
          x
        </IconButton>,
      ),
      renderToStaticMarkup(
        <IconButton label="Alerts" badge={3}>
          x
        </IconButton>,
      ),
    ]) {
      expect(out).toContain('aria-label="Alerts, 3"');
      expect(out).toContain('title="Alerts, 3"');
      expect(out).toContain("absolute");
      expect(out).toContain(">3</span>");
      expect(out).toContain('aria-hidden="true"');
    }
  });

  it("shows no badge at 0 or without one, and caps above 99", () => {
    const zero = renderToStaticMarkup(
      <IconButton label="Alerts" badge={0}>
        x
      </IconButton>,
    );
    expect(zero).not.toContain("absolute");
    expect(zero).toContain('aria-label="Alerts"');
    expect(
      renderToStaticMarkup(
        <IconButton label="Alerts" badge={120}>
          x
        </IconButton>,
      ),
    ).toContain("99+");
  });

  it("passes data-* and aria-* to the anchor", () => {
    const out = renderToStaticMarkup(
      <IconButton href="/x" label="L" data-testid="gear" aria-describedby="d">
        x
      </IconButton>,
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
      <Pill href="/flakes" tone="amber" round>
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

  it("render draws the app's router link, and external opens a new tab", () => {
    const routed = renderToStaticMarkup(
      <Pill render={(p) => <Router to="/flakes" {...p} />}>flaky</Pill>,
    );
    expect(routed).toContain('data-router="yes"');
    expect(routed).toContain('href="/app/flakes"');
    const ext = renderToStaticMarkup(
      <Pill href="https://example.com" external>
        x
      </Pill>,
    );
    expect(ext).toContain('target="_blank"');
    expect(ext).toContain('rel="noreferrer"');
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
