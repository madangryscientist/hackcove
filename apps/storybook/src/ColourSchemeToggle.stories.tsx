import type { Meta, StoryObj } from "@storybook/react-vite";
import { ColourSchemeToggle } from "@hackcove/ui";
import { resetColourScheme } from "./resetColourScheme";

const meta: Meta = { title: "UI/ColourSchemeToggle" };
export default meta;
type S = StoryObj;

// The snapshot is the light state; clicking is interactive-only.
export const Default: S = {
  beforeEach: resetColourScheme,
  render: () => <ColourSchemeToggle />,
};

/** An app whose light scheme has a class of its own passes `schemes`; clicking swaps the two. Same snapshot: the class is what changes. */
export const CustomClasses: S = {
  beforeEach: resetColourScheme,
  render: () => <ColourSchemeToggle schemes={{ light: "paper", dark: "dark" }} />,
};
