import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ComponentPage, contentsOf } from "../src/components/ComponentPage";
import { DocsFrame } from "../src/components/DocsFrame";
import * as ui from "@hackcove/ui-react";
import {
  componentPageOf,
  componentPages,
  componentSections,
  neighboursOf,
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
import { dontWorded, opensDont } from "./usageRules";

/** The section ids a page's "On this page" list links to, in the order it lists them. */
function onThisPageHrefs(slug: string): string[] {
  const page = componentPageOf(slug);
  const html = renderToStaticMarkup(
    <DocsFrame pathname={`/ui/${slug}/`} title={page.name} contents={contentsOf(page)}>
      <ComponentPage page={page} />
    </DocsFrame>,
  );
  const nav = /<nav aria-label="On this page"[^>]*>([\s\S]*?)<\/nav>/.exec(html)?.[1] ?? "";
  return [...nav.matchAll(/href="#([^"]+)"/g)].map((m) => m[1] ?? "");
}

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
  test("every export of @hackcove/ui-react is on exactly one page, and a page names only real exports", () => {
    const exported = Object.keys(ui).toSorted();
    const documented = componentPages.flatMap((p) => [
      ...p.api,
      ...(p.functions ?? []).map((fn) => fn.name),
    ]);
    const missing = exported.filter((name) => !documented.includes(name));
    expect(missing, `exported from packages/ui-react/src/index.ts but on no docs page`).toEqual([]);
    const unknown = documented.filter((name) => !exported.includes(name));
    expect(unknown, "on a docs page but not exported from @hackcove/ui-react").toEqual([]);
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
    const rightWayAt = html.indexOf(">Overview</h2>");
    expect(rightWayAt).toBeGreaterThan(-1);
    expect(rightWayAt).toBeLessThan(html.indexOf(">API</h2>"));
    for (const heading of ["Overview", "Usage", "Accessibility", "API"]) {
      expect(html).toContain(`>${heading}</h2>`);
    }
    expect(html).toContain(">Do<");
    for (const name of page.api) expect(html).toContain(`>${name}<`);
  });

  test("the On this page list names the sections the page has, in page order", () => {
    expect(onThisPageHrefs("button")).toEqual(["overview", "usage", "accessibility", "api"]);
    const withFullPage = componentPages.find((p) => p.fullPage !== undefined);
    expect(withFullPage).toBeDefined();
    expect(onThisPageHrefs(withFullPage?.slug ?? "")).toContain("full-page");
  });

  // The list names each section by hand in two places: the ids it links to, and the Sections that
  // carry them. This is the guard against the two drifting apart.
  test.each(componentPages)("$name: every On this page link lands on a heading", (page) => {
    const html = renderToStaticMarkup(<ComponentPage page={page} />);
    const ids = onThisPageHrefs(page.slug);
    expect(ids.length).toBe(page.fullPage === undefined ? 4 : 5);
    for (const id of ids) expect(html).toContain(`<h2 id="${id}"`);
  });

  test("previous and next walk the rail's order, and the ends have one", () => {
    const first = componentPages[0];
    const last = componentPages.at(-1);
    expect(first).toBeDefined();
    expect(last).toBeDefined();
    if (!first || !last) return;
    const order = componentPages.map((p) => p.slug);
    expect(neighboursOf(first.slug)).toEqual({ next: componentPages[1] });
    expect(neighboursOf(last.slug)).toEqual({ previous: componentPages.at(-2) });
    const middle = order[Math.floor(order.length / 2)] ?? "";
    expect(neighboursOf(middle)).toEqual({
      previous: componentPages[order.indexOf(middle) - 1],
      next: componentPages[order.indexOf(middle) + 1],
    });
    expect(() => neighboursOf("nope")).toThrow(/nope/);
  });

  test.each(componentPages)("$name: every API name is in props.json", (page) => {
    for (const name of page.api) expect(docOf(name).name).toBe(name);
  });

  test("a Do story with no Dont is the only card and a missing story fails the build", () => {
    expect(pairOf("ListRow/RowActions").dont).toBeUndefined();
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
    // A topic's other half teaches something unless the types refuse the wrong way outright.
    for (const reason of Object.values(ONE_HALF)) {
      expect(reason).toMatch(/^The wrong way does not compile/);
    }
  });

  test.each(componentPages)(
    "$name: the first pair, the one right way, has a Do and a Dont",
    (page) => {
      const { do: right, dont: wrong } = pairOf(page.pairs[0] ?? "");
      expect(right, `${page.pairs[0]} has no Do story`).toBeDefined();
      expect(wrong, `${page.pairs[0]} has no Dont story`).toBeDefined();
    },
  );
});

/**
 * The Do/Don't topics that show one half, and why. Every topic has both halves unless the types
 * already refuse its wrong way, so the reason always says that.
 */
const ONE_HALF: Record<string, string> = {
  "ListRow/RowActions": "The wrong way does not compile: a button or link row takes no `actions`.",
  "Switch/Row": "The wrong way does not compile: a `Switch` takes a `label` or an `aria-label`.",
};

const story = (render: string) =>
  `import { Text } from "@hackcove/ui-react";\nconst words = "hi";\nexport const A = { render: () => ${render} };`;

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
  // generateProps builds a TypeScript program over all of ui-react: about 2s idle, and it has run
  // past vitest's 5s default under load (HC-213). The budget covers that build; it is not a retry.
  test("is current: it equals what react-docgen-typescript reads from packages/ui-react now", () => {
    const onDisk: unknown = JSON.parse(readFileSync(PROPS_JSON, "utf8"));
    expect(onDisk).toEqual(generateProps());
  }, 30_000);

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

  test("covers exactly what @hackcove/ui-react exports", () => {
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

describe("the usage rules", () => {
  // A do bullet that says what not to use without a don't word: it must read as a do.
  const framed = componentPageOf("image").usage.do.find((rule) => rule.startsWith("`framed`"));

  test("the framed bullet is still on the Image page", () => {
    expect(framed).toBeDefined();
  });

  test.each([
    ["Never nest a `Container` in a `Container`: the padding doubles.", true],
    ["Use `TextLink` for every link in running text. Never a bare `<a>`.", true],
    ["Draw it once: Avoid a second rule under it.", true],
    ["Don't type the numbers.", true],
    [framed ?? "", false],
    ["Fill the slots and write no wrapper.", false],
  ])("dontWorded(%j) is %s", (rule, expected) => {
    expect(dontWorded(rule)).toBe(expected);
  });

  test.each(componentPages)(
    "$slug: do says the right way, and every dont opens with a don't word",
    (page) => {
      const { do: dos, dont = [] } = page.usage;
      expect(dos.length).toBeGreaterThan(0);
      expect(dos.filter(dontWorded)).toEqual([]);
      expect(dont.filter((rule) => !opensDont(rule))).toEqual([]);
    },
  );
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
    expect(text).toContain('@source "../node_modules/@hackcove/ui-react/dist";');
    for (const theme of themes) {
      expect(text).toContain(`\`${theme.specifier}\``);
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

  test.each(componentPages)(
    "$name: the do rules print under Do and the dont rules under Don't",
    (page) => {
      const start = text.indexOf(`\n## ${page.name}\n`);
      const end = text.indexOf("\n## ", start + 1);
      const section = text.slice(start, end === -1 ? undefined : end);
      const doAt = section.indexOf("\n### Do\n");
      const dontAt = section.indexOf("\n### Don't\n");
      const a11yAt = section.indexOf("\n### Accessibility\n");
      expect(start).toBeGreaterThan(-1);
      expect(doAt).toBeGreaterThan(-1);
      expect(dontAt).toBeGreaterThan(doAt);
      expect(a11yAt).toBeGreaterThan(dontAt);
      const doPart = section.slice(doAt, dontAt);
      const dontPart = section.slice(dontAt, a11yAt);
      const { do: dos, dont = [] } = page.usage;
      for (const rule of dos) expect(doPart).toContain(`- ${rule}`);
      for (const rule of dont) {
        expect(doPart).not.toContain(rule);
        expect(dontPart).toContain(`- ${rule}`);
      }
    },
  );

  test("has no extension recipe or styling escape hatch", () => {
    expect(text).toContain("do not restyle a component");
    // Two classNames are not a way in: the library's own class, handed to the app's router link to
    // spread, and the scheme class the app puts on its own `<html>`.
    const rest = text.replace(/^- LinkAdapterProps: .*$/m, "").replaceAll("<html className=", "");
    expect(rest).not.toMatch(/\bclassName\b/);
    expect(site.ui.intro.join(" ")).toContain("strict on purpose");
  });
});
