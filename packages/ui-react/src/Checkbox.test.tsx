import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Checkbox } from "./Checkbox.js";

describe("Checkbox", () => {
  it("renders a native checkbox next to its label text", () => {
    const out = renderToStaticMarkup(<Checkbox label="Open now" />);
    expect(out).toContain('type="checkbox"');
    expect(out).toContain("Open now");
  });

  it("passes defaultChecked through as checked", () => {
    const out = renderToStaticMarkup(<Checkbox label="Open now" defaultChecked />);
    expect(out).toContain('checked=""');
  });

  it("puts disabled on the input, not the label", () => {
    const out = renderToStaticMarkup(<Checkbox label="Open now" disabled />);
    expect(out).toMatch(/<input[^>]*disabled/);
    expect(out.match(/<label[^>]*disabled/)).toBeNull();
  });

  it("centres the box on the label by default and puts it on the first line with align=start", () => {
    const centred = renderToStaticMarkup(<Checkbox label="Open now" />);
    expect(centred).toMatch(/<label[^>]*class="[^"]*items-center/);
    expect(centred).not.toContain("items-start");
    expect(centred).toMatch(/<input[^>]*class="[^"]*h-4 w-4 shrink-0/);
    expect(renderToStaticMarkup(<Checkbox label="Paid" size="sm" />)).toMatch(
      /<input[^>]*class="[^"]*h-3\.5 w-3\.5 shrink-0/,
    );

    const start = renderToStaticMarkup(<Checkbox label="Open now" align="start" />);
    expect(start).toMatch(/<label[^>]*class="[^"]*items-start/);
    expect(start).not.toContain("items-center");
    expect(start).toMatch(/<input[^>]*class="[^"]*shrink-0 mt-0\.5/);
    expect(renderToStaticMarkup(<Checkbox label="Paid" size="sm" align="start" />)).toMatch(
      /<input[^>]*class="[^"]*mt-px/,
    );
  });

  it("description is a muted line under the label and the box's aria-describedby", () => {
    const out = renderToStaticMarkup(
      <Checkbox label="Weekly summary" description="One email on Mondays" />,
    );
    const id = out.match(/aria-describedby="([^"]+)"/)?.[1];
    expect(id).toBeTruthy();
    expect(out).toMatch(new RegExp(`<span id="${id}" class="text-xs text-slate-500">One email`));
    expect(out.indexOf("Weekly summary")).toBeLessThan(out.indexOf("One email on Mondays"));
    // The box sits on the label's first line beside a two-line label.
    expect(out).toMatch(/<label[^>]*class="[^"]*items-start/);
    expect(out).not.toContain("items-center");
  });

  it("description keeps a caller's aria-describedby and draws nothing without it", () => {
    const out = renderToStaticMarkup(
      <Checkbox label="L" description="D" aria-describedby="other" />,
    );
    expect(out).toMatch(/aria-describedby="other [^"]+"/);
    const plain = renderToStaticMarkup(<Checkbox label="L" />);
    expect(plain).not.toContain("aria-describedby");
    expect(plain).not.toContain("text-slate-500");
    expect(plain).toMatch(/<\/input>?L<\/label>|\/>L<\/label>/);
  });
});
