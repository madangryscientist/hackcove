import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Kbd } from "@hackcove/ui";

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
