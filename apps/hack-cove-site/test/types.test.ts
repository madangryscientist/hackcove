import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { generateTypes, TYPES_JSON } from "../scripts/generate-props";
import { componentPages } from "../src/content/components/index";
import typesJson from "../src/generated/types.json";
import { renderLlms } from "../src/docs/llms";

const exported = Object.keys(typesJson);
const listed = componentPages.flatMap((page) => page.types ?? []);

describe("types.json", () => {
  // generateTypes builds the same TypeScript program as generateProps; the budget covers that.
  test("is current: it equals what the checker reads from packages/ui-react now", () => {
    const onDisk: unknown = JSON.parse(readFileSync(TYPES_JSON, "utf8"));
    expect(onDisk).toEqual(generateTypes());
  }, 30_000);

  test("every type export is on exactly one page, and a page names only type exports", () => {
    expect(
      exported.filter((name) => !listed.includes(name)),
      "on no page",
    ).toEqual([]);
    expect(
      listed.filter((name) => !exported.includes(name)),
      "not a type export",
    ).toEqual([]);
    expect(
      listed.filter((name, i) => listed.indexOf(name) !== i),
      "on two pages",
    ).toEqual([]);
  });

  test("describes every type: no description is empty", () => {
    const empty = Object.values(typesJson).filter((type) => type.description.trim() === "");
    expect(empty.map((type) => type.name)).toEqual([]);
  });
});

describe("/ui/llms.txt: types", () => {
  const text = renderLlms();

  test.each(componentPages.filter((page) => (page.types ?? []).length > 0))(
    "$name: its types print under Types, after the props",
    (page) => {
      const start = text.indexOf(`\n## ${page.name}\n`);
      const end = text.indexOf("\n## ", start + 1);
      const section = text.slice(start, end === -1 ? undefined : end);
      const at = section.indexOf("\n### Types\n");
      expect(at).toBeGreaterThan(section.indexOf("\n### Props\n"));
      for (const name of page.types ?? []) expect(section.slice(at)).toContain(`- ${name}: `);
    },
  );
});

describe("/ui/llms.txt: function examples", () => {
  const text = renderLlms();
  const examples = componentPages.flatMap((page) =>
    (page.functions ?? []).flatMap((fn) =>
      fn.example === undefined ? [] : [{ page: page.name, name: fn.name, example: fn.example }],
    ),
  );

  test("some functions have an example", () => {
    expect(examples.length).toBeGreaterThan(0);
  });

  test.each(examples)("$name: its example is fenced as tsx in $page", ({ page, example }) => {
    const start = text.indexOf(`\n## ${page}\n`);
    const end = text.indexOf("\n## ", start + 1);
    expect(text.slice(start, end === -1 ? undefined : end)).toContain(
      `\`\`\`tsx\n${example}\n\`\`\``,
    );
  });
});
