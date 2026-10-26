import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ComponentPage } from "../src/components/ComponentPage";
import * as ui from "@hackcove/ui";
import {
  componentPageOf,
  componentPages,
  componentSections,
} from "../src/content/components/index";
import { site } from "../src/content/site";
import { docOf } from "../src/docs/Props";
import { renderLlms } from "../src/docs/llms";
import { pairOf } from "../src/docs/pairs";
import { storyParts } from "../src/docs/source";
import { GET } from "../src/pages/ui/llms.txt";
import { generateProps, PROPS_JSON } from "../scripts/generate-props";

describe("the component pages", () => {
  test("a page is found by its slug, and an unknown slug fails", () => {
    expect(componentPageOf("button").name).toBe("Button");
    expect(() => componentPageOf("nope")).toThrow(/nope/);
  });

  test("slugs are unique and every page is in exactly one section", () => {
    const slugs = componentPages.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(componentSections.every((s) => s.pages.length > 0)).toBe(true);
    expect(new Set(componentSections.map((s) => s.title)).size).toBe(componentSections.length);
  });

  // The docs equivalent of the Gallery rule: a new export with no page fails here.
  test("every export of @hackcove/ui is on exactly one page, and a page names only real exports", () => {
    const exported = Object.keys(ui).toSorted();
    const documented = componentPages.flatMap((p) => [
      ...p.api,
      ...(p.functions ?? []).map((fn) => fn.name),
    ]);
    const missing = exported.filter((name) => !documented.includes(name));
    expect(missing, `exported from packages/ui/src/index.ts but on no docs page`).toEqual([]);
    const unknown = documented.filter((name) => !exported.includes(name));
    expect(unknown, "on a docs page but not exported from @hackcove/ui").toEqual([]);
    const twice = documented.filter((name, i) => documented.indexOf(name) !== i);
    expect(twice, "on more than one docs page").toEqual([]);
  });

  test.each(componentPages)("$name: the right way and every Example resolve to a story", (page) => {
    expect(page.pairs.length).toBeGreaterThan(0);
    const lead = pairOf(page.pairs[0] ?? "").do;
    expect(lead).toBeDefined();
    expect(lead?.code).toContain("import {");
    for (const topic of page.pairs) {
      const { do: right, dont: wrong } = pairOf(topic);
      expect(right ?? wrong).toBeDefined();
    }
  });

  test.each(componentPages)("$name: the right way leads, before the props table", (page) => {
    const html = renderToStaticMarkup(<ComponentPage page={page} />);
    const rightWayAt = html.indexOf(">Overview<");
    expect(rightWayAt).toBeGreaterThan(-1);
    expect(rightWayAt).toBeLessThan(html.indexOf(">API<"));
    for (const heading of ["Overview", "Usage", "Accessibility", "API"]) {
      expect(html).toContain(`>${heading}<`);
    }
    expect(html).toContain(">Do<");
    for (const name of page.api) expect(html).toContain(`>${name}<`);
  });

  test.each(componentPages)("$name: every API name is in props.json", (page) => {
    for (const name of page.api) expect(docOf(name).name).toBe(name);
  });

  test("a Do story with no Dont is the only card and a missing story fails the build", () => {
    expect(pairOf("Tabs/SwitchView").dont).toBeUndefined();
    expect(() =>
      renderToStaticMarkup(
        <ComponentPage page={{ ...componentPageOf("button"), pairs: ["Button/Nope"] }} />,
      ),
    ).toThrow(/Button\/Nope/);
  });
});

const story = (render: string) =>
  `import { Body } from "@hackcove/ui";\nconst words = "hi";\nexport const A = { render: () => ${render} };`;

describe("a story's snippet", () => {
  test("stands alone: a word inside a string is fine, a name from the story's file fails the build", () => {
    expect(storyParts(story('<Body label="words">x</Body>'), "A")?.code).toContain("<Body");
    expect(() => storyParts(story("<Body>{words}</Body>"), "A")).toThrow(/"words"/);
  });
});

const looksOf = (name: string) =>
  Object.fromEntries(
    docOf(name)
      .props.filter((p) => ["variant", "size", "tone"].includes(p.name))
      .map((p) => [p.name, p.default]),
  );

describe("props.json", () => {
  test("is current: it equals what react-docgen-typescript reads from packages/ui now", () => {
    const onDisk: unknown = JSON.parse(readFileSync(PROPS_JSON, "utf8"));
    expect(onDisk).toEqual(generateProps());
  });

  test("leaves out className and style, which a component takes only to refuse to restyle", () => {
    for (const name of ["Button", "Card", "Tabs"]) {
      const names = docOf(name).props.map((p) => p.name);
      expect(names).not.toContain("className");
      expect(names).not.toContain("style");
    }
  });

  test("shows the same defaults for Button and ButtonLink, which share one look", () => {
    expect(looksOf("Button")).toEqual(looksOf("ButtonLink"));
    expect(looksOf("Button")["size"]).toBe("md");
  });
});

describe("/ui/llms.txt", () => {
  const text = renderLlms();

  test("GET serves exactly the generated text as text/plain", async () => {
    const response = GET();
    expect(response.headers.get("content-type")).toContain("text/plain");
    expect(await response.text()).toBe(text);
  });

  test("states the purpose and has one section per component", () => {
    expect(text).toContain("fully integrated with its theming");
    expect(text).toContain("no custom CSS or Tailwind");
    for (const page of componentPages) {
      expect(text.match(new RegExp(`^## ${page.name}$`, "gm"))).toHaveLength(1);
      for (const fn of page.functions ?? []) expect(text).toContain(`- ${fn.name}: `);
      expect(text).toContain(`When to use: ${page.whenToUse}`);
    }
  });

  test("is current: the right way's code, the Don't stories' code and the props come from their sources", () => {
    for (const page of componentPages) {
      expect(text).toContain(pairOf(page.pairs[0] ?? "").do?.code ?? "");
      for (const topic of page.pairs) {
        const { dont } = pairOf(topic);
        expect(text).toContain(dont?.code ?? "");
      }
      for (const name of page.api) {
        for (const prop of docOf(name).props) expect(text).toContain(`- ${prop.name}: `);
      }
    }
  });

  test("has no extension recipe or styling escape hatch", () => {
    expect(text).toContain("do not restyle a component");
    expect(text).not.toMatch(/\bclassName\b/);
    expect(site.ui.intro.join(" ")).toContain("strict on purpose");
  });
});
