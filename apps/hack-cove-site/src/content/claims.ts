/**
 * A product claim on this site: its words and the facts that back it. A claim is any sentence that
 * says what a product does, has, costs, keeps private or will do. Commands, install lines, links,
 * image alts, headings and labels are not claims.
 *
 * The facts are each product's FACTS.md, at the commit facts.sha.json pins (scripts/fetch-facts.ts
 * downloads them). test/facts.test.ts holds every claim to those files: each cited id must be in its
 * product's file, and a claim citing a Planned fact must never sit under a today label.
 */

/** The products whose FACTS.md the site reads, each by its repository name. */
export const FACTS_PRODUCTS = [
  "pixelslash",
  "toggleslash",
  "flakeslash",
  "taskslash",
  "uislash",
] as const;
export type FactsProduct = (typeof FACTS_PRODUCTS)[number];

/**
 * A fact by its product and its id in that product's FACTS.md: `pixelslash/compare-two-urls`.
 * `what-it-is` names the file's What it is paragraph, which has no id of its own.
 */
export type FactId = `${FactsProduct}/${string}`;

/** A product with no repository yet, so no facts file: a claim about it must read as not built. */
export type Unbuilt = "ThriftLoop";

/**
 * A claim cites at least one fact (and may also name an unbuilt product or files in this repository),
 * or, for a product with no facts file, names that product.
 */
export type Claim =
  | {
      text: string;
      /** The facts that back the sentence. */
      facts: readonly [FactId, ...FactId[]];
      /** Products the sentence names that have no facts file yet. */
      unbuilt?: readonly Unbuilt[];
      /** Files in this repository that back the rest, for a claim about this repository's own use. */
      repo?: readonly string[];
    }
  | { text: string; unbuilt: readonly [Unbuilt, ...Unbuilt[]] };
