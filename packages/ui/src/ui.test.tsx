import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Pill } from "./Pill.js";
import { Card, groupByEpic } from "./ui.js";

describe("groupByEpic", () => {
  it("orders real epics by ref and puts 'no epic' last", () => {
    const items = [
      { id: 1, epic: null },
      { id: 2, epic: "b" },
      { id: 3, epic: "a" },
      { id: 4, epic: "b" },
    ];
    const groups = groupByEpic(items, (i) => i.epic);
    expect(groups.map(([epic]) => epic)).toEqual(["a", "b", null]);
    expect(groups[1]?.[1].map((i) => i.id)).toEqual([2, 4]);
  });
});

describe("Pill", () => {
  it("defaults to the slate tone and takes a named tone", () => {
    expect(renderToStaticMarkup(<Pill>x</Pill>)).toContain("bg-slate-100");
    expect(renderToStaticMarkup(<Pill tone="red">x</Pill>)).toContain("text-red-900");
  });

  it("renders the same markup as before when dot is off", () => {
    expect(renderToStaticMarkup(<Pill tone="amber">x</Pill>)).toBe(
      '<span class="rounded-md px-1.5 py-0.5 text-xs font-medium bg-amber-50 text-amber-700">x</span>',
    );
  });

  it("takes the violet and sky tones", () => {
    expect(renderToStaticMarkup(<Pill tone="violet">x</Pill>)).toContain(
      "bg-violet-50 text-violet-700",
    );
    expect(renderToStaticMarkup(<Pill tone="sky">x</Pill>)).toContain("bg-sky-50 text-sky-700");
  });

  it("swaps rounded-md for rounded-full when round is on", () => {
    const markup = renderToStaticMarkup(<Pill round>x</Pill>);
    expect(markup).toContain("rounded-full");
    expect(markup).not.toContain("rounded-md");
  });

  it("adds a leading dot in the text colour when dot is on", () => {
    const markup = renderToStaticMarkup(
      <Pill tone="amber" dot>
        x
      </Pill>,
    );
    expect(markup).toContain("bg-current");
    expect(markup).toContain("inline-flex");
  });
});

describe("Card", () => {
  it("shows the title and count only when given", () => {
    const bare = renderToStaticMarkup(<Card>body</Card>);
    expect(bare).not.toContain("<h2");
    const titled = renderToStaticMarkup(
      <Card title="Open" count={0}>
        body
      </Card>,
    );
    expect(titled).toContain(">Open</h2>");
    expect(titled).toContain(">0</span>");
  });

  it("renders a section by default and the chosen element with as", () => {
    expect(renderToStaticMarkup(<Card>body</Card>)).toContain("<section");
    expect(renderToStaticMarkup(<Card as="article">body</Card>)).toContain("<article");
  });

  it("renders the same markup as before when as is off", () => {
    expect(renderToStaticMarkup(<Card>body</Card>)).toBe(
      '<section class="relative rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm">body</section>',
    );
  });

  it("flush drops the padding and clips the corners", () => {
    const out = renderToStaticMarkup(<Card flush>table</Card>);
    expect(out).toContain("overflow-hidden");
    expect(out).not.toContain("p-5");
    expect(out).toContain("shadow-sm");
  });

  it("bar puts the title, count and actions in a tinted strip over a padded body", () => {
    const out = renderToStaticMarkup(
      <Card bar title="Open" count={3} actions={<a href="/all">All</a>}>
        body
      </Card>,
    );
    expect(out).toContain("bg-slate-50");
    expect(out).toContain("border-b");
    expect(out).toContain(">Open</h2>");
    expect(out).toContain('<a href="/all">All</a>');
    expect(out).toContain('<div class="p-5">body</div>');
  });

  it("bar with flush leaves the body unpadded, and no strip without a title or actions", () => {
    const flush = renderToStaticMarkup(
      <Card bar flush title="Open">
        body
      </Card>,
    );
    expect(flush).toContain("<div>body</div>");
    expect(renderToStaticMarkup(<Card bar>body</Card>)).not.toContain("bg-slate-50");
  });

  it("status sits right after the title and count, with actions at the far end", () => {
    const out = renderToStaticMarkup(
      <Card title="Hack Cove UI" count={2} status={<b>s</b>} actions={<i>a</i>}>
        body
      </Card>,
    );
    const at = (needle: string) => out.indexOf(needle);
    expect(at(">Hack Cove UI</h2>")).toBeLessThan(at(">2</span>"));
    expect(at(">2</span>")).toBeLessThan(at("<b>s</b>"));
    expect(at("<b>s</b>")).toBeLessThan(at("ml-auto"));
    expect(at("ml-auto")).toBeLessThan(at("<i>a</i>"));
  });

  it("renders no status without a title", () => {
    expect(renderToStaticMarkup(<Card status={<b>s</b>}>body</Card>)).not.toContain("<b>s</b>");
  });

  it("actions sit beside the title without bar", () => {
    const out = renderToStaticMarkup(
      <Card title="Bills" actions={<b>x</b>}>
        body
      </Card>,
    );
    expect(out).toContain("<b>x</b>");
    expect(out).not.toContain("bg-slate-50");
  });

  it("bar with no title or actions renders the plain padded card", () => {
    const out = renderToStaticMarkup(<Card bar>body</Card>);
    expect(out).toBe(renderToStaticMarkup(<Card>body</Card>));
  });

  it("dashed ignores flush and bar", () => {
    const out = renderToStaticMarkup(
      <Card dashed flush bar title="T">
        Nothing yet
      </Card>,
    );
    expect(out).toContain("p-8");
    expect(out).not.toContain("overflow-hidden");
    expect(out).not.toContain("bg-slate-50");
  });

  it("dashed is an unfilled, shadowless shell with centred muted text", () => {
    const out = renderToStaticMarkup(<Card dashed>Nothing yet</Card>);
    expect(out).toContain("border-dashed");
    expect(out).toContain("text-center");
    expect(out).not.toContain("shadow-sm");
    expect(out).not.toContain("bg-white");
  });

  it('dashed="filled" is the dashed shell on a surface fill with p-10; dashed stays p-8', () => {
    const filled = renderToStaticMarkup(<Card dashed="filled">Nothing yet</Card>);
    expect(filled).toContain("border-dashed");
    expect(filled).toContain("bg-white");
    expect(filled).toContain("p-10");
    expect(filled).not.toContain("p-8");
    expect(filled).not.toContain("shadow-sm");
    const plain = renderToStaticMarkup(<Card dashed>Nothing yet</Card>);
    expect(plain).toContain("p-8");
    expect(plain).not.toContain("p-10");
  });

  it("passes id, data-* and aria-* to the root", () => {
    const out = renderToStaticMarkup(
      <Card id="empty" data-testid="c" aria-label="Empty" dashed>
        x
      </Card>,
    );
    expect(out).toMatch(/^<section[^>]*id="empty"/);
    expect(out).toContain('data-testid="c"');
    expect(out).toContain('aria-label="Empty"');
  });
});

describe("Card size and tone", () => {
  it("sm is dense padding, md the default", () => {
    expect(renderToStaticMarkup(<Card size="sm">x</Card>)).toContain("p-3");
    expect(renderToStaticMarkup(<Card>x</Card>)).toContain("p-5");
    expect(
      renderToStaticMarkup(
        <Card size="sm" title="T">
          x
        </Card>,
      ),
    ).toContain("mb-2");
    expect(
      renderToStaticMarkup(
        <Card size="sm" bar title="T">
          x
        </Card>,
      ),
    ).toContain("px-3 py-2");
  });

  it("tone is the Callout's soft fill and border, with no shadow", () => {
    const out = renderToStaticMarkup(<Card tone="warn">x</Card>);
    expect(out).toContain("border-amber-200");
    expect(out).toContain("bg-amber-50");
    expect(out).not.toContain("bg-white");
    expect(out).not.toContain("shadow-sm");
  });

  it("ignores tone on a dashed card and on a bar", () => {
    expect(
      renderToStaticMarkup(
        <Card dashed tone="warn">
          x
        </Card>,
      ),
    ).not.toContain("bg-amber-50");
    expect(
      renderToStaticMarkup(
        <Card bar title="T" tone="warn">
          x
        </Card>,
      ),
    ).not.toContain("bg-amber-50 ");
  });
});
