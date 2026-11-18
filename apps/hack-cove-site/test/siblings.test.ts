import { describe, expect, test } from "vitest";
import { componentPageOf, componentPages } from "../src/content/components/index";
import { renderLlms } from "../src/docs/llms";
import { llmsSection } from "./llms";

describe("the sibling pages", () => {
  const slugs = new Set(componentPages.map((page) => page.slug));
  const withSiblings = componentPages.flatMap(({ slug, siblings = [] }) =>
    siblings.length > 0 ? [{ slug, siblings }] : [],
  );
  // Each page's siblings that do not name it back.
  const oneWay = componentPages.flatMap((page) =>
    (page.siblings ?? [])
      .filter(
        ({ slug }) => !(componentPageOf(slug).siblings ?? []).some((s) => s.slug === page.slug),
      )
      .map(({ slug }) => `${page.slug} names ${slug}, which does not name it back`),
  );

  test("some pages name their siblings", () => {
    expect(withSiblings.length).toBeGreaterThan(0);
  });

  test.each(withSiblings)("$slug: every sibling is another page, once, with a when", (page) => {
    const listed = page.siblings.map((sibling) => sibling.slug);
    expect(
      listed.filter((slug) => !slugs.has(slug)),
      "not a page",
    ).toEqual([]);
    expect(listed).not.toContain(page.slug);
    expect(
      listed.filter((slug, i) => listed.indexOf(slug) !== i),
      "named twice",
    ).toEqual([]);
    for (const { when } of page.siblings) expect(when.trim()).not.toBe("");
  });

  test("the relation is symmetric: a page that names a sibling is named back", () => {
    expect(oneWay).toEqual([]);
  });
});

describe("/ui/llms.txt: Use instead", () => {
  const text = renderLlms();

  test.each(componentPages)(
    "$name: Use instead lists each sibling page, or is left out",
    (page) => {
      const section = llmsSection(text, page.name);
      const { siblings = [] } = page;
      expect(section.includes("\n### Use instead\n")).toBe(siblings.length > 0);
      for (const { slug, when } of siblings) {
        expect(section).toContain(`- ${componentPageOf(slug).name} (/ui/${slug}/): ${when}`);
      }
    },
  );
});
