import { expect, it } from "vitest";
import { utilitiesOf } from "./utilities.js";

const css = `
/* a comment .dark .text-red-500 { color: red } */
@custom-variant dark (&:where(.dark, .dark *));
.dark { color-scheme: dark; }
.dark .text-slate-900,
.dark .text-slate-800 { color: #cdd6f4; }
.dark .hover\\:bg-violet-700:hover { background-color: #b4befe }
.dark .bg-white\\/80{background-color:#1e1e2eb3}
.dark .placeholder\\:text-slate-400::placeholder { color: #7f849c; }
.dark .disabled\\:opacity-50:disabled:is(.bg-violet-600, .bg-red-600) { opacity: 1; color: #fff }
.dark .text-slate-500 { color: #111111; background-color: #222222; }
.dark .text-slate-500 { color: #a6adc8; }
.other .text-slate-900 { color: red; }
`;

it("keys each rule by the utility as a component writes it, with Tailwind's escapes undone", () => {
  const utilities = utilitiesOf(css);
  expect(utilities.get("text-slate-900")).toEqual({ color: "#cdd6f4" });
  expect(utilities.get("text-slate-800")).toEqual({ color: "#cdd6f4" });
  expect(utilities.get("hover:bg-violet-700")).toEqual({ "background-color": "#b4befe" });
  expect(utilities.get("bg-white/80")).toEqual({ "background-color": "#1e1e2eb3" });
  expect(utilities.get("placeholder:text-slate-400")).toEqual({ color: "#7f849c" });
});

it("ignores comments, at-rules, the scope's own rule and other scopes", () => {
  const utilities = utilitiesOf(css);
  expect(utilities.has("text-red-500")).toBe(false);
  expect(utilities.get("text-slate-900")?.color).toBe("#cdd6f4");
  expect(utilities.has("dark")).toBe(false);
});

it("lets a later rule for the same utility win, property by property", () => {
  expect(utilitiesOf(css).get("text-slate-500")).toEqual({
    color: "#a6adc8",
    "background-color": "#222222",
  });
});

it("reads minified CSS the same as source", () => {
  const minified =
    ".dark{color-scheme:dark}.dark .text-slate-500{color:#a6adc8}.dark .hover\\:bg-red-50:hover{background-color:#f38ba81a}";
  const utilities = utilitiesOf(minified);
  expect(utilities.get("text-slate-500")).toEqual({ color: "#a6adc8" });
  expect(utilities.get("hover:bg-red-50")).toEqual({ "background-color": "#f38ba81a" });
});

it("is empty for CSS with no scope class", () => {
  expect(utilitiesOf(".text-slate-900 { color: red }").size).toBe(0);
});
