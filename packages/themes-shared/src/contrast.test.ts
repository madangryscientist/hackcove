import { describe, expect, it } from "vitest";
import { contrastFailures, propertyOf, EXEMPTIONS, type Palette } from "./contrast.js";

const palette: Palette = {
  canvas: ["bg-gray-50"],
  surface: ["bg-white"],
  subtle: ["bg-slate-50"],
  inset: ["bg-slate-100"],
  ink: ["text-slate-900", "text-slate-400", "text-slate-300", "placeholder:text-slate-400"],
  line: ["border-slate-300", "border-slate-200"],
};

const cssProperty = (name: string): string => {
  if (name.includes(".text-")) return "color";
  if (/(?:^|:)bg-/.test(name)) return "background-color";
  if (name.startsWith("border-")) return "border-color";
  return "color";
};

const theme = (overrides: Record<string, string> = {}): string => {
  const colours: Record<string, string> = {
    "bg-gray-50": "#181825",
    "bg-white": "#1e1e2e",
    "bg-slate-50": "#313244",
    "bg-slate-100": "#3b3d50",
    "text-slate-900": "#cdd6f4",
    "text-slate-400": "#969cb5",
    "text-slate-300": "#6c7086",
    "placeholder\\:text-slate-400::placeholder": "#969cb5",
    "border-slate-300": "#7f849c",
    "border-slate-200": "#313244",
    ...overrides,
  };
  return `.dark { color-scheme: dark; }\n${Object.entries(colours)
    .map(([name, value]) => `.dark .${name} { ${cssProperty(name)}: ${value}; }`)
    .join("\n")}`;
};

describe("contrastFailures", () => {
  it("is empty for a theme that clears every bar", () => {
    expect(contrastFailures(theme(), palette)).toEqual([]);
  });

  it("names the pair, both colours, the ratio and the bar", () => {
    const failures = contrastFailures(theme({ "text-slate-900": "#6c7086" }), palette);
    expect(failures).toContain(
      "ink text: text-slate-900 #6c7086 on bg-white #1e1e2e is 3.35:1, needs 4.5:1",
    );
    expect(failures.every((line) => /^[\w ]+: .+ is \d+\.\d\d:1, needs [\d.]+:1$/.test(line))).toBe(
      true,
    );
  });

  it("measures a control edge at 3:1, on every narrow surface", () => {
    const failures = contrastFailures(theme({ "border-slate-300": "#45475a" }), palette);
    expect(failures.filter((line) => line.startsWith("neutral control edge"))).toHaveLength(3);
    expect(failures[0]).toMatch(/needs 3:1$/);
  });

  it("measures muted text and the placeholder on the page surfaces, not on the inset fill", () => {
    expect(contrastFailures(theme({ "text-slate-400": "#6c7086" }), palette)).toHaveLength(3);
  });

  it("holds neutral ink to AA on the inset fill as well", () => {
    const failures = contrastFailures(theme({ "bg-slate-100": "#cdd6f4" }), palette);
    expect(failures.some((line) => line.includes("on bg-slate-100"))).toBe(true);
  });

  it("exempts dimmed text by role, with a reason", () => {
    expect(contrastFailures(theme({ "text-slate-300": "#313244" }), palette)).toEqual([]);
    const dimmed = EXEMPTIONS.find((e) => e.role === "ink" && e.match.test("text-slate-300"));
    expect(dimmed?.why).toMatch(/inactive/);
  });

  it("fails a palette utility that no rule measures and no exemption lists", () => {
    const failures = contrastFailures(theme(), { ...palette, mystery: ["bg-teal-500"] });
    expect(failures).toEqual([
      "mystery: bg-teal-500 has no contrast rule; measure it in contrastRules.ts or exempt it with a reason",
    ]);
  });

  it("says which utility the theme leaves unset or unreadable", () => {
    const unset = theme().replace(/\.dark \.text-slate-900[^\n]*\n/, "");
    expect(contrastFailures(unset, palette)).toContain(
      "ink text: text-slate-900: the theme sets no color",
    );
    const bad = contrastFailures(theme({ "text-slate-900": "var(--ink)" }), palette);
    expect(bad).toContain('ink text: text-slate-900: cannot read the colour "var(--ink)"');
  });

  it("reads the same theme from minified CSS", () => {
    const minified = theme()
      .replace(/\n/g, "")
      .replace(/ {2,}/g, " ")
      .replace(/: /g, ":")
      .replace(/ \{ /g, "{")
      .replace(/; \}/g, ";}");
    expect(contrastFailures(minified, palette)).toEqual([]);
  });

  it("takes CSS text, so a theme split over two files is checked from their concatenation", () => {
    const whole = theme();
    const [head = "", ...rest] = whole.split("\n");
    const half = Math.ceil(rest.length / 2);
    const joined = [head, ...rest.slice(0, half)].join("\n") + "\n" + rest.slice(half).join("\n");
    expect(contrastFailures(joined, palette)).toEqual([]);
  });
  it("measures a categorical colour at 3:1 on every narrow surface, named", () => {
    const withScale: Palette = { ...palette, categorical: ["text-indigo-600"] };
    expect(contrastFailures(theme({ "text-indigo-600": "#89b4fa" }), withScale)).toEqual([]);
    const failures = contrastFailures(theme({ "text-indigo-600": "#45475a" }), withScale);
    expect(failures).toHaveLength(3);
    expect(
      failures.every((line) => line.startsWith("chart colour: text-indigo-600 #45475a on ")),
    ).toBe(true);
  });

  it("measures a hovered button's text on its Callout tint with the hover fill stacked on top", () => {
    const withDanger: Palette = {
      ...palette,
      danger: ["text-red-700", "bg-red-50", "hover:bg-red-50"],
    };
    // The text clears the white tint alone, and fails once the translucent grey hover fill sits on it.
    const css = theme({
      "text-red-700": "#7a0000",
      "bg-red-50": "#ffffff",
      "hover\\:bg-red-50:hover": "rgba(0, 0, 0, 0.5)",
    });
    const failures = contrastFailures(css, withDanger);
    expect(
      failures.some(
        (line) =>
          line.startsWith("button text on a tone tint: text-red-700 ") &&
          line.includes("on bg-red-50 + hover:bg-red-50"),
      ),
    ).toBe(true);
    expect(
      failures.some(
        (line) =>
          line.startsWith("button text on a tone tint: text-red-700 ") &&
          line.includes("on bg-red-50 #"),
      ),
    ).toBe(false);
  });

  it("reads a danger text lifted only where it is drawn on a Callout tint", () => {
    const withDanger: Palette = { ...palette, danger: ["text-red-700", "bg-red-50"] };
    // The global red is too pale for the red-50 tint; the scoped one, drawn on that tint, is dark enough.
    const global = theme({ "text-red-700": "#f0b0b0", "bg-red-50": "#ffffff" });
    expect(
      contrastFailures(global, withDanger).some((line) =>
        line.startsWith("button text on a tone tint: text-red-700"),
      ),
    ).toBe(true);
    const scoped = theme({
      "text-red-700": "#f0b0b0",
      "bg-red-50": "#ffffff",
      "bg-red-50 .text-red-700": "#7a0000",
    });
    expect(
      contrastFailures(scoped, withDanger).some((line) =>
        line.startsWith("button text on a tone tint: text-red-700"),
      ),
    ).toBe(false);
  });

  it("pairs a button's text only with its own tone's hover fill", () => {
    const paired: Palette = {
      ...palette,
      danger: ["text-red-700", "bg-red-50"],
      positive: ["bg-emerald-50", "hover:bg-emerald-50"],
    };
    // A translucent dark fill would fail red text, but a danger button never sits on the positive hover fill.
    const css = theme({
      "text-red-700": "#7a0000",
      "bg-red-50": "#ffffff",
      "bg-emerald-50": "#ffffff",
      "hover\\:bg-emerald-50:hover": "rgba(0, 0, 0, 0.5)",
    });
    const failures = contrastFailures(css, paired);
    expect(
      failures.some(
        (line) =>
          line.startsWith("button text on a tone tint: text-red-700 ") &&
          line.includes("hover:bg-emerald-50"),
      ),
    ).toBe(false);
  });

  it("measures an outline button's accent text on another tone's tint, named", () => {
    const withTones: Palette = {
      ...palette,
      accent: ["text-violet-600", "bg-violet-50"],
      positive: ["bg-emerald-50"],
    };
    // The accent text clears the page and its own tint, but not the light emerald tint of a positive Callout.
    const split = theme({
      "text-violet-600": "#cba6f7",
      "bg-violet-50": "#2a2540",
      "bg-emerald-50": "#a6e3a1",
    });
    const failures = contrastFailures(split, withTones);
    expect(
      failures.filter((line) =>
        line.startsWith("button text on a tone tint: text-violet-600 #cba6f7 on bg-emerald-50"),
      ),
    ).not.toHaveLength(0);
    expect(failures.some((line) => line.startsWith("accent text on its tint"))).toBe(false);
    // Negative control: the own tint is the failing one here, so the rule must not name bg-violet-50.
    const ownTint = contrastFailures(
      theme({ "text-violet-600": "#cba6f7", "bg-violet-50": "#e6e0f8" }),
      { ...palette, accent: ["text-violet-600", "bg-violet-50"] },
    );
    expect(ownTint.some((line) => line.startsWith("accent text on its tint"))).toBe(true);
    expect(ownTint.some((line) => line.startsWith("button text on a tone tint"))).toBe(false);
  });
});

describe("propertyOf", () => {
  it("reads the CSS property from the utility's own name, past any variants", () => {
    expect(propertyOf("hover:bg-violet-700")).toBe("background-color");
    expect(propertyOf("placeholder:text-slate-400")).toBe("color");
    expect(propertyOf("has-focus-visible:outline-violet-600")).toBe("outline-color");
    expect(propertyOf("accent-violet-600")).toBe("accent-color");
    expect(propertyOf("rounded-md")).toBeUndefined();
  });
});
