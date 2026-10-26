import type { Meta, StoryObj } from "@storybook/react-vite";
import { Body, Button, Kbd } from "@hackcove/ui";

const meta: Meta = { title: "UI/Kbd" };
export default meta;
type S = StoryObj;

export const OnText: S = {
  render: () => (
    <p className="max-w-xl text-sm text-slate-700">
      Press <Kbd>Esc</Kbd> to close this list, or <Kbd>?</Kbd> to show the shortcuts.
    </p>
  ),
};

export const OnButton: S = {
  render: () => (
    <Button>
      Save <Kbd>⌘S</Kbd>
    </Button>
  ),
};

/** `Kbd` is a key the reader presses: in a sentence, or as the shortcut on a button. */
export const DoKey: S = {
  render: () => (
    <Body as="p">
      Press <Kbd>Esc</Kbd> to close this list, or <Kbd>⌘S</Kbd> to save.
    </Body>
  ),
};

/** A command is `Code`, not a key. `Kbd` draws a keycap, which says "press this". */
export const DontKey: S = {
  render: () => (
    <Body as="p">
      Run <Kbd>bun install</Kbd> to install.
    </Body>
  ),
};
