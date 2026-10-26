import type { Meta, StoryObj } from "@storybook/react-vite";
import { applyColourScheme, Button, ButtonGroup, ColourSchemeToggle } from "@hackcove/ui";
import { resetColourScheme } from "./resetColourScheme";

const meta: Meta = { title: "UI/ColourSchemeToggle" };
export default meta;
type S = StoryObj;

/** One `ColourSchemeToggle` in the page header: it switches `<html>`, remembers the choice and shows the scheme you would switch to. */
export const DoSwitch: S = {
  beforeEach: resetColourScheme,
  render: () => <ColourSchemeToggle />,
};

/** Two hand-rolled buttons forget the choice, and nothing shows which scheme is on. */
export const DontSwitch: S = {
  beforeEach: resetColourScheme,
  render: () => (
    <ButtonGroup label="Colour scheme">
      <Button variant="outline" size="sm" onClick={() => applyColourScheme("light")}>
        Light
      </Button>
      <Button variant="outline" size="sm" onClick={() => applyColourScheme("dark")}>
        Dark
      </Button>
    </ButtonGroup>
  ),
};

/** A light theme with a class of its own (thrifty-paper's) is named in `schemes`, so the toggle swaps both classes. */
export const DoSchemes: S = {
  beforeEach: resetColourScheme,
  render: () => <ColourSchemeToggle schemes={{ light: "paper", dark: "dark" }} />,
};

/** Without `schemes` the toggle only adds and removes `dark`, so the light theme's own class is never put back. */
export const DontSchemes: S = {
  beforeEach: resetColourScheme,
  render: () => <ColourSchemeToggle />,
};

// The icon follows the class on <html>, so on a dark page it shows the sun from the first frame, with no `initial`; the story starts light. Clicking is interactive-only.
export const Default: S = {
  beforeEach: resetColourScheme,
  render: () => <ColourSchemeToggle />,
};

/** An app whose light scheme has a class of its own passes `schemes`; clicking swaps the two. Same snapshot: the class is what changes. */
export const CustomClasses: S = {
  beforeEach: resetColourScheme,
  render: () => <ColourSchemeToggle schemes={{ light: "paper", dark: "dark" }} />,
};
