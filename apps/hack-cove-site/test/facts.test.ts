/*
 * Every product claim on the home page and /pixelslash/ against the products' own facts files, read
 * at the commits facts.sha.json pins:
 *
 * - each claim cites facts (or names a product with no facts file), and every cited id is in its
 *   product's FACTS.md;
 * - a claim citing a Planned fact, or naming an unbuilt product, never sits under a today label, and
 *   one citing a Planned fact reads as not built yet;
 * - the wrong claims found on 2026-11-17 are not on the built site.
 *
 * It checks that a cited fact exists, not that it backs the sentence: that is the citation's author's
 * call, read in review. A claim is any object with `text` and `facts` (or `unbuilt`), found by walking
 * the content below; the types make a product claim an object, so a bare string fails typecheck.
 * Each check lists every claim that breaks it, so a failure names them all.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";
import type { Claim, FactId } from "../src/content/claims";
import { site } from "../src/content/site";
import { FACTS, type Facts, factKind, factsSource, parseFacts } from "./facts";

const SITE = resolve(import.meta.dirname, "..");
const REPO = resolve(SITE, "../..");
const DIST = resolve(SITE, "dist");

/** The content that holds product claims, by the name a failure prints. */
const CONTENT: Record<string, unknown> = {
  "home.lead": site.home.lead,
  "home.fit.questions": site.home.fit.questions,
  products: site.products,
  pixelslash: site.pixelslash,
};

/** Words that make a sentence read as not built yet. */
const READS_PLANNED = /\b(planned|will|would|next|not built|not yet|coming)\b/i;

/** Where a claim sits: a product card's status says whether it works today or is coming soon. */
type Label = "today" | "coming-soon" | "none";

type Found = { where: string; claim: Claim; label: Label };

function isClaim(value: object): value is Claim {
  return (
    "text" in value && typeof value.text === "string" && ("facts" in value || "unbuilt" in value)
  );
}

/** The label a product card's status puts on what it holds, else the one it sits under. */
function labelOf(value: object, outer: Label): Label {
  if (!("status" in value) || typeof value.status !== "string") return outer;
  return value.status === "coming-soon" ? "coming-soon" : "today";
}

/** Every claim under a value, with the label it sits under. */
function claimsIn(value: unknown, where: string, outer: Label, out: Found[]): Found[] {
  if (typeof value !== "object" || value === null) return out;
  if (isClaim(value)) {
    out.push({ where, claim: value, label: outer });
    return out;
  }
  const label = labelOf(value, outer);
  for (const [key, child] of Object.entries(value)) claimsIn(child, `${where}.${key}`, label, out);
  return out;
}

const CLAIMS = Object.entries(CONTENT).map(([name, value]) => ({
  name,
  claims: claimsIn(value, name, "none", []),
}));
const ALL = CLAIMS.flatMap((entry) => entry.claims);

const factsOf = (claim: Claim): readonly FactId[] => ("facts" in claim ? claim.facts : []);
const unbuiltOf = (claim: Claim): readonly string[] => claim.unbuilt ?? [];
const repoOf = (claim: Claim): readonly string[] => ("repo" in claim ? (claim.repo ?? []) : []);
const plannedOf = (claim: Claim) => factsOf(claim).filter((id) => factKind(id) === "planned");
const show = ({ where, claim }: Found) => `${where}: "${claim.text}"`;

/** The sections of a facts file that came out empty. */
function emptySections(product: string, facts: Facts): string[] {
  const sizes: Record<string, number> = {
    "What it is": facts.whatItIs.length,
    Today: facts.today.size,
    Licence: facts.licence.length,
    "Where it runs": facts.whereItRuns.size,
  };
  return Object.entries(sizes)
    .filter(([, size]) => size === 0)
    .map(([section]) => `${product}: ${section} is empty`);
}

/** A Planned fact or an unbuilt product on a card that says it works today. */
function notBuiltUnderToday({ claim, label }: Found): boolean {
  return label === "today" && plannedOf(claim).length + unbuiltOf(claim).length > 0;
}

/** A Planned fact in a sentence that neither sits on a coming-soon card nor reads as planned. */
function plannedReadsBuilt({ claim, label }: Found): boolean {
  if (plannedOf(claim).length === 0 || label === "coming-soon") return false;
  return !READS_PLANNED.test(claim.text);
}

describe("the facts files", () => {
  test("each parses into its sections, with a licence", () => {
    const empty = [...FACTS].flatMap(([product, facts]) => emptySections(product, facts));
    expect(FACTS.size).toBe(5);
    expect(empty).toEqual([]);
  });

  test("a file of another shape fails, naming the product and the line", () => {
    const good = factsSource("flakeslash");
    expect(() => parseFacts("flakeslash", good.replace("## Planned", "## Later"))).toThrow(
      /^flakeslash FACTS\.md line \d+: expected "## Planned"/,
    );
    expect(() =>
      parseFacts("flakeslash", good.replace("- `local-store`:", "- local-store:")),
    ).toThrow(/^flakeslash FACTS\.md line \d+: expected a fact line/);
  });

  test("an id resolves to the section it sits in", () => {
    expect(factKind("flakeslash/what-it-is")).toBe("what");
    expect(factKind("flakeslash/flake-same-commit")).toBe("today");
    expect(factKind("flakeslash/pr-check")).toBe("planned");
    expect(factKind("pixelslash/licence")).toBe("licence");
    expect(factKind("uislash/docs-site")).toBe("where");
    expect(factKind("toggleslash/no-such-fact")).toBeUndefined();
  });
});

describe("every product claim", () => {
  test("is an object in each place that holds claims, never a bare string", () => {
    const without = CLAIMS.filter(({ claims }) => claims.length === 0).map(({ name }) => name);
    expect(without).toEqual([]);
  });

  test("cites at least one fact, or names a product with no facts file", () => {
    const bare = ALL.filter(({ claim }) => factsOf(claim).length + unbuiltOf(claim).length === 0);
    expect(bare.map(show)).toEqual([]);
  });

  test("cites only ids that are in its product's facts file at the pinned commit", () => {
    const unknown = ALL.flatMap(({ where, claim }) =>
      factsOf(claim)
        .filter((id) => factKind(id) === undefined)
        .map((id) => `${where} cites ${id}`),
    );
    expect(unknown).toEqual([]);
  });

  test("names only files of this repository that exist", () => {
    const missing = ALL.flatMap(({ where, claim }) =>
      repoOf(claim)
        .filter((path) => !existsSync(resolve(REPO, path)))
        .map((path) => `${where}: ${path}`),
    );
    expect(missing).toEqual([]);
  });

  test("never puts a Planned fact or an unbuilt product under a today label", () => {
    const wrong = ALL.filter(notBuiltUnderToday);
    expect(wrong.map(show)).toEqual([]);
  });

  test("reads as not built yet when it cites a Planned fact", () => {
    const wrong = ALL.filter(plannedReadsBuilt);
    expect(wrong.map(show)).toEqual([]);
  });

  test("the checks catch a bare claim, an unknown id and a Planned fact under a today label", () => {
    const fake = claimsIn(
      {
        status: "available",
        pitch: { text: "Blocks the merge.", facts: ["flakeslash/pr-check"] },
        features: [{ text: "Does a thing.", facts: ["flakeslash/no-such-fact"] }],
      },
      "fake",
      "none",
      [],
    );
    expect(fake.map(({ label }) => label)).toEqual(["today", "today"]);
    expect(fake.flatMap(({ claim }) => plannedOf(claim))).toEqual(["flakeslash/pr-check"]);
    expect(fake.flatMap(({ claim }) => factsOf(claim).map(factKind))).toEqual([
      "planned",
      undefined,
    ]);
  });
});

/** Visible text: tags and scripts dropped, the escapes React and Astro write undone, spaces folded. */
function visible(html: string): string {
  return html
    .replace(/<(script|style|template)[\s\S]*?<\/\1>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replaceAll("&#39;", "'")
    .replaceAll("&#x27;", "'")
    .replaceAll("&quot;", '"')
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** The wrong claims found on 2026-11-17, each with the fact it broke. A regression guard. */
const WRONG: readonly { phrase: string; why: string }[] = [
  { phrase: "turning one on will do", why: "no toggleslash fact backs a verdict" },
  { phrase: "flaky test spotter on the way", why: "flakeslash/flake-same-commit is today" },
  { phrase: "It will find checks", why: "flakeslash/flake-same-commit is today" },
  { phrase: "Paid hosting is planned", why: "pixelslash/hosted-review-app is today" },
];

function builtPages(): string[] {
  if (!existsSync(resolve(DIST, "index.html"))) {
    throw new Error(
      `No built site in ${DIST}. Run the build first: bunx moon run hack-cove-site:build.`,
    );
  }
  return readdirSync(DIST, { recursive: true, encoding: "utf8" }).filter((file) =>
    file.endsWith(".html"),
  );
}

describe("the built site", () => {
  test("carries none of the wrong claims found on 2026-11-17", () => {
    const pages = builtPages();
    const found = pages.flatMap((file) => {
      const words = visible(readFileSync(resolve(DIST, file), "utf8"));
      return WRONG.filter(({ phrase }) => words.includes(phrase)).map(
        ({ phrase, why }) => `${file}: "${phrase}" (${why})`,
      );
    });
    expect(pages.length).toBeGreaterThan(0);
    expect(found).toEqual([]);
  });
});
