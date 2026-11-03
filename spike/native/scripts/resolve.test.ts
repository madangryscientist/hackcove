/** D2 proof: every class string ui's four components emit resolves natively, in every theme, with no unknown class. */
import { describe, expect, test } from "bun:test";
import tables from "../src/generated/tables.json";
import generated from "../src/generated/themes.json";
import { pick, resolve, type ThemeMap } from "../src/hc/resolve";

const strings = Object.entries(tables).flatMap(([part, t]) =>
  Object.entries(t as Record<string, string>).map(([k, v]) => [`${part}.${k}`, v] as const),
);
const themes = generated.themes as unknown as Record<string, ThemeMap>;

describe("resolve", () => {
  for (const [name, theme] of Object.entries(themes))
    test(`${name}: all ${strings.length} harvested class strings resolve`, () => {
      for (const [, cls] of strings) expect(() => resolve(cls, theme)).not.toThrow();
    });

  test("Button md primary: 38px tall box, label text split out", () => {
    const r = resolve(
      (tables.button as Record<string, string>)["primary.default.md"]!,
      themes.default!,
    );
    const { box, text } = pick(r);
    expect((box.paddingVertical! as number) * 2 + 20 + 2).toBe(38); // py-2 + text-sm/20 + border
    expect(text.fontSize).toBe(14);
    expect(r.box.pressed.backgroundColor).toBeDefined();
  });

  test("Mocha: a disabled solid Button takes the compound flat look", () => {
    const r = resolve(
      (tables.button as Record<string, string>)["primary.default.md.disabled"]!,
      themes["catppuccin-mocha"]!,
    );
    expect(pick(r, { disabled: true }).box.opacity).toBe(1);
  });

  test("an unknown class throws", () => {
    expect(() => resolve("grid-cols-3", themes.default!)).toThrow(/unknown class/);
  });
});
