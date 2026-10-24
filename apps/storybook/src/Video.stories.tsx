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
