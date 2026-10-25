import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FileDrop } from "./FileDrop.js";

describe("FileDrop", () => {
  it("is a dashed label around a file input and the prompt", () => {
    const out = renderToStaticMarkup(<FileDrop>Drop a statement here</FileDrop>);
    expect(out.startsWith("<label")).toBe(true);
    expect(out).toContain("border-dashed");
    expect(out).toContain('type="file"');
    expect(out).toContain("Drop a statement here");
  });

  it("covers the zone with the input, so a drop lands on it", () => {
    const out = renderToStaticMarkup(<FileDrop>Drop</FileDrop>);
    expect(out).toMatch(/<input[^>]*class="[^"]*absolute inset-0 h-full w-full[^"]*opacity-0/);
  });

  it("sends everything to the input", () => {
    const out = renderToStaticMarkup(
      <FileDrop accept=".csv" multiple name="statement">
        Drop
      </FileDrop>,
    );
    expect(out).toContain('accept=".csv"');
    expect(out).toContain('multiple=""');
    expect(out).toContain('name="statement"');
  });

  it("dims the zone when the input is disabled", () => {
    const out = renderToStaticMarkup(<FileDrop disabled>Drop</FileDrop>);
    expect(out).toMatch(/^<label[^>]*class="[^"]*opacity-50/);
    expect(out).toContain('disabled=""');
  });
});

describe("FileDrop size", () => {
  it("sm is a compact chip", () => {
    expect(renderToStaticMarkup(<FileDrop size="sm">Drop</FileDrop>)).toMatch(
      /^<label[^>]*class="[^"]*px-3 py-2/,
    );
    expect(renderToStaticMarkup(<FileDrop>Drop</FileDrop>)).toMatch(
      /^<label[^>]*class="[^"]*px-4 py-6/,
    );
  });

  it("does not leak size onto the input", () => {
    expect(renderToStaticMarkup(<FileDrop size="sm">Drop</FileDrop>)).not.toContain('size="sm"');
  });
});
