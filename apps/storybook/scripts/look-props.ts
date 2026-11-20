/**
 * The members of the look props the stories must show, read from the generated prop docs
 * (`packages/ui-react/docs/props.json`). `story-coverage.test.ts` checks them against what
 * `story-coverage.ts` finds in the stories.
 */
import { isRecord } from "./visual-index.js";

/** The props whose every member is a look a story shows. `disabled` is checked for `true`. */
export const LOOK_PROPS: readonly string[] = ["size", "tone", "variant", "width"];
export const COVERED_PROPS: readonly string[] = [...LOOK_PROPS, "disabled"];

/** A prop doc entry as `packages/ui-react/docs/props.json` holds it. */
export type PropDoc = { name: string; type: string; default?: string | undefined };
export type ComponentDoc = { props: PropDoc[] };

/** The members of a union of string literals (`"sm" | "md" | undefined`), or `undefined` if not one. */
export function unionMembers(type: string): string[] | undefined {
  const parts = type
    .split("|")
    .map((p) => p.trim())
    .filter((p) => p !== "undefined");
  if (parts.length === 0) return undefined;
  const members: string[] = [];
  for (const part of parts) {
    const match = /^"([^"]*)"$/.exec(part);
    if (match?.[1] === undefined) return undefined;
    members.push(match[1]);
  }
  return members;
}

/** One member of one component's prop: `Component.prop = value`. */
export type Member = { component: string; prop: string; value: string };

/** The members one prop asks for: `true` for `disabled`, every member of a look prop's union. */
function membersOf(prop: PropDoc): { value: string; isDefault: boolean }[] {
  if (prop.name === "disabled")
    return prop.type === "boolean" ? [{ value: "true", isDefault: false }] : [];
  const members = LOOK_PROPS.includes(prop.name) ? unionMembers(prop.type) : undefined;
  const named = new Set(prop.default?.match(/[\w-]+/g) ?? []);
  return (members ?? []).map((value) => ({ value, isDefault: named.has(value) }));
}

/**
 * Every member the stories must render, from the prop docs. A member the `default` names (a bare
 * `md`, or each member it names in prose, as in "`full` inside a `Field`, `auto` outside one") is
 * left out: any story that renders the component shows it.
 */
export function requiredMembers(docs: Record<string, ComponentDoc>): {
  required: Member[];
  defaults: Member[];
} {
  const required: Member[] = [];
  const defaults: Member[] = [];
  for (const [component, doc] of Object.entries(docs)) {
    for (const prop of doc.props) {
      for (const { value, isDefault } of membersOf(prop))
        (isDefault ? defaults : required).push({ component, prop: prop.name, value });
    }
  }
  return { required, defaults };
}

/** The prop docs from the parsed `props.json`, keeping only what the check reads. */
export function parseDocs(json: unknown): Record<string, ComponentDoc> {
  const docs: Record<string, ComponentDoc> = {};
  for (const [component, doc] of Object.entries(isRecord(json) ? json : {})) {
    const list = isRecord(doc) && Array.isArray(doc["props"]) ? doc["props"] : [];
    const props = list.flatMap((p: unknown) => {
      const { name, type, default: fallback } = isRecord(p) ? p : {};
      if (typeof name !== "string" || typeof type !== "string") return [];
      return [{ name, type, default: typeof fallback === "string" ? fallback : undefined }];
    });
    docs[component] = { props };
  }
  return docs;
}

export const memberKey = (m: Member) => `${m.component}.${m.prop} = ${m.value}`;
