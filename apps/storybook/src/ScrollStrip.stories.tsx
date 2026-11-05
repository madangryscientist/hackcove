import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, Cluster, MediaTile, ScrollStrip } from "@hackcove/ui-react";
import { sampleScenes } from "./sampleScene";

const meta: Meta = { title: "Content/ScrollStrip" };
export default meta;
type S = StoryObj;

const people = ["Ada", "Grace", "Linus", "Margaret", "Dennis", "Ken", "Barbara", "Alan"];

const tiles = Array.from({ length: 8 }, (_, index) => {
  const scene = sampleScenes[index % sampleScenes.length] ?? { src: "", alt: "" };
  return { key: index, src: scene.src, alt: scene.alt, label: people[index] ?? "" };
});

export const Tiles: S = {
  render: () => (
    <div className="max-w-xl">
      <ScrollStrip label="Recent statuses">
        {tiles.map((tile) => (
          <MediaTile key={tile.key} src={tile.src} alt={tile.alt} label={tile.label} />
        ))}
        <MediaTile alt="Earlier statuses" label="Earlier" onClick={() => undefined} />
      </ScrollStrip>
    </div>
  ),
};

/** Avatars keep their size; the strip scrolls when they run past the width. */
export const Avatars: S = {
  render: () => (
    <div className="max-w-xs">
      <ScrollStrip label="People">
        {people.map((name) => (
          <Avatar key={name} name={name} size="xl" />
        ))}
      </ScrollStrip>
    </div>
  ),
};

/** `gap` is a `Cluster`'s: `xs`, `sm` (the default) and `md`. */
export const Gaps: S = {
  render: () => (
    <div className="flex max-w-xs flex-col gap-4">
      {(["xs", "sm", "md"] as const).map((gap) => (
        <ScrollStrip key={gap} label={`Gap ${gap}`} gap={gap}>
          {people.map((name) => (
            <Avatar key={name} name={name} size="lg" />
          ))}
        </ScrollStrip>
      ))}
    </div>
  ),
};

/** A row of media that runs past the page is a `ScrollStrip`: one line, a thin scrollbar, snapping. */
export const DoRow: S = {
  render: () => (
    <ScrollStrip label="Recent statuses">
      {[...sampleScenes, ...sampleScenes].map((scene, index) => (
        <MediaTile key={index} src={scene.src} alt={scene.alt} label="Anna" />
      ))}
    </ScrollStrip>
  ),
};

/** A `Cluster` wraps the tiles onto several lines, so the row takes over the page instead of staying in one line. */
export const DontRow: S = {
  render: () => (
    <Cluster>
      {[...sampleScenes, ...sampleScenes].map((scene, index) => (
        <MediaTile key={index} src={scene.src} alt={scene.alt} label="Anna" />
      ))}
    </Cluster>
  ),
};
