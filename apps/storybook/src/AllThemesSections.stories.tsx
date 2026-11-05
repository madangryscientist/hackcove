import type { Meta, StoryObj } from "@storybook/react-vite";
import { AllThemesGrid } from "./AllThemesGrid";
import { gallerySections, GallerySlice } from "./Gallery";
import { resetColourScheme } from "./resetColourScheme";

/**
 * Overview / All themes in slices, one story each: every theme side by side, one Gallery section
 * at a time. The whole page is 38000px tall, over PixelSlash's 24.5 Mpx limit for a shot, so the
 * visual check skips it (`visualSkipped`) and shoots these instead. Tagged for PixelSlash: each
 * story renders every theme itself, so the visual check shoots it once.
 */
const meta: Meta = {
  title: "Overview/All themes sections",
  tags: ["pixelslash-once"],
  parameters: { layout: "fullscreen", allThemes: true },
};
export default meta;
type S = StoryObj;

const slice = (id: string): S => ({
  name: gallerySections.find((section) => section.id === id)?.title ?? id,
  beforeEach: resetColourScheme,
  render: () => (
    <AllThemesGrid>
      <GallerySlice id={id} />
    </AllThemesGrid>
  ),
});

export const Headings = slice("headings");
export const Text = slice("text");
export const PillsAndBars = slice("pills-and-bars");
export const Data = slice("data");
export const Buttons = slice("buttons");
export const Fields = slice("fields");
export const Choices = slice("choices");
export const Navigation = slice("navigation");
export const Details = slice("details");
export const Layout = slice("layout");
export const PageLayouts = slice("page-layouts");
export const PageGrids = slice("page-grids");
export const PageBleed = slice("page-bleed");
export const StatusPages = slice("status-pages");
