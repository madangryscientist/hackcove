/**
 * `/ui/llms.txt`: the component docs as plain text for agents, one section per component. It is
 * made from the same sources as the pages (`content/components/`, the stories and
 * `generated/props.json`), so the two cannot drift.
 */
import { componentPages, sectionOfPage, type ComponentPage } from "../content/components/index.js";
import { site } from "../content/site.js";
import { pairOf } from "./pairs.js";
import { docOf } from "./Props.js";

const fence = (code: string) => `\`\`\`tsx\n${code}\n\`\`\``;

/** A story's caption (when it has one) over its code. */
const captioned = ({ caption, code }: { caption?: string | undefined; code: string }) =>
  caption === undefined ? fence(code) : `${caption}\n${fence(code)}`;

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
    const flags = `${prop.required ? " (required)" : ""}${prop.default === undefined ? "" : ` (default ${prop.default})`}`;
    return `- ${prop.name}: ${prop.type}${flags}${prop.description === "" ? "" : `. ${prop.description}`}`;
  });
  return [`### ${name}`, description.replace(/\s*\n\s*/g, " "), ...lines].join("\n");
}

function functionsOf(page: ComponentPage): string[] {
  const { functions = [] } = page;
  return functions.length === 0
    ? []
    : [`### Functions\n${functions.map((fn) => `- ${fn.name}: ${fn.text}`).join("\n")}`];
}

function sectionOf(page: ComponentPage): string {
  const [lead] = page.pairs;
  const right = lead === undefined ? undefined : pairOf(lead).do;
  if (right === undefined) throw new Error(`llms.txt: ${page.name} has no Do story to lead with`);
  return [
    `## ${page.name}`,
    `Group: ${sectionOfPage(page.slug).title}`,
    `When to use: ${page.whenToUse}`,
    `### The one right way\n${captioned(right)}`,
    `### Do\n${page.usage.map((rule) => `- ${rule}`).join("\n")}`,
    `### Don't\n${dontsOf(page)}`,
    `### Accessibility\n${page.accessibility.map((rule) => `- ${rule}`).join("\n")}`,
    `### Props\n${page.api.map(propsOf).join("\n\n")}`,
    ...functionsOf(page),
  ].join("\n\n");
}

/** The whole file. */
export function renderLlms(): string {
  const head = [
    "# Hack Cove UI",
    `> ${site.ui.subtitle}`,
    ...site.ui.intro,
    "Every component has one right way to use it. There are no extension recipes and no styling escape hatches: do not restyle a component, compose the parts.",
  ].join("\n\n");
  return `${[head, ...componentPages.map(sectionOf)].join("\n\n")}\n`;
}
