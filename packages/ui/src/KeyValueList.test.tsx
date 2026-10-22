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

  it("passes className and other props through to the dl and the row", () => {
    const out = renderToStaticMarkup(
      <KeyValueList className="mt-4" data-testid="list">
        <KeyValue label="A" className="py-1" data-testid="row">
          1
        </KeyValue>
      </KeyValueList>,
    );
    expect(out).toContain('class="flex flex-col gap-1.5 text-sm mt-4"');
    expect(out).toContain('data-testid="list"');
    expect(out).toContain('class="flex justify-between gap-3 py-1"');
    expect(out).toContain('data-testid="row"');
  });
});
