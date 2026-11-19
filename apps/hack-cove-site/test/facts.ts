/**
 * Each product's facts, read from the FACTS.md that scripts/fetch-facts.ts downloads into
 * .sources/facts at the commit facts.sha.json pins (`bunx moon run hack-cove-site:test` fetches first).
 *
 * A FACTS.md has a fixed shape: a `# <Name> facts` title, a `Checked against ...` line, then the
 * sections What it is (a paragraph), Today, Planned, Licence and Where it runs, each fact a line
 * `` - `id`: text ``. A file of any other shape throws, naming the product and the line.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { FACTS_PRODUCTS, type FactId, type FactsProduct } from "../src/content/claims";

export type Facts = {
  whatItIs: string;
  today: ReadonlyMap<string, string>;
  planned: ReadonlyMap<string, string>;
  licence: string;
  whereItRuns: ReadonlyMap<string, string>;
};

const SECTIONS = ["What it is", "Today", "Planned", "Licence", "Where it runs"] as const;
type SectionName = (typeof SECTIONS)[number];

/** The id a claim cites for a product's What it is paragraph, which has no id of its own. */
export const WHAT_IT_IS = "what-it-is";

type Line = { n: number; text: string };
type Fail = (line: number, why: string) => never;

/** One header line, which must match its pattern. */
function header(line: Line | undefined, pattern: RegExp, want: string, fail: Fail): void {
  const { n, text } = line ?? { n: 1, text: "" };
  if (!pattern.test(text)) fail(n, `expected "${want}", found "${text}"`);
}

/** The title and the `Checked against` line, which open every file. */
function checkHeader([title, checked]: Line[], fail: Fail): void {
  header(title, /^# \S.* facts$/, "# <Name> facts", fail);
  header(checked, /^Checked against .+/, "Checked against ...", fail);
}

/** The lines under each section heading, the headings in their fixed order. */
function splitSections(lines: Line[], fail: Fail): Map<SectionName, Line[]> {
  const sections = new Map<SectionName, Line[]>();
  let current: Line[] | undefined;
  for (const line of lines) {
    const heading = /^## (.+)$/.exec(line.text)?.[1];
    if (heading === undefined) {
      if (!current) fail(line.n, `text before the first section: "${line.text}"`);
      current?.push(line);
      continue;
    }
    const expected = SECTIONS[sections.size];
    if (expected === undefined || heading !== expected) {
      fail(line.n, `expected "## ${expected ?? "(none)"}", found "${line.text}"`);
    }
    current = [];
    sections.set(expected ?? "What it is", current);
  }
  return sections;
}

/** A section of fact lines, by id. */
function factList(lines: Line[], section: string, fail: Fail): Map<string, string> {
  const list = new Map<string, string>();
  for (const line of lines) {
    const [, id, text] = /^- `([a-z0-9-]+)`: (.+)$/.exec(line.text) ?? [];
    if (id === undefined || text === undefined) {
      return fail(line.n, `expected a fact line "- \`id\`: text", found "${line.text}"`);
    }
    if (list.has(id)) fail(line.n, `the id ${id} appears twice in ${section}`);
    list.set(id, text);
  }
  return list;
}

/** Reads one FACTS.md. Throws naming the product and the line when it is not the fixed shape. */
export function parseFacts(product: FactsProduct, source: string): Facts {
  const fail: Fail = (line, why) => {
    throw new Error(`${product} FACTS.md line ${line}: ${why}`);
  };
  const all = source.split("\n");
  const lines = all
    .map((text, i) => ({ n: i + 1, text: text.trimEnd() }))
    .filter((line) => line.text !== "");
  checkHeader(lines, fail);
  const sections = splitSections(lines.slice(2), fail);
  const missing = SECTIONS.find((name) => !sections.has(name));
  if (missing) fail(all.length, `missing the section "## ${missing}"`);
  const section = (name: SectionName) => sections.get(name) ?? [];
  const whatItIs = section("What it is")
    .map((line) => line.text.trim())
    .join(" ");
  if (whatItIs === "") fail(all.length, "the What it is section is empty");
  const licence = factList(section("Licence"), "Licence", fail);
  const text = licence.get("licence");
  if (text === undefined || licence.size !== 1) {
    return fail(all.length, "Licence must hold exactly one fact, `licence`");
  }
  return {
    whatItIs,
    today: factList(section("Today"), "Today", fail),
    planned: factList(section("Planned"), "Planned", fail),
    licence: text,
    whereItRuns: factList(section("Where it runs"), "Where it runs", fail),
  };
}

const SOURCES = resolve(import.meta.dirname, "../.sources/facts");

/** The facts file of one product, as downloaded. */
export function factsSource(product: FactsProduct): string {
  const path = resolve(SOURCES, `${product}.md`);
  if (!existsSync(path)) {
    throw new Error(`No ${path}. Fetch the facts first: bunx moon run hack-cove-site:fetch-facts.`);
  }
  return readFileSync(path, "utf8");
}

export const FACTS: ReadonlyMap<FactsProduct, Facts> = new Map(
  FACTS_PRODUCTS.map((product) => [product, parseFacts(product, factsSource(product))]),
);

/** Where a fact sits in its product's file, or undefined when the file has no such id. */
export function factKind(
  id: FactId,
): "what" | "today" | "planned" | "licence" | "where" | undefined {
  const product = FACTS_PRODUCTS.find((name) => id.startsWith(`${name}/`));
  const facts = product && FACTS.get(product);
  const key = id.slice(id.indexOf("/") + 1);
  if (!facts) return undefined;
  if (key === WHAT_IT_IS) return "what";
  if (facts.today.has(key)) return "today";
  if (facts.planned.has(key)) return "planned";
  if (key === "licence") return "licence";
  return facts.whereItRuns.has(key) ? "where" : undefined;
}
