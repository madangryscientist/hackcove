import type { Meta, StoryObj } from "@storybook/react-vite";
import { gallerySections, GallerySlice } from "./Gallery";
import { resetColourScheme } from "./resetColourScheme";

/**
 * The Gallery in slices, one story each, in the toolbar's theme. This is what the visual check
 * shoots: Overview / Gallery is one 19000px page, over PixelSlash's 24.5 Mpx limit for a shot as
 * soon as it grows, so the check skips it (`visualSkipped`) and shoots these instead. Each slice's
 * name is the section's `title` in `gallerySections`; the test in `GallerySections.test.ts` keeps
 * the two lists the same.
 */
const meta: Meta = { title: "Overview/Gallery sections", parameters: { layout: "fullscreen" } };
export default meta;
type S = StoryObj;

const slice = (id: string): S => ({
  name: gallerySections.find((section) => section.id === id)?.title ?? id,
  beforeEach: resetColourScheme,
  render: () => <GallerySlice id={id} />,
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
