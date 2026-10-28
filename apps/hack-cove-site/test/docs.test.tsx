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
import { themes } from "../src/content/themes";
import propsJson from "../src/generated/props.json";
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

  test("a topic with only one half is one of these, each with the reason it has no other", () => {
    const oneHalf = componentPages
      .flatMap((page) => page.pairs)
      .filter((topic) => {
        const { do: right, dont: wrong } = pairOf(topic);
        return right === undefined || wrong === undefined;
      })
      .toSorted();
    expect(oneHalf).toEqual(Object.keys(ONE_HALF).toSorted());
  });
});

/**
 * The Do/Don't topics that show one half, and why. A topic gets its other half when a
 * counter-example teaches something; a feature shown on its own, or a wrong way the types already
 * refuse, does not.
 */
const ONE_HALF: Record<string, string> = {
  "AppShellDocs/RouterBrand": "A feature: `AppShellBrand` with the router's own link.",
  "CardGrid/Auto": 'A feature: `columns="auto"`.',
  "Divider/Footer": "A feature: the one hairline between content and its footer.",
  "Tabs/SwitchView":
    "Its wrong ways are the other Tabs topics; this one shows the panel under the row.",
  "Checkbox/Row": "A feature: `ButtonGroup` spaces a row of checkboxes and buttons.",
  "DateField/TypedOnly": "A feature: `DateField` without `calendar` is typed only.",
  "DateField/Value": "A feature: the `CalendarDate` value and the ISO helpers.",
  "Disclosure/Secondary":
    "Its wrong way is `Disclosure/Essential`'s Don't: hiding what must be read.",
  "FilterGroup/Facets": "A feature: one group per facet.",
  "KeyValueList/AlignStart": "A feature: the `align` prop.",
  "ListRow/RowActions": "The wrong way does not compile: a button or link row takes no `actions`.",
  "TextLink/Stretch": "A feature: the `stretch` prop.",
  "Timeline/NoEvents": "A feature: the `empty` prop.",
};

const story = (render: string) =>
  `import { Text } from "@hackcove/ui";\nconst words = "hi";\nexport const A = { render: () => ${render} };`;

describe("a story's snippet", () => {
  test("stands alone: a word inside a string is fine, a name from the story's file fails the build", () => {
    expect(storyParts(story('<Text label="words">x</Text>'), "A")?.code).toContain("<Text");
    expect(() => storyParts(story("<Text>{words}</Text>"), "A")).toThrow(/"words"/);
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

  test("shows Button's look defaults, which a button and a link share", () => {
    expect(looksOf("Button")["size"]).toBe("md");
  });

  test("covers exactly what @hackcove/ui exports", () => {
    expect(Object.keys(propsJson).toSorted()).toEqual(Object.keys(ui).toSorted());
  });

  test("describes every export and every prop: no description is empty", () => {
    const empty = Object.keys(ui).flatMap((name) => {
      const doc = docOf(name);
      const props = doc.props
        .filter((p) => p.description.trim() === "")
        .map((p) => `${name}.${p.name}`);
      return doc.description.trim() === "" ? [name, ...props] : props;
    });
    expect(empty).toEqual([]);
  });

  test("gives every helper (a lower-case export) its signature", () => {
    const missing = Object.keys(ui).filter((name) => /^[a-z]/.test(name) && !docOf(name).signature);
    expect(missing).toEqual([]);
  });
});

describe("/ui/llms.txt", () => {
  const text = renderLlms();

  test("GET serves exactly the generated text as text/plain", async () => {
    const response = GET();
    expect(response.headers.get("content-type")).toContain("text/plain");
    expect(await response.text()).toBe(text);
  });

  test("states the purpose", () => {
    expect(text).toContain("fully integrated with its theming");
    expect(text).toContain("no custom CSS or Tailwind");
  });

  test("leads with the setup: install, the CSS wiring and every theme's package and class", () => {
    expect(text.indexOf("## Install")).toBeLessThan(text.indexOf(`## ${componentPages[0]?.name}`));
    expect(text).toContain('@source "../node_modules/@hackcove/ui/dist";');
    for (const theme of themes) {
      expect(text).toContain(`\`${theme.name}\``);
      expect(text).toContain(`\`${theme.scopeClass}\``);
    }
  });

  test("has one section per component", () => {
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
