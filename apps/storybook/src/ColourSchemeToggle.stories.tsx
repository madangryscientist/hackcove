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
