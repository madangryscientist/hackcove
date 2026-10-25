import { Card, CardGrid, Pill } from "@hackcove/ui";
import { Example } from "./Example.js";
import { pairOf } from "./pairs.js";
import type { DocStory } from "./stories.js";

const SIDE = {
  emerald: { title: "Do", pill: "Right" },
  red: { title: "Don't", pill: "Wrong" },
} as const;

function Side({ story, tone }: { story: DocStory; tone: "emerald" | "red" }) {
  const { title, pill } = SIDE[tone];
  return (
    <Card as="article" title={title} status={<Pill tone={tone}>{pill}</Pill>}>
      <Example of={story.id} />
    </Card>
  );
}

/**
 * The right way and the wrong way side by side, from the stories `Do<Topic>` and `Dont<Topic>` of
 * `of="<File>/<Topic>"`. A topic with only a `Do` shows the one card. A topic with neither fails the build.
 */
export function DoDont({ of }: { of: string }) {
  const { do: right, dont: wrong } = pairOf(of);
  if (right === undefined && wrong === undefined) {
    throw new Error(`<DoDont of="${of}">: neither Do nor Dont story has a render`);
  }
  return (
    <CardGrid columns={2}>
      {right && <Side story={right} tone="emerald" />}
      {wrong && <Side story={wrong} tone="red" />}
    </CardGrid>
  );
}
