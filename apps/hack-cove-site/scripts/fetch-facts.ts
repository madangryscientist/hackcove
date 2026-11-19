/**
 * Downloads each product's FACTS.md, at the commit facts.sha.json pins for that product, into
 * .sources/facts/<product>.md (gitignored). test/facts.test.ts holds every product claim on the site
 * to these files. A failed download exits non-zero naming the product and the commit.
 *
 * The repositories are public, so the fetch is an unauthenticated GET. Moving a pin is a one-line
 * change to facts.sha.json.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { FACTS_PRODUCTS, type FactsProduct } from "../src/content/claims";

/** The repository each product's FACTS.md comes from, as owner/repo. */
const FACTS_REPOS: Record<FactsProduct, string> = {
  pixelslash: "slashsuite/pixelslash",
  toggleslash: "slashsuite/toggleslash",
  flakeslash: "slashsuite/flakeslash",
  taskslash: "slashsuite/taskslash",
  uislash: "slashsuite/uislash",
};

const SITE = resolve(import.meta.dirname, "..");
const OUT = resolve(SITE, ".sources/facts");

/** Each product's pin from facts.sha.json, every one a full commit SHA. */
function pins(): Map<FactsProduct, string> {
  const raw: Record<string, unknown> = JSON.parse(
    readFileSync(resolve(SITE, "facts.sha.json"), "utf8"),
  );
  const out = new Map<FactsProduct, string>();
  for (const product of FACTS_PRODUCTS) {
    const sha = raw[product];
    // A full commit SHA: a short one is not a stable pin.
    if (typeof sha !== "string" || !/^[0-9a-f]{40}$/.test(sha)) {
      throw new Error(`facts.sha.json: ${product} is not a full commit SHA: "${String(sha)}"`);
    }
    out.set(product, sha);
  }
  return out;
}

async function download(product: FactsProduct, sha: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/${FACTS_REPOS[product]}/${sha}/FACTS.md`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status} from ${url}`);
    return await response.text();
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`could not fetch ${product} FACTS.md at ${sha}: ${reason}`, { cause: error });
  }
}

async function main(): Promise<void> {
  const pinned = [...pins()];
  const bodies = await Promise.all(pinned.map(([product, sha]) => download(product, sha)));
  // Written only once every file has arrived, so a failure leaves no half-updated folder behind.
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  pinned.forEach(([product], i) => writeFileSync(resolve(OUT, `${product}.md`), bodies[i] ?? ""));
  process.stdout.write(
    pinned.map(([product, sha]) => `fetched ${product} FACTS.md at ${sha}\n`).join(""),
  );
}

try {
  await main();
} catch (error) {
  process.stderr.write(`fetch-facts: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
}
