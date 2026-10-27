// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { Card } from "./Card.js";
import { mount, unmount } from "./dom.harness.js";
import { Pill } from "./Pill.js";

afterEach(unmount);

const badgeOf = (out: string) =>
  out.match(/<span class="(pointer-events-none absolute[^"]*)">/)?.[1];

const rootClass = (out: string) => out.match(/^<section class="([^"]*)"/)?.[1];

describe("Card badge", () => {
  it("pins the badge in the top-right corner, over the content, after the body", () => {
    const out = renderToStaticMarkup(
      <Card title="Shot" badge={<Pill tone="amber">Flaky</Pill>}>
        body
      </Card>,
    );
    expect(badgeOf(out)).toContain("absolute z-10");
    expect(badgeOf(out)).toContain("top-3 right-3");
    expect(out.indexOf("body")).toBeLessThan(out.indexOf("Flaky"));
  });

  it("changes no layout: the card keeps its padding and the root stays relative", () => {
    const plain = renderToStaticMarkup(<Card title="Shot">body</Card>);
    const badged = renderToStaticMarkup(
      <Card title="Shot" badge="B">
        body
      </Card>,
    );
    expect(rootClass(badged)).toBe(rootClass(plain));
    expect(rootClass(badged)).toContain("relative");
  });

  it("follows the card's size into the corner", () => {
    expect(
      badgeOf(
        renderToStaticMarkup(
          <Card size="sm" badge="B">
            x
          </Card>,
        ),
      ),
    ).toContain("top-2 right-2");
    expect(
      badgeOf(
        renderToStaticMarkup(
          <Card size="lg" badge="B">
            x
          </Card>,
        ),
      ),
    ).toContain("top-4 right-4");
  });

  it("on a link card lets a click through to the card, except on a link or button in the badge", () => {
    const out = renderToStaticMarkup(
      <Card href="/shots/1" badge="B">
        x
      </Card>,
    );
    expect(badgeOf(out)).toContain("pointer-events-none");
    expect(badgeOf(out)).toContain("[&amp;_:is(a,button)]:pointer-events-auto");
  });

  it("on a link card is part of the link's accessible name", () => {
    const root = mount(
      <Card href="/shots/1" title="Home page" badge={<Pill tone="amber">Flaky</Pill>}>
        Desktop
      </Card>,
    );
    const link = root.querySelector("a");
    const labelledBy = link?.getAttribute("aria-labelledby") ?? "";
    expect(labelledBy).not.toBe("");
    const name = document.getElementById(labelledBy)?.textContent;
    expect(name).toContain("Home page");
    expect(name).toContain("Flaky");
  });

  it("renders no badge wrapper without one", () => {
    expect(badgeOf(renderToStaticMarkup(<Card>x</Card>))).toBeUndefined();
  });
});

describe("Card attention", () => {
  it("swaps the border colour for the warn tone's strong edge and keeps the white fill", () => {
    const out = renderToStaticMarkup(<Card attention>x</Card>);
    expect(out).toContain("border-amber-600");
    expect(out).toContain("bg-white");
    expect(out).not.toContain("border-slate-200/70");
  });

  it("keeps a tone's fill", () => {
    const out = renderToStaticMarkup(
      <Card attention tone="warn">
        x
      </Card>,
    );
    expect(out).toContain("border-amber-600 bg-amber-50");
    expect(out).not.toContain("border-amber-200");
  });

  it("works on a link card and is ignored with dashed", () => {
    expect(
      renderToStaticMarkup(
        <Card href="/x" attention>
          x
        </Card>,
      ),
    ).toContain("border-amber-600");
    expect(
      renderToStaticMarkup(
        <Card dashed attention>
          x
        </Card>,
      ),
    ).not.toContain("border-amber-600");
  });
});
