import { existsSync, globSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";
import { BUILD_COMMIT_PATTERN } from "../src/content/build-commit";

/** The built site to check. */
const DIST = resolve(import.meta.dirname, "../dist");

const pages = (): string[] => {
  if (!existsSync(resolve(DIST, "404.html")))
    throw new Error(
      `No built page in ${DIST}. Run the build first: bunx moon run hack-cove-site:build.`,
    );
  return globSync("**/*.html", { cwd: DIST }).toSorted();
};

describe("built pages", () => {
  test("every page carries one well-formed build-commit meta in its head, and nowhere else", () => {
    const wrong = pages().flatMap((page) => {
      const html = readFileSync(resolve(DIST, page), "utf8");
      const metas = [...html.matchAll(/<meta name="build-commit" content="([^"]*)"\s*\/?>/g)];
      if (metas.length !== 1) return [`${page}: ${metas.length} build-commit metas`];
      const [meta] = metas;
      const value = meta?.[1] ?? "";
      if (!BUILD_COMMIT_PATTERN.test(value)) return [`${page}: malformed "${value}"`];
      const headEnd = html.indexOf("</head>");
      if ((meta?.index ?? Infinity) > headEnd) return [`${page}: meta outside the head`];
      // The sha appears once: in the meta. Nothing of it is written where it renders.
      const sha = value.replace(/-dirty$/, "");
      if (html.split(sha).length !== 2) return [`${page}: the sha appears outside the meta`];
      return [];
    });
    expect(pages()).toEqual(expect.arrayContaining(["index.html", "404.html"]));
    expect(wrong).toEqual([]);
  });
});
