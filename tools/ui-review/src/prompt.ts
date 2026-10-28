/** The model that reviews, through OpenCode Zen. */
export const MODEL = "opencode/deepseek-v4.1-flash";

/** The `## Purpose` section of the repo's AGENTS.md, so the reviewer shares the library's intent. */
export function purposeOf(agentsMd: string): string {
  const match = /^## Purpose\s*\n([\s\S]*?)(?=^## )/m.exec(agentsMd);
  if (match === null) throw new Error("AGENTS.md has no `## Purpose` section");
  return (match[1] ?? "").trim();
}

const TASK = `You review one pull request for a team that builds its UI with Hack Cove UI (@hackcove/ui), a strict, opinionated component library. Judge only how the change uses it.

Hard rules (raw colour utilities, dark: variants, className/style on a Hack Cove component, new CSS, a local component with a Hack Cove name) are checked by a script. Do not repeat them.

Report the soft calls a script cannot make:
- wrong-component: a Hack Cove component exists for the job and the change uses another one, or hand-rolled markup.
- hand-rolled-layout: a page layout built from divs where a *Layout (ListLayout, DetailLayout, FormLayout, ...) fits.
- hand-set-spacing: spacing, widths or alignment set by hand (utilities such as p-4, mt-6, gap-3, flex, grid) where Stack, Cluster, Section or a layout does it.
- missing-state: a list, table or fetched view with no loading skeleton, empty state or error state, where Hack Cove has a part for it.
- missing-part: the job needs something Hack Cove UI does not have. Set "missing_part" to the name of that part. The author will be told to ask hackcove for it; never tell them to build it locally.

Use the component reference below as the only source of truth for what exists and how it is meant to be used. Do not invent components or props.

Only comment on lines the diff adds (lines starting with "+"). Use the new file's line number. Be selective: a finding must be one you are confident in; say nothing about code that is fine. At most 12 findings.

Answer with one JSON object and nothing else:
{"findings":[{"path":"src/Page.tsx","line":12,"kind":"wrong-component","message":"One or two sentences: what is wrong and which Hack Cove part to use.","missing_part":"only for kind missing-part"}]}
An empty "findings" array means the change matches Hack Cove.`;

export type PromptParts = { purpose: string; reference: string; diff: string; left?: number };

/**
 * The whole prompt: the task, the library's purpose, its component reference, the change. The diff
 * is already within the budget (`fitDiff`); `left` is how many files that left out.
 */
export function buildPrompt({ purpose, reference, diff, left = 0 }: PromptParts): string {
  return [
    TASK,
    "# Purpose of Hack Cove UI",
    purpose,
    "# Component reference (the library's /ui/llms.txt)",
    reference.trim(),
    "# The change (unified diff of the app's files)",
    "```diff",
    diff.trimEnd(),
    "```",
    ...(left > 0
      ? [
          `(${left} more file${left === 1 ? " was" : "s were"} left out; review only what is shown.)`,
        ]
      : []),
  ].join("\n\n");
}
