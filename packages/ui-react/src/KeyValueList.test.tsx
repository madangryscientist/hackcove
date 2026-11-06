import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { KeyValue, KeyValueList } from "./KeyValueList.js";
import type { TextTone } from "./typography.js";

describe("KeyValueList", () => {
  it("renders a dl with the rows as flex justify-between rows", () => {
    const out = renderToStaticMarkup(
      <KeyValueList>
        <KeyValue label="Size">1280×720</KeyValue>
      </KeyValueList>,
    );
    expect(out.startsWith("<dl")).toBe(true);
    expect(out).toContain('<div class="flex justify-between gap-3">');
  });

  it("renders the label as a slate-600 dt and the value as a right-aligned tabular dd", () => {
    const out = renderToStaticMarkup(
      <KeyValueList>
        <KeyValue label="Diff">0.4%</KeyValue>
      </KeyValueList>,
    );
    expect(out).toContain('<dt class="text-slate-600">Diff</dt>');
    expect(out).toContain('<dd class="text-right tabular-nums">0.4%</dd>');
  });

  it("passes other props through to the dl and the row", () => {
    const out = renderToStaticMarkup(
      <KeyValueList data-testid="list">
        <KeyValue label="A" data-testid="row">
          1
        </KeyValue>
      </KeyValueList>,
    );
    expect(out).toContain('class="flex flex-col gap-1.5 text-sm"');
    expect(out).toContain('data-testid="list"');
    expect(out).toContain('class="flex justify-between gap-3"');
    expect(out).toContain('data-testid="row"');
  });

  it("align=start makes a grid with one label column and left-aligned values", () => {
    const out = renderToStaticMarkup(
      <KeyValueList align="start">
        <KeyValue label="Size">1280×720</KeyValue>
      </KeyValueList>,
    );
    expect(out).toContain('class="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1.5 text-sm"');
    expect(out).toContain('<div class="col-span-2 grid grid-cols-subgrid">');
    expect(out).toContain('<dd class="tabular-nums">1280×720</dd>');
    expect(out).not.toContain("text-right");
  });

  it("a KeyValue outside a list keeps the right-aligned default", () => {
    const out = renderToStaticMarkup(<KeyValue label="A">1</KeyValue>);
    expect(out).toContain("justify-between");
    expect(out).toContain("text-right");
  });
});

describe("KeyValue total", () => {
  it("draws a firm rule above a strong label and value", () => {
    const out = renderToStaticMarkup(
      <KeyValueList>
        <KeyValue label="Rent">1</KeyValue>
        <KeyValue label="Total" total>
          2
        </KeyValue>
      </KeyValueList>,
    );
    expect(out.match(/border-slate-300/g)).toHaveLength(1);
    expect(out).toContain("font-semibold");
    expect(out).toContain('<dt class="text-slate-900">Total</dt>');
    expect(out).toContain('<dt class="text-slate-600">Rent</dt>');
  });

  it("keeps the grid in an align=start list", () => {
    const out = renderToStaticMarkup(
      <KeyValueList align="start">
        <KeyValue label="Total" total>
          2
        </KeyValue>
      </KeyValueList>,
    );
    expect(out).toContain("col-span-2 grid grid-cols-subgrid border-t border-slate-300");
    expect(out).not.toContain("text-right");
  });
});

describe("KeyValue tone", () => {
  it("colours the value in the Table cell's tone and leaves the label's ink", () => {
    const out = renderToStaticMarkup(
      <KeyValueList>
        <KeyValue label="Difference" tone="warn">
          −R 12.40
        </KeyValue>
      </KeyValueList>,
    );
    expect(out).toContain('<dd class="text-right tabular-nums text-amber-700">−R 12.40</dd>');
    expect(out).toContain('<dt class="text-slate-600">Difference</dt>');
  });

  it("takes every text tone, the same colours as a TableCell's", () => {
    const tones: [TextTone, string][] = [
      ["muted", "text-slate-500"],
      ["info", "text-blue-700"],
      ["positive", "text-emerald-700"],
      ["warn", "text-amber-700"],
      ["danger", "text-red-700"],
    ];
    for (const [tone, colour] of tones) {
      const out = renderToStaticMarkup(
        <KeyValueList>
          <KeyValue label="A" tone={tone}>
            1
          </KeyValue>
        </KeyValueList>,
      );
      expect(out).toContain(`<dd class="text-right tabular-nums ${colour}">1</dd>`);
    }
  });

  it("is the sum row's warn tone: the rule and strong text stay, the value goes amber", () => {
    const out = renderToStaticMarkup(
      <KeyValueList>
        <KeyValue label="Reconciled" total tone="warn">
          R 30 650
        </KeyValue>
      </KeyValueList>,
    );
    expect(out).toContain("border-t border-slate-300 pt-1.5 font-semibold");
    expect(out).toContain('<dt class="text-slate-900">Reconciled</dt>');
    expect(out).toContain("text-amber-700");
  });

  it("sets no colour on a row with no tone", () => {
    const out = renderToStaticMarkup(
      <KeyValueList>
        <KeyValue label="A">1</KeyValue>
      </KeyValueList>,
    );
    expect(out).not.toMatch(/<dd[^>]*text-(amber|red|emerald|blue)/);
  });
});
