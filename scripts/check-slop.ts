/**
 * Runs the anti-slop rules (`slopRules.ts`) over the package in the current directory. Run by
 * `bun run lint` after oxlint; any hit fails the gate.
 */
import { globSync, readFileSync } from "node:fs";
import { slopRules } from "./slopRules";

const pkg = (JSON.parse(readFileSync("package.json", "utf8")) as { name: string }).name;
const hits = globSync("{src,test,e2e,smoke,scripts}/**/*.{ts,tsx}")
  .filter((path) => !path.endsWith("routeTree.gen.ts"))
  .flatMap((path) => slopRules(path, readFileSync(path, "utf8"), pkg));
if (hits.length > 0) {
  console.error(hits.join("\n"));
  process.exit(1);
}
