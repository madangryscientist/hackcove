// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { Card } from "./Card.js";
import { mount, unmount } from "./dom.harness.js";
import { Pill } from "./Pill.js";

afterEach(unmount);

const badgeOf = (out: string) =>
  out.match(/<span class="(pointer-events-none absolute[^"]*)">/)?.[1];

const rootClass = (out: string) => out.match(/^<section[^>]* class="([^"]*)"/)?.[1];

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

const section = (root: HTMLElement) => root.querySelector("section");

describe("Card title names its section", () => {
  it("points the section's aria-labelledby at the heading", () => {
    const root = mount(<Card title="Billing">body</Card>);
    const labelledBy = section(root)?.getAttribute("aria-labelledby") ?? "";
    expect(labelledBy).not.toBe("");
    const heading = document.getElementById(labelledBy);
    expect(heading?.tagName).toBe("H2");
    expect(heading?.textContent).toBe("Billing");
  });

  it("names an article too, with a bar or actions", () => {
    const root = mount(
      <Card as="article" bar title="Billing" actions={<button type="button">Edit</button>}>
        body
      </Card>,
    );
    const labelledBy = root.querySelector("article")?.getAttribute("aria-labelledby") ?? "";
    expect(document.getElementById(labelledBy)?.textContent).toBe("Billing");
  });

  it("gives two cards two different ids", () => {
    const root = mount(
      <>
        <Card title="One">a</Card>
        <Card title="Two">b</Card>
      </>,
    );
    const [one, two] = [...root.querySelectorAll("section")].map((el) =>
      el.getAttribute("aria-labelledby"),
    );
    expect(one).not.toBe(two);
  });

  it("lets a caller's aria-label or aria-labelledby win", () => {
    const labelled = mount(
      <Card title="Billing" aria-label="Invoices">
        body
      </Card>,
    );
    expect(section(labelled)?.getAttribute("aria-label")).toBe("Invoices");
    expect(section(labelled)?.hasAttribute("aria-labelledby")).toBe(false);
    unmount();
    const by = mount(
      <Card title="Billing" aria-labelledby="elsewhere">
        body
      </Card>,
    );
    expect(section(by)?.getAttribute("aria-labelledby")).toBe("elsewhere");
  });

  it("leaves a card with no title, and a bare div, unnamed", () => {
    expect(section(mount(<Card>body</Card>))?.hasAttribute("aria-labelledby")).toBe(false);
    unmount();
    const div = mount(
      <Card as="div" title="Billing">
        body
      </Card>,
    );
    expect(div.querySelector("div[aria-labelledby]")).toBeNull();
  });
});

const card = (root: HTMLElement) => root.querySelector("[data-testid='probe']");

describe("Card that is a link: root attributes", () => {
  it("puts id, data-* and aria-describedby on the card root, not on the link", () => {
    const root = mount(
      <Card href="/x" title="Home" id="home" data-testid="probe" aria-describedby="why">
        body
      </Card>,
    );
    const el = card(root);
    expect(el?.tagName).toBe("DIV");
    expect(el?.id).toBe("home");
    expect(el?.getAttribute("aria-describedby")).toBe("why");
    const link = root.querySelector("a");
    expect(link?.hasAttribute("id")).toBe(false);
    expect(link?.hasAttribute("data-testid")).toBe(false);
    expect(link?.hasAttribute("aria-describedby")).toBe(false);
  });

  it("is still named by the card's text, the badge included, under the caller's id", () => {
    const root = mount(
      <Card href="/x" title="Home" id="home" badge={<Pill tone="amber">Flaky</Pill>}>
        body
      </Card>,
    );
    const link = root.querySelector("a");
    expect(link?.getAttribute("aria-labelledby")).toBe("home");
    expect(document.getElementById("home")?.textContent).toContain("Flaky");
  });

  it("keeps a generated id for the name when the caller gives none", () => {
    const link = mount(
      <Card href="/x" title="Home" data-testid="probe">
        body
      </Card>,
    ).querySelector("a");
    expect(document.getElementById(link?.getAttribute("aria-labelledby") ?? "")).not.toBeNull();
  });

  it("keeps aria-label and aria-current, which name and mark the link, on the link", () => {
    const root = mount(
      <Card href="/x" title="Home" aria-label="Go home" aria-current="page" data-testid="probe">
        body
      </Card>,
    );
    const link = root.querySelector("a");
    expect(link?.getAttribute("aria-label")).toBe("Go home");
    expect(link?.getAttribute("aria-current")).toBe("page");
    expect(link?.hasAttribute("aria-labelledby")).toBe(false);
    expect(card(root)?.hasAttribute("aria-label")).toBe(false);
  });
});
