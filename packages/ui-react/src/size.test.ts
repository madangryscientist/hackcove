import { describe, expect, it } from "vitest";
import { buttonSizeTables } from "./Button.js";
import { controlTextTables } from "./density.js";
import { iconSizeTables } from "./Icon.js";
import { iconButtonSizeTables } from "./IconButton.js";
import { segmentSizeTables } from "./SegmentedControl.js";
import { type Size, sizeClass } from "./size.js";

const SIZES: Size[] = ["sm", "md", "lg"];

/** Each class of a table entry with `md:` in front: what its twin must hold, written out in full. */
function prefixed(entry: string): string {
  return entry
    .split(" ")
    .map((part) => `md:${part}`)
    .join(" ");
}

const pairs: Array<[string, Record<Size, string>, Record<Size, string>]> = [
  ["Button padding", buttonSizeTables.box, buttonSizeTables.boxMd],
  ["IconButton size", iconButtonSizeTables.size, iconButtonSizeTables.sizeMd],
  ["SegmentedControl padding", segmentSizeTables.size, segmentSizeTables.sizeMd],
  ["Icon box", iconSizeTables.box, iconSizeTables.boxMd],
  ["control text", controlTextTables.text.default, controlTextTables.textMd.default],
  ["compact control text", controlTextTables.text.compact, controlTextTables.textMd.compact],
  ["control leading", controlTextTables.leading, controlTextTables.leadingMd],
];

describe("the md: twin of each size table", () => {
  it.each(pairs)("%s: every entry is the base entry with md: on each class", (_n, base, twin) => {
    for (const size of SIZES) expect(twin[size]).toBe(prefixed(base[size]));
  });
});

describe("sizeClass", () => {
  const [, base, twin] = pairs[0]!;
  it("returns the table entry unchanged for a plain size", () => {
    for (const size of SIZES) expect(sizeClass(base, twin, size)).toBe(base[size]);
  });

  it("joins the base entry and the twin's md entry for a responsive size", () => {
    expect(sizeClass(base, twin, { base: "md", md: "lg" })).toBe(`${base.md} ${twin.lg}`);
  });
});
