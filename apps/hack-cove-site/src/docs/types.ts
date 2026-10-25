/** One prop of a component, as `scripts/generate-props.ts` reads it from `packages/ui`. */
export type PropDoc = {
  name: string;
  type: string;
  required: boolean;
  /** The default value as source text, when the component sets one. */
  default?: string | undefined;
  description: string;
};

export type ComponentDoc = {
  name: string;
  description: string;
  props: PropDoc[];
};

/** `src/generated/props.json`: every component `@hackcove/ui` exports, by name. */
export type PropsJson = Record<string, ComponentDoc>;
