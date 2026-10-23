import { Container } from "./Container.js";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  CardGrid,
  CenteredLayout,
  DetailLayout,
  FormLayout,
  FullBleedLayout,
  ListLayout,
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
    expect(out).toMatch(/lg:col-span-2[^>]*>MAIN</);
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

  it("keeps max-w-3xl when the caller passes a className", () => {
    const merged = renderToStaticMarkup(
      <FormLayout title="t" className="extra">
        x
      </FormLayout>,
    );
    expect(merged).toContain('<form class="max-w-3xl extra">');
  });

  it("puts the actions row after the fields", () => {
    expect(inOrder(out, ["New quote", "FIELDS", "SAVE"])).toBe(true);
  });

  it("renders no actions row without actions", () => {
    expect(renderToStaticMarkup(<FormLayout title="t">x</FormLayout>)).not.toContain("flex-wrap");
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
});

describe("SidebarLayout", () => {
  const out = renderToStaticMarkup(<SidebarLayout rail="RAIL">CANVAS</SidebarLayout>);

  it("fills the shell's flex column with no hard-coded height", () => {
    expect(out).toMatch(/^<div class="flex min-h-0 flex-1 /);
    expect(out).not.toMatch(/calc\(|100vh|57px|h-\[/);
  });

  it("stacks the rail above the canvas below md and makes it w-60 from md", () => {
    expect(out).toMatch(/^<div class="[^"]*flex-col md:flex-row/);
    expect(out).toMatch(/<aside class="[^"]*w-full[^"]*md:w-60[^"]*">RAIL<\/aside>/);
    expect(inOrder(out, ["RAIL", "CANVAS"])).toBe(true);
  });

  it("puts the canvas in a Container, so it keeps the shared padding", () => {
    expect(out).toContain(renderToStaticMarkup(<Container className="py-8">CANVAS</Container>));
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
