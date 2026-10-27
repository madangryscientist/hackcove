import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Cluster, ClusterGrow } from "./Cluster.js";

describe("Cluster", () => {
  it("is a one-line flex row, gap sm, centred, packed at the start by default", () => {
    expect(renderToStaticMarkup(<Cluster>x</Cluster>)).toBe(
      '<div class="flex gap-4 items-center justify-start">x</div>',
    );
  });

  it("maps xs, sm and md to the Stack scale: gap-2, gap-4 and gap-6", () => {
    expect(renderToStaticMarkup(<Cluster gap="xs">x</Cluster>)).toContain("gap-2");
    expect(renderToStaticMarkup(<Cluster gap="sm">x</Cluster>)).toContain("gap-4");
    expect(renderToStaticMarkup(<Cluster gap="md">x</Cluster>)).toContain("gap-6");
  });

  it.each([
    ["center", "items-center"],
    ["baseline", "items-baseline"],
    ["start", "items-start"],
    ["end", "items-end"],
  ] as const)("maps align %s to %s", (align, cls) => {
    expect(renderToStaticMarkup(<Cluster align={align}>x</Cluster>)).toContain(cls);
  });

  it.each([
    ["start", "justify-start"],
    ["between", "justify-between"],
    ["end", "justify-end"],
  ] as const)("maps justify %s to %s", (justify, cls) => {
    expect(renderToStaticMarkup(<Cluster justify={justify}>x</Cluster>)).toContain(cls);
  });

  it("is a div by default and a span with as=span, for phrasing content", () => {
    expect(renderToStaticMarkup(<Cluster>x</Cluster>)).toMatch(/^<div /);
    expect(renderToStaticMarkup(<Cluster as="span">x</Cluster>)).toBe(
      '<span class="flex gap-4 items-center justify-start">x</span>',
    );
    expect(renderToStaticMarkup(<Cluster as="span" data-testid="c" />)).toContain(
      'data-testid="c"',
    );
  });

  it("wraps only when asked to", () => {
    expect(renderToStaticMarkup(<Cluster>x</Cluster>)).not.toContain("flex-wrap");
    expect(renderToStaticMarkup(<Cluster wrap>x</Cluster>)).toContain("flex-wrap");
  });
});

describe("ClusterGrow", () => {
  it("takes the room left in the row and can shrink to nothing", () => {
    expect(renderToStaticMarkup(<ClusterGrow>x</ClusterGrow>)).toBe(
      '<div class="min-w-0 flex-1">x</div>',
    );
  });
});
