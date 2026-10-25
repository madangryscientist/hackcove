import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { KeyValue, KeyValueList } from "./KeyValueList.js";

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
