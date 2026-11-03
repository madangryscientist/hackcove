/**
 * Read @hackcove/ui's own class tables without touching packages/ui: render each web component
 * through react-dom/server and keep the class strings it emits, per variant and per part.
 *
 *   bun scripts/harvest-tables.tsx        writes src/generated/tables.json
 *
 * React and react-dom come from packages/ui's own install, so the components and the renderer
 * share one React. Bun resolves ui's `./x.js` specifiers to the `.tsx` sources; Metro does not,
 * which is why the native app reads this JSON rather than importing ui.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createElement as h, type ReactElement } from "../../../packages/ui/node_modules/react";
import { renderToStaticMarkup } from "../../../packages/ui/node_modules/react-dom/server";
import {
  Button,
  Caption,
  Card,
  Input,
  Overline,
  PageHeading,
  SectionHeading,
  Stack,
  SubsectionHeading,
  Text,
} from "../../../packages/ui/src/index.ts";

const OUT = resolve(import.meta.dir, "../src/generated/tables.json");

/** The class attribute of every element in the markup, in document order. */
function classes(el: ReactElement): string[] {
  const html = renderToStaticMarkup(el);
  return [...html.matchAll(/<[a-z0-9]+[^>]*?\sclass="([^"]*)"/g)].map((m) =>
    m[1]!.replace(/&amp;/g, "&"),
  );
}
const one = (el: ReactElement) => classes(el)[0]!;

const SIZES = ["sm", "md", "lg"] as const;
const VARIANTS = ["primary", "outline", "ghost", "link"] as const;
const TONES = ["default", "positive", "danger"] as const;

const button: Record<string, string> = {};
for (const variant of VARIANTS)
  for (const tone of TONES)
    for (const size of SIZES)
      for (const disabled of [false, true])
        button[`${variant}.${tone}.${size}${disabled ? ".disabled" : ""}`] = one(
          h(Button, { variant, tone, size, disabled }, "x"),
        );

const input: Record<string, string> = {};
for (const size of SIZES)
  for (const disabled of [false, true])
    input[`${size}${disabled ? ".disabled" : ""}`] = one(
      h(Input, { size, disabled, "aria-label": "x" }),
    );

const COLORS = ["default", "secondary", "tertiary", "muted", "brand"] as const;
const TEXT_TONES = ["muted", "info", "positive", "warn", "danger"] as const;
const text: Record<string, string> = {
  pageHeading: one(h(PageHeading, {}, "x")),
  sectionHeading: one(h(SectionHeading, {}, "x")),
  "sectionHeading.rule": one(h(SectionHeading, { rule: true }, "x")),
  subsectionHeading: one(h(SubsectionHeading, {}, "x")),
  overline: one(h(Overline, {}, "x")),
  caption: one(h(Caption, {}, "x")),
  "text.strong": one(h(Text, { strong: true }, "x")),
};
for (const color of COLORS) text[`text.color.${color}`] = one(h(Text, { color }, "x"));
for (const tone of TEXT_TONES) text[`text.tone.${tone}`] = one(h(Text, { tone }, "x"));
text["text"] = one(h(Text, {}, "x"));

// A Card with a title and a count: section > div(heading row) > h2(title) + span(count), then the body.
const [cardRoot, cardHeadingRow, cardTitle, cardCount] = classes(
  h(Card, { title: "x", count: 1 }, h("i", {})),
);
const card = {
  root: cardRoot!,
  headingRow: cardHeadingRow!,
  title: cardTitle!,
  count: cardCount!,
};

const stack: Record<string, string> = {};
for (const gap of ["xs", "sm", "md", "lg"] as const)
  stack[gap] = one(h(Stack, { gap }, h("i", {})));

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({ button, input, text, card, stack }, null, 2) + "\n");
const count =
  Object.keys(button).length + Object.keys(input).length + Object.keys(text).length + 4 + 4;
console.log(`harvested ${count} class strings → ${OUT}`);
