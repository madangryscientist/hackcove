import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StatTile } from "./StatTile.js";

describe("StatTile", () => {
  it("shows an uppercase caption over a large tabular-nums value", () => {
    const markup = renderToStaticMarkup(<StatTile label="Total interest" value="R 12 400" />);
    expect(markup).toContain("uppercase");
    expect(markup).toContain(">Total interest</p>");
    expect(markup).toContain("tabular-nums");
    expect(markup).toContain("text-3xl");
    expect(markup).toContain(">R 12 400</p>");
  });

  it("is neutral by default and has no accent bar or hint", () => {
    const markup = renderToStaticMarkup(<StatTile label="A" value="1" />);
    expect(markup).toContain("text-slate-900");
    expect(markup).not.toContain("absolute inset-x-0");
    expect(markup).not.toContain("mt-1 text-xs");
  });

  it("colours the value by tone", () => {
    expect(renderToStaticMarkup(<StatTile label="A" value="1" tone="negative" />)).toContain(
      "text-red-700",
    );
    expect(renderToStaticMarkup(<StatTile label="A" value="1" tone="positive" />)).toContain(
      "text-emerald-700",
    );
  });

  it("adds an accent bar in the tone's colour", () => {
    expect(renderToStaticMarkup(<StatTile label="A" value="1" accent />)).toContain(
      "bg-violet-600",
    );
    const negative = renderToStaticMarkup(<StatTile label="A" value="1" tone="negative" accent />);
    expect(negative).toContain("bg-red-600");
    expect(negative).toContain('aria-hidden="true"');
  });

  it("renders a hint line, including a zero", () => {
    expect(renderToStaticMarkup(<StatTile label="A" value="1" hint="left over" />)).toContain(
      ">left over</p>",
    );
    expect(renderToStaticMarkup(<StatTile label="A" value="1" hint={0} />)).toContain(">0</p>");
  });

  it("passes other attributes through", () => {
    const markup = renderToStaticMarkup(<StatTile label="A" value="1" data-testid="tile" />);
    expect(markup).toContain("shadow-sm");
    expect(markup).toContain('data-testid="tile"');
  });
});

describe("StatTile warn", () => {
  it("colours the value and the accent bar amber", () => {
    const out = renderToStaticMarkup(<StatTile label="Pending" value="R 900" tone="warn" accent />);
    expect(out).toContain("text-amber-700");
    expect(out).toContain("bg-amber-600");
    expect(out).not.toContain("text-slate-900");
  });
});

describe("StatTile trend", () => {
  it("draws trend as one hidden polyline in the tile's tone colour, on a scale from 0", () => {
    const markup = renderToStaticMarkup(
      <StatTile label="A" value="5" tone="positive" trend={[1, 3, 2]} />,
    );
    expect(markup.match(/<svg/g)).toHaveLength(1);
    expect(markup.match(/<polyline/g)).toHaveLength(1);
    expect(markup).toMatch(/<svg aria-hidden="true"[^>]*class="[^"]*text-emerald-700/);
    expect(markup).toContain('points="0,75 50,25 100,50"');
    expect(markup).toContain('stroke="currentColor"');
  });

  it("draws nothing extra without trend", () => {
    const props = { label: "A", value: "1", hint: "h", tone: "warn" } as const;
    const markup = renderToStaticMarkup(<StatTile {...props} />);
    expect(markup).not.toContain("<svg");
    expect(markup).toBe(
      '<div class="relative overflow-hidden rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm"><p class="text-xs font-semibold uppercase tracking-wide text-slate-500">A</p><p class="mt-2 text-3xl font-bold tabular-nums text-amber-700">1</p><p class="mt-1 text-xs text-slate-500">h</p></div>',
    );
  });
});
