import { CardGrid, Pill, Stack } from "@hackcove/ui";
import { Example } from "./Example.js";
import { pairOf } from "./pairs.js";
import type { DocStory } from "./stories.js";

const SIDE = {
  emerald: "Do",
  red: "Don't",
} as const;

/** One side: a pill, the framed example, its caption. Both sides are this, so they line up. */
function Side({ story, tone }: { story: DocStory; tone: "emerald" | "red" }) {
  return (
    <Stack gap="xs">
      <div>
        <Pill tone={tone}>{SIDE[tone]}</Pill>
      </div>
      <Example of={story.id} />
    </Stack>
  );
}

/**
 * The right way and the wrong way side by side, from the stories `Do<Topic>` and `Dont<Topic>` of
 * `of="<File>/<Topic>"`. A topic with only one side shows it across the full width, not half of an
 * empty pair. A topic with neither fails the build.
 */
export function DoDont({ of }: { of: string }) {
  const { do: right, dont: wrong } = pairOf(of);
  if (right === undefined && wrong === undefined) {
    throw new Error(`<DoDont of="${of}">: neither Do nor Dont story has a render`);
  }
  if (right === undefined || wrong === undefined) {
    return right ? (
      <Side story={right} tone="emerald" />
    ) : (
      wrong && <Side story={wrong} tone="red" />
    );
  }
  return (
    <CardGrid columns={2}>
      <Side story={right} tone="emerald" />
      <Side story={wrong} tone="red" />
    </CardGrid>
  );
}
