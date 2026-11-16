import { describe, expect, test } from "vitest";
import { componentPageOf, componentPages } from "../src/content/components/index";
import { renderLlms } from "../src/docs/llms";

describe("the sibling pages", () => {
  const slugs = new Set(componentPages.map((page) => page.slug));
  const withSiblings = componentPages.filter((page) => (page.siblings ?? []).length > 0);

  test("some pages name their siblings", () => {
    expect(withSiblings.length).toBeGreaterThan(0);
  });

  test.each(withSiblings)("$slug: every sibling is another page, once, with a when", (page) => {
    const listed = (page.siblings ?? []).map((sibling) => sibling.slug);
    expect(
      listed.filter((slug) => !slugs.has(slug)),
      "not a page",
    ).toEqual([]);
    expect(listed).not.toContain(page.slug);
    expect(
      listed.filter((slug, i) => listed.indexOf(slug) !== i),
      "named twice",
    ).toEqual([]);
    for (const { when } of page.siblings ?? []) expect(when.trim()).not.toBe("");
  });

  test("the relation is symmetric: a page that names a sibling is named back", () => {
    const oneWay = componentPages.flatMap((page) =>
      (page.siblings ?? [])
        .filter(
          ({ slug }) => !(componentPageOf(slug).siblings ?? []).some((s) => s.slug === page.slug),
        )
        .map(({ slug }) => `${page.slug} names ${slug}, which does not name it back`),
    );
    expect(oneWay).toEqual([]);
  });
});

describe("/ui/llms.txt: Use instead", () => {
  const text = renderLlms();

  /** A page's section, from its `## <name>` to the next `## `. */
  const sectionText = (name: string) => {
    const start = text.indexOf(`\n## ${name}\n`);
    const end = text.indexOf("\n## ", start + 1);
    return text.slice(start, end === -1 ? undefined : end);
  };

  test.each(componentPages)(
    "$name: Use instead lists each sibling page, or is left out",
    (page) => {
      const section = sectionText(page.name);
      const { siblings = [] } = page;
      expect(section.includes("\n### Use instead\n")).toBe(siblings.length > 0);
      for (const { slug, when } of siblings) {
        expect(section).toContain(`- ${componentPageOf(slug).name} (/ui/${slug}/): ${when}`);
      }
    },
  );
});
