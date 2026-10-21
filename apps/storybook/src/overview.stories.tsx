import type { Meta, StoryObj } from "@storybook/react-vite";
import { Overline } from "@hackcove/ui";
import { NONE, ThemeFrame, themeNames } from "../.storybook/themes";
import { Gallery as GalleryView } from "./Gallery";

const meta: Meta = { title: "Overview" };
export default meta;
type S = StoryObj;

/** Follows the toolbar switcher. */
export const Gallery: S = {
  render: () => <GalleryView />,
};

/** Every theme side by side, each in its own frame. Skips the toolbar frame (see preview.tsx). */
export const AllThemes: S = {
  parameters: { allThemes: true },
  render: () => (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(26rem,1fr))]">
      {[NONE, ...themeNames].map((name) => (
        <ThemeFrame key={name} theme={name}>
          <Overline>{name}</Overline>
          <GalleryView />
        </ThemeFrame>
      ))}
    </div>
  ),
};
