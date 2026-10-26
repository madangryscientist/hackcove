import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, CopyButton } from "@hackcove/ui";

const meta: Meta = { title: "UI/CopyButton" };
export default meta;
type S = StoryObj;

/** `CopyButton` writes `text` to the clipboard and swaps its label to `copiedLabel`. */
export const DoClipboard: S = {
  render: () => <CopyButton text="hc_live_9f2c41" label="Copy token" copiedLabel="Token copied" />,
};

/** A hand-rolled copy Button gives no feedback and does not survive a refused clipboard. */
export const DontClipboard: S = {
  render: () => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        void navigator.clipboard.writeText("hc_live_9f2c41");
      }}
    >
      Copy token
    </Button>
  ),
};

export const Default: S = {
  render: () => <CopyButton text="bun add @hackcove/ui" />,
};
export const Labels: S = {
  render: () => <CopyButton text="token" label="Copy token" copiedLabel="Token copied" />,
};
export const Disabled: S = {
  render: () => <CopyButton text="bun add @hackcove/ui" disabled />,
};
