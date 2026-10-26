import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  CardGrid,
  CenteredLayout,
  DetailLayout,
  FormLayout,
  FullBleedLayout,
  ListLayout,
  ProseLayout,
  SidebarLayout,
} from "./PageLayouts.js";

const classesOf = (out: string) => /class="([^"]*)"/.exec(out)?.[1]?.split(" ") ?? [];

/** Whether every text is in `out`, each after the one before it. */
const inOrder = (out: string, texts: string[]): boolean => {
  const found = texts.map((text) => out.indexOf(text));
  return found.every((index, i) => index >= 0 && (i === 0 || index > (found[i - 1] ?? 0)));
};

describe("ListLayout", () => {
  it("renders the header, the filters, then the list", () => {
    const out = renderToStaticMarkup(
      <ListLayout title="Quotes" actions="NEW" filters="FILTERS">
        ROWS
      </ListLayout>,
    );
    expect(inOrder(out, ["Quotes", "NEW", "FILTERS", "ROWS"])).toBe(true);
  });

  it("shows `empty` instead of the list when isEmpty", () => {
    const out = renderToStaticMarkup(
      <ListLayout title="Quotes" isEmpty empty="NOTHING">
        ROWS
      </ListLayout>,
    );
    expect(out).toContain("NOTHING");
    expect(out).not.toContain("ROWS");
  });

  it("shows the list, not `empty`, when it has rows", () => {
    const out = renderToStaticMarkup(
      <ListLayout title="Quotes" empty="NOTHING">
        ROWS
      </ListLayout>,
    );
    expect(out).toContain("ROWS");
    expect(out).not.toContain("NOTHING");
  });
});

describe("DetailLayout", () => {
  const out = renderToStaticMarkup(
    <DetailLayout title="Quote 7" aside="SIDE">
      MAIN
    </DetailLayout>,
  );

  it("puts main in two thirds of a three-column grid from lg, and the aside in the rest", () => {
    expect(out).toMatch(/class="grid [^"]*lg:grid-cols-3"/);
    expect(out).toMatch(/lg:col-span-2[^>]*><div[^>]*>MAIN</);
    expect(out).toMatch(/<aside [^>]*>.*SIDE/);
  });

  it("orders the aside after main, so it stacks below on a smaller screen", () => {
    expect(inOrder(out, ["Quote 7", "MAIN", "SIDE"])).toBe(true);
  });
});

describe("FormLayout", () => {
  const out = renderToStaticMarkup(
    <FormLayout title="New quote" actions="SAVE" action="/save">
      FIELDS
    </FormLayout>,
  );

  it("narrows to max-w-3xl without centring, and passes form props to the <form>", () => {
    expect(out).toMatch(/<form class="max-w-3xl" action="\/save">/);
    expect(out).not.toContain("mx-auto");
  });

  it("puts the actions row after the fields", () => {
    expect(inOrder(out, ["New quote", "FIELDS", "SAVE"])).toBe(true);
  });

  it("renders no actions row without actions", () => {
    expect(renderToStaticMarkup(<FormLayout title="t">x</FormLayout>)).not.toContain("flex-wrap");
  });
});

describe("ProseLayout", () => {
  const out = renderToStaticMarkup(
    <ProseLayout title="Privacy" subtitle="Last updated" actions="PHOTO">
      ONE
      <p>TWO</p>
    </ProseLayout>,
  );

  it("is one left-aligned max-w-3xl column, with no class to add", () => {
    expect(out).toMatch(/^<div class="max-w-3xl">/);
    expect(out).not.toContain("mx-auto");
  });

  it("puts the header inside the column, then the blocks in a Stack", () => {
    expect(inOrder(out, ["Privacy", "Last updated", "PHOTO", "ONE", "TWO"])).toBe(true);
    expect(out).toContain(
      '<div class="flex flex-col gap-6 *:data-page-header:mb-0">ONE<p>TWO</p></div>',
    );
  });

  it("takes a Stack gap", () => {
    expect(
      renderToStaticMarkup(
        <ProseLayout title="t" gap="lg">
          x
        </ProseLayout>,
      ),
    ).toContain('<div class="flex flex-col gap-8 *:data-page-header:mb-0">x</div>');
  });
});

describe("CardGrid", () => {
  it.each([
    [2, "lg:grid-cols-2"],
    [3, "lg:grid-cols-3"],
    [4, "lg:grid-cols-4"],
  ] as const)("with columns %s is one column, two from sm and %s from lg", (columns, large) => {
    const out = renderToStaticMarkup(<CardGrid columns={columns}>tiles</CardGrid>);
    expect(classesOf(out)).toEqual(
      expect.arrayContaining(["grid", "grid-cols-1", "sm:grid-cols-2", large]),
    );
  });

  it("defaults to three columns", () => {
    expect(classesOf(renderToStaticMarkup(<CardGrid>tiles</CardGrid>))).toContain("lg:grid-cols-3");
  });

  it.each([
    [undefined, "grid-cols-[repeat(auto-fill,minmax(17rem,1fr))]"],
    ["md", "grid-cols-[repeat(auto-fill,minmax(17rem,1fr))]"],
    ["sm", "grid-cols-[repeat(auto-fill,minmax(12rem,1fr))]"],
  ] as const)("with columns auto and minWidth %s fills by %s", (minWidth, fill) => {
    const classes = classesOf(
      renderToStaticMarkup(
        <CardGrid columns="auto" minWidth={minWidth}>
          tiles
        </CardGrid>,
      ),
    );
    expect(classes).toEqual(expect.arrayContaining(["grid", "gap-4", fill]));
    expect(classes.join(" ")).not.toMatch(/\bgrid-cols-1\b|lg:grid-cols|sm:grid-cols/);
  });

  it("stretches the cards by default and keeps their own height with align start", () => {
    expect(classesOf(renderToStaticMarkup(<CardGrid>tiles</CardGrid>))).not.toContain(
      "items-start",
    );
    expect(classesOf(renderToStaticMarkup(<CardGrid align="start">tiles</CardGrid>))).toContain(
      "items-start",
    );
    expect(
      classesOf(
        renderToStaticMarkup(
          <CardGrid columns="auto" align="start">
            tiles
          </CardGrid>,
        ),
      ),
    ).toContain("items-start");
  });
});

describe("SidebarLayout", () => {
  const out = renderToStaticMarkup(<SidebarLayout rail="RAIL">CANVAS</SidebarLayout>);

  it("lives in the shell's Container: no height, no full-bleed edge, no own padding", () => {
    expect(out).not.toMatch(/calc\(|100vh|57px|h-\[|min-h-0|flex-1 flex-col/);
    expect(out).not.toMatch(/\bpx-|\bpy-/);
  });

  it("stacks the rail above the canvas below md and makes it w-56 from md", () => {
    expect(out).toMatch(/^<div class="[^"]*flex-col[^"]* md:flex-row/);
    expect(out).toMatch(/<aside class="[^"]*w-full[^"]*md:w-56[^"]*">RAIL<\/aside>/);
    expect(inOrder(out, ["RAIL", "CANVAS"])).toBe(true);
  });

  it("leaves the rail on the page background: no fill and no border", () => {
    const aside = /<aside class="([^"]*)"/.exec(out)?.[1] ?? "";
    expect(aside).not.toMatch(/\bbg-|\bborder/);
  });

  it("lets the canvas shrink so a wide table scrolls inside it", () => {
    expect(out).toMatch(/<div class="min-w-0 flex-1">CANVAS<\/div>/);
  });
});

describe("FullBleedLayout", () => {
  it("fills the width with children and puts the panel at lg:w-72 after them", () => {
    const out = renderToStaticMarkup(<FullBleedLayout panel="PANEL">VIEW</FullBleedLayout>);
    expect(out).toMatch(/^<div class="[^"]*flex-col lg:flex-row/);
    expect(out).toMatch(/<aside class="[^"]*lg:w-72[^"]*">PANEL<\/aside>/);
    expect(inOrder(out, ["VIEW", "PANEL"])).toBe(true);
  });

  it("renders no panel without one", () => {
    expect(renderToStaticMarkup(<FullBleedLayout>VIEW</FullBleedLayout>)).not.toContain("<aside");
  });
});

describe("CenteredLayout", () => {
  const out = renderToStaticMarkup(
    <CenteredLayout title="Sign in" subtitle="to continue">
      FORM
    </CenteredLayout>,
  );

  it("centres a max-w-md column at a fixed offset from the top", () => {
    expect(out).toMatch(/^<div class="mx-auto w-full max-w-md pt-16">/);
  });

  it("holds the title, subtitle and body in a card", () => {
    expect(inOrder(out, ["Sign in", "to continue", "FORM"])).toBe(true);
    expect(out).toContain("rounded-xl");
  });
});
