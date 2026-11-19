/**
 * `/ui/llms.txt`: the component docs as plain text for agents, one section per component. It is
 * made from the same sources as the pages (`packages/ui-react/docs/components/`, the
 * stories and `packages/ui-react/docs/props.json`), so the two cannot drift.
 */
import {
  componentPageOf,
  componentPages,
  sectionOfPage,
  type ComponentPage,
} from "../../../../packages/ui-react/docs/components/index.js";
import { site } from "../content/site.js";
import { themes } from "../content/themes.js";
import { pairOf } from "./pairs.js";
import { docOf, typeOf } from "./Props.js";
import { findStory } from "./stories.js";

const fence = (code: string) => `\`\`\`tsx\n${code}\n\`\`\``;

/** A story's caption (when it has one) over its code. */
const captioned = ({ caption, code }: { caption?: string | undefined; code: string }) =>
  caption === undefined ? fence(code) : `${caption}\n${fence(code)}`;

/** The bullets as a `- ` list, one per line. */
const bullets = (rules: string[]) => rules.map((rule) => `- ${rule}`).join("\n");

/** The Don't section: the `usage.dont` bullets first, then the Don't stories. */
function dontSectionOf(page: ComponentPage): string {
  const { dont = [] } = page.usage;
  return [bullets(dont), dontsOf(page)].filter((part) => part !== "").join("\n\n");
}

/** Each Don't story: its caption over its code. */
function dontsOf(page: ComponentPage): string {
  return page.pairs
    .flatMap((topic) => {
      const { dont } = pairOf(topic);
      return dont === undefined ? [] : [captioned(dont)];
    })
    .join("\n\n");
}

function propsOf(name: string): string {
  const { description, props } = docOf(name);
  const lines = props.map((prop) => {
    const flags = `${prop.required ? " (required)" : ""}${prop.native ? " (native)" : ""}${prop.default === undefined ? "" : ` (default ${prop.default})`}`;
    return `- ${prop.name}: ${prop.type}${flags}${prop.description === "" ? "" : `. ${prop.description}`}`;
  });
  return [`### ${name}`, description.replace(/\s*\n\s*/g, " "), ...lines].join("\n");
}

/** One type: its name, its definition and what it is. */
function typeLine(name: string): string {
  const { description, definition } = typeOf(name);
  return `- ${name}: \`${definition}\`. ${description.replace(/\s*\n\s*/g, " ")}`;
}

function typesOf(page: ComponentPage): string[] {
  const { types = [] } = page;
  return types.length === 0 ? [] : [`### Types\n${types.map(typeLine).join("\n")}`];
}

function functionsOf(page: ComponentPage): string[] {
  const { functions = [] } = page;
  return functions.length === 0
    ? []
    : [
        `### Functions\n${functions.map((fn) => `- ${fn.name}: \`${docOf(fn.name).signature ?? fn.name}\`. ${fn.text}${fn.example === undefined ? "" : `\n${fence(fn.example)}`}`).join("\n")}`,
      ];
}

function fullPageOf(page: ComponentPage): string[] {
  if (page.fullPage === undefined) return [];
  const story = findStory(page.fullPage);
  if (story === undefined) throw new Error(`llms.txt: ${page.name} has no story ${page.fullPage}`);
  return [`### Full page\n${captioned(story)}`];
}

/** The "Use instead" list: each sibling page with when to use it instead of this one. */
function siblingsOf(page: ComponentPage): string[] {
  const { siblings = [] } = page;
  return siblings.length === 0
    ? []
    : [
        `### Use instead\n${siblings.map(({ slug, when }) => `- ${componentPageOf(slug).name} (/ui/${slug}/): ${when}`).join("\n")}`,
      ];
}

function sectionOf(page: ComponentPage): string {
  const [lead] = page.pairs;
  const right = lead === undefined ? undefined : pairOf(lead).do;
  if (right === undefined) throw new Error(`llms.txt: ${page.name} has no Do story to lead with`);
  return [
    `## ${page.name}`,
    `Group: ${sectionOfPage(page.slug).title}`,
    `When to use: ${page.whenToUse}`,
    ...siblingsOf(page),
    `### The one right way\n${captioned(right)}`,
    ...fullPageOf(page),
    `### Do\n${bullets(page.usage.do)}`,
    `### Don't\n${dontSectionOf(page)}`,
    `### Accessibility\n${bullets(page.accessibility)}`,
    `### Props\n${page.api.map(propsOf).join("\n\n")}`,
    ...typesOf(page),
    ...functionsOf(page),
  ].join("\n\n");
}

/** Install, the CSS wiring and every theme's package and class: what an agent needs before any component works. */
function setupOf(): string {
  const { install, themes: themesCopy } = site.ui;
  const steps = install.steps.map((step, i) => {
    const code =
      "code" in step ? `\n\`\`\`${step.language}\n${[step.code].flat().join("\n")}\n\`\`\`` : "";
    return `${i + 1}. ${step.text}${code}`;
  });
  const list = themes.map(
    (theme) =>
      `- ${theme.title}: \`${theme.specifier}\`; ${themesCopy.scopeLabel}: \`${theme.scopeClass}\`.`,
  );
  return [
    `## ${install.title}`,
    steps.join("\n\n"),
    `### ${themesCopy.title}\n${themesCopy.intro}\n${list.join("\n")}`,
  ].join("\n\n");
}

/** The whole file. */
export function renderLlms(): string {
  const head = [
    "# UISlash",
    `> ${site.ui.subtitle}`,
    ...site.ui.intro,
    "Every component has one right way to use it. There are no extension recipes and no styling escape hatches: do not restyle a component, compose the parts.",
  ].join("\n\n");
  return `${[head, setupOf(), ...componentPages.map(sectionOf)].join("\n\n")}\n`;
}
