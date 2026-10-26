/**
 * Every story in Storybook's `src/`, composed so the docs can render the same JSX Storybook does
 * (`composeStories`) and show its source. A story is named `<File>/<Export>`: `Button/Variants`
 * is `Variants` in `Button.stories.tsx` (a file in a subfolder, like `layout/Stack.stories.tsx`, is just `Stack`). Nothing here lists a component or a story.
 */
import { composeStories } from "@storybook/react";
import type { ComponentType } from "react";
import { storyParts, type StoryParts } from "./source.js";

type Csf = Parameters<typeof composeStories>[0];

const modules = import.meta.glob<Csf>("../../../storybook/src/**/*.stories.tsx", { eager: true });
const sources = import.meta.glob<string>("../../../storybook/src/**/*.stories.tsx", {
  eager: true,
  query: "?raw",
  import: "default",
});

const stemOf = (path: string) =>
  path
    .split("/")
    .at(-1)
    ?.replace(/\.stories\.tsx$/, "") ?? path;

const stems = Object.keys(modules).map(stemOf);
const clash = stems.find((stem, i) => stems.indexOf(stem) !== i);
if (clash !== undefined) throw new Error(`two story files are both named ${clash}.stories.tsx`);

export type DocStory = StoryParts & {
  id: string;
  Story: ComponentType;
};

const composed = new Map(
  Object.entries(modules).map(
    ([path, mod]): [string, Record<string, ComponentType | undefined>] => [
      stemOf(path),
      composeStories(mod),
    ],
  ),
);
const rawByStem = new Map(Object.entries(sources).map(([path, raw]) => [stemOf(path), raw]));

/** The story `<File>/<Export>`, or `undefined` when no such story has a `render` we can show. */
export function findStory(id: string): DocStory | undefined {
  const [stem, name] = id.split("/");
  if (stem === undefined || name === undefined) return undefined;
  const Story = composed.get(stem)?.[name];
  const raw = rawByStem.get(stem);
  const parts = raw === undefined ? undefined : storyParts(raw, name);
  return Story === undefined || parts === undefined ? undefined : { id, Story, ...parts };
}
