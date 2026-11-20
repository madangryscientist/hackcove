import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { type Member, memberKey, parseDocs, requiredMembers, unionMembers } from "./look-props.js";
import { storyValues, type Unresolved } from "./story-coverage.js";

const root = join(import.meta.dirname, "..", "..", "..");
const src = join(root, "apps", "storybook", "src");
const docs = parseDocs(
  JSON.parse(readFileSync(join(root, "packages", "ui-react", "docs", "props.json"), "utf8")),
);

/**
 * A member no story can show, with the reason: `{ "Component.prop": { "value": "reason" } }`. Each
 * reason is at least one full sentence.
 */
const notShot: Record<string, Record<string, string>> = {};

/** Every `.tsx` under `src/`: the story files and the Gallery and page helpers they render. */
function storyFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return storyFiles(path);
    return entry.name.endsWith(".tsx") ? [path] : [];
  });
}

function coverage() {
  const components = new Set(Object.keys(docs));
  const seen = new Set<string>();
  const rendered = new Set<string>();
  const unresolved: Unresolved[] = [];
  for (const path of storyFiles(src)) {
    const file = relative(root, path);
    const found = storyValues(file, readFileSync(path, "utf8"), components);
    for (const s of found.seen) seen.add(memberKey(s));
    for (const c of found.rendered) rendered.add(c);
    unresolved.push(...found.unresolved);
  }
  return { seen, rendered, unresolved };
}

const isNotShot = (m: Member) => notShot[`${m.component}.${m.prop}`]?.[m.value] !== undefined;

const { required, defaults } = requiredMembers(docs);
const { seen, rendered, unresolved } = coverage();

/**
 * Empty when every member is shot or excused; else the failure: what no story renders, then the
 * attributes on checked props that could not be resolved, as `file:line`.
 */
function coverageReport(): string[] {
  const missing = required.filter((m) => !seen.has(memberKey(m)) && !isNotShot(m));
  const missingDefaults = defaults.filter((m) => !rendered.has(m.component) && !isNotShot(m));
  const uncovered = [...missing, ...missingDefaults].map(memberKey);
  if (uncovered.length === 0) return [];
  const checked = new Set([...required, ...defaults].map((m) => `${m.component}.${m.prop}`));
  return [
    "No story renders these. Add a story in the component's own story file, or a notShot entry with its reason:",
    ...uncovered.map((k) => `  ${k}`),
    "These attributes could not be resolved to literals, so they cover nothing:",
    ...unresolved
      .filter((u) => checked.has(`${u.component}.${u.prop}`))
      .map((u) => `  ${u.file}:${u.line} ${u.component}.${u.prop}`),
  ];
}

/** What is wrong with the notShot entries: unknown, shot now, or a reason that is not a sentence. */
function notShotProblems(): string[] {
  const all = new Set([...required, ...defaults].map(memberKey));
  return Object.entries(notShot).flatMap(([key, values]) =>
    Object.entries(values).flatMap(([value, reason]) => {
      const name = `${key} = ${value}`;
      return [
        all.has(name) ? [] : [`${name} is not a member the test checks`],
        seen.has(name) ? [`${name} is shot now: drop its notShot entry`] : [],
        /^[A-Z].{10,}\.$/s.test(reason) ? [] : [`${name} needs a full-sentence reason`],
      ].flat();
    }),
  );
}

describe("story coverage", () => {
  it("reads the size, tone, variant, width and disabled props from the prop docs", () => {
    expect(required.length).toBeGreaterThan(100);
    expect(required.map(memberKey)).toContain("AvatarStack.size = xs");
    expect(required.map(memberKey)).toContain("Button.disabled = true");
  });

  it("shows every member of every look prop in a story", () => {
    expect(coverageReport()).toEqual([]);
  });

  it("gives every notShot entry a reason and keeps it current", () => {
    expect(notShotProblems()).toEqual([]);
  });
});

describe("storyValues", () => {
  const components = new Set(["X", "Y"]);
  const values = (text: string) => {
    const found = storyValues("f.tsx", text, components);
    return {
      seen: found.seen.map((s) => `${s.component}.${s.prop}=${s.value}`),
      unresolved: found.unresolved.map((u) => `${u.line} ${u.component}.${u.prop}`),
    };
  };

  it("reads literals and the bare attribute", () => {
    expect(values(`<X size="sm" tone={"info"} disabled width={\`full\`} />`).seen).toEqual([
      "X.size=sm",
      "X.tone=info",
      "X.disabled=true",
      "X.width=full",
    ]);
    expect(values(`<X disabled={true} variant={undefined} />`).seen).toEqual(["X.disabled=true"]);
  });

  it("follows a .map parameter over an array literal or a same-file const array", () => {
    const inline = `(["sm", "md", undefined] as const).map((size) => <X key={size} size={size} />)`;
    expect(values(inline).seen).toEqual(["X.size=sm", "X.size=md"]);
    const named = `const sizes = ["xs", "lg"] as const;\nconst a = sizes.map((s) => <Y size={s} />);`;
    expect(values(named).seen).toEqual(["Y.size=xs", "Y.size=lg"]);
  });

  it("follows a member of a .map parameter over a const array of objects", () => {
    const rows = `const rows = [{ tone: undefined }, { tone: "danger" as const }, {}];
const a = rows.map((r) => <X tone={r.tone} />);`;
    expect(values(rows).seen).toEqual(["X.tone=danger"]);
  });

  it("reads both branches of a conditional", () => {
    expect(values(`<X tone={cond ? "info" : "danger"} />`).seen).toEqual([
      "X.tone=info",
      "X.tone=danger",
    ]);
  });

  it("follows a same-file component's prop to the values it is rendered with", () => {
    const text = `function Row({ size }) { return <X size={size} />; }\n<Row size="sm" />;\n<Row size="lg" />`;
    expect(values(text).seen).toEqual(["X.size=sm", "X.size=lg"]);
  });

  it("leaves an array name declared twice in the file unresolved, rather than guess which", () => {
    const text = `function A() { const rows = [{ tone: "info" }]; return rows.map((r) => <X tone={r.tone} />); }
function B() { const rows = [{ tone: "danger" }]; return null; }`;
    expect(values(text)).toEqual({ seen: [], unresolved: ["1 X.tone"] });
  });

  it("lists what it cannot resolve, and ignores other components", () => {
    const text = `const pick = (s) => <X size={s} />;\n<X tone={choose()} />;\n<Z size={q} />`;
    expect(values(text)).toEqual({ seen: [], unresolved: ["1 X.size", "2 X.tone"] });
  });
});

describe("unionMembers", () => {
  it("reads a union of string literals and ignores undefined", () => {
    expect(unionMembers(`"sm" | "md" | undefined`)).toEqual(["sm", "md"]);
    expect(unionMembers("Size | ResponsiveSize")).toBeUndefined();
    expect(unionMembers("boolean")).toBeUndefined();
  });
});
