import type { Meta, StoryObj } from "@storybook/react-vite";
import { AllThemesGrid } from "./AllThemesGrid";
import { Gallery as GalleryView } from "./Gallery";
import { resetColourScheme } from "./resetColourScheme";

const meta: Meta = { title: "Overview", parameters: { layout: "fullscreen" } };
export default meta;
type S = StoryObj;

/** Follows the toolbar switcher. */
export const Gallery: S = {
  beforeEach: resetColourScheme,
  render: () => <GalleryView />,
};

/**
 * Every theme side by side, each in its own frame. Skips the toolbar frame (see preview.tsx).
 * Tagged for PixelSlash: it renders every theme itself, so the visual check shoots it once.
 */
export const AllThemes: S = {
  tags: ["pixelslash-once"],
  beforeEach: resetColourScheme,
  parameters: { allThemes: true },
  render: () => (
    <AllThemesGrid>
      <GalleryView />
    </AllThemesGrid>
  ),
};
