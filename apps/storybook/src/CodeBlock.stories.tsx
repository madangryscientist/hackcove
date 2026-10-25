import type { Meta, StoryObj } from "@storybook/react-vite";
import { CodeBlock } from "@hackcove/ui";

const meta: Meta = { title: "UI/CodeBlock" };
export default meta;
type S = StoryObj;

export const Default: S = {
  render: () => (
    <div className="max-w-xl">
      <CodeBlock>{"bun add @hackcove/ui\nbun add @hackcove/theme-catppuccin-mocha"}</CodeBlock>
    </div>
  ),
};

/** `label` names the language or file in a caption; `lines` is one entry per line. */
export const Labelled: S = {
  render: () => (
    <div className="max-w-xl">
      <CodeBlock
        label="css"
        lines={[
          '@import "tailwindcss";',
          '@import "@hackcove/theme-catppuccin-mocha/theme.css";',
          '@source "../node_modules/@hackcove/ui/dist";',
        ]}
      />
    </div>
  ),
};

/** Long lines wrap; nothing scrolls sideways. */
export const LongLine: S = {
  render: () => (
    <div className="max-w-sm">
      <CodeBlock label="bash">
        bunx nx run-many -t typecheck lint test build --skip-nx-cache --output-style=stream
      </CodeBlock>
    </div>
  ),
};
