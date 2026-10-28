/** One prop of a component, as `scripts/generate-props.ts` reads it from `packages/ui`. */
export type PropDoc = {
  name: string;
  type: string;
  required: boolean;
  /** The default value as source text, when the component sets one. */
  default?: string | undefined;
  description: string;
};

/** One export: a component and its props, or a helper (`buttonClass`) and its signature. */
export type ComponentDoc = {
  name: string;
  description: string;
  /** A helper's TypeScript signature, as `name(params): result` or `name: type`. */
  signature?: string | undefined;
  props: PropDoc[];
};

/** `src/generated/props.json`: every value `@hackcove/ui` exports, by name. */
export type PropsJson = Record<string, ComponentDoc>;
