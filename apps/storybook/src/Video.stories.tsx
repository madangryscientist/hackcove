import type { Meta, StoryObj } from "@storybook/react-vite";
import { Video } from "@hackcove/ui";
import { samplePhoto } from "./samplePhoto";
import { sampleVideo } from "./sampleVideo";

const meta: Meta = { title: "UI/Video" };
export default meta;
type S = StoryObj;

export const WithPoster: S = {
  render: () => (
    <div className="max-w-xl">
      <Video src={sampleVideo} poster={samplePhoto}>
        Your browser cannot play this video.
      </Video>
    </div>
  ),
};

/** `captions` is a WebVTT file offered as the default track; `children` is the text for a browser that cannot play it. */
export const DoCaptions: S = {
  render: () => (
    <Video src="/media/walkthrough.webm" captions="/media/walkthrough.vtt">
      Your browser cannot play this video.
    </Video>
  ),
};

/** A video with speech and no `captions` leaves out anyone who cannot hear it. */
export const DontCaptions: S = {
  render: () => <Video src="/media/walkthrough.webm" />,
};
