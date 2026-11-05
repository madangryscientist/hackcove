import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Cluster, Lightbox, MediaTile } from "@hackcove/ui-react";
import { sampleScenes } from "./sampleScene";

const meta: Meta = { title: "Content/MediaTile" };
export default meta;
type S = StoryObj;

const fallback = { src: "", alt: "", caption: "" };
const first = sampleScenes[0] ?? fallback;
const second = sampleScenes[1] ?? fallback;

export const Default: S = {
  render: () => <MediaTile src={first.src} alt={first.alt} label="Anna" caption="09:12" />,
};

/** `label` sits on the bottom edge of the picture; `caption` is muted text under it. */
export const LabelAndCaption: S = {
  render: () => (
    <div className="flex items-start gap-4">
      <MediaTile src={first.src} alt={first.alt} />
      <MediaTile src={first.src} alt={first.alt} label="Anna" />
      <MediaTile src={first.src} alt={first.alt} caption="Today, 09:12" />
      <MediaTile src={first.src} alt={first.alt} label="Anna" caption="Today, 09:12" />
    </div>
  ),
};

/** `video` draws a play mark on the thumbnail. */
export const Video: S = {
  render: () => (
    <MediaTile src={second.src} alt="Video from Anna" label="Anna" caption="0:14" video />
  ),
};

/** `aspect` and `width` are `Image`'s: `sm`, `md` and `lg` cap the width, `full` fills the parent. */
export const Shapes: S = {
  render: () => (
    <div className="flex items-start gap-4">
      <MediaTile src={first.src} alt="Square" aspect="square" width="sm" label="sm" />
      <MediaTile src={first.src} alt="4:3" aspect="4:3" width="md" label="md" />
      <MediaTile src={first.src} alt="16:9" aspect="16:9" width="lg" label="lg" />
    </div>
  ),
};

/** A tile with no picture, as the "Earlier" tile at the end of a strip: a placeholder with its label. */
export const Placeholder: S = {
  render: () => <MediaTile alt="Earlier statuses" label="Earlier" onClick={() => undefined} />,
};

/** A thumbnail that opens a photo is a `MediaTile` with `onClick` that opens a `Lightbox`, which steps through the set. */
export const DoViewer: S = {
  render: () => {
    const [at, setAt] = useState<number | null>(null);
    const photo = at === null ? undefined : sampleScenes[at];
    return (
      <>
        <Cluster>
          {sampleScenes.map((scene, index) => (
            <MediaTile
              key={scene.src}
              src={scene.src}
              alt={scene.alt}
              label="Anna"
              caption={`09:1${index}`}
              onClick={() => setAt(index)}
            />
          ))}
        </Cluster>
        {at !== null && photo && (
          <Lightbox
            label={photo.alt}
            title="Anna"
            caption={photo.caption}
            onClose={() => setAt(null)}
            onPrevious={at > 0 ? () => setAt(at - 1) : undefined}
            onNext={at < sampleScenes.length - 1 ? () => setAt(at + 1) : undefined}
          >
            <img src={photo.src} alt={photo.alt} />
          </Lightbox>
        )}
      </>
    );
  },
};

/** A bare `<img>` in a button has no shape, frame or label, and no placeholder when it fails to load. */
export const DontViewer: S = {
  render: () => (
    <button type="button">
      <img src={sampleScenes[0]?.src} alt={sampleScenes[0]?.alt} width={120} />
    </button>
  ),
};
