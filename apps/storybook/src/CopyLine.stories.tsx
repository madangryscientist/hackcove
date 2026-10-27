import type { Meta, StoryObj } from "@storybook/react-vite";
import { CodeBlock, Cluster, Code, CopyButton, CopyLine } from "@hackcove/ui";

const meta: Meta = { title: "UI/CopyLine" };
export default meta;
type S = StoryObj;

/** One command or token to paste: `CopyLine` is the box and the copy button together. */
export const DoCommand: S = {
  render: () => <CopyLine text="bun add @hackcove/ui" />,
};

/** Inline code beside a loose `CopyButton` is two parts that drift apart; the text can differ from what is copied. */
export const DontCommand: S = {
  render: () => (
    <Cluster>
      <Code>bun add @hackcove/ui</Code>
      <CopyButton text="bun add @hackcove/ui" />
    </Cluster>
  ),
};

/** Several lines are a `CodeBlock`; it keeps the line breaks. */
export const DoBlock: S = {
  render: () => <CodeBlock label="bash" language="bash" lines={["bun install", "bun run build"]} />,
};

/** `CopyLine` is one line of text: a newline in it collapses into a space and the box runs on. */
export const DontBlock: S = {
  render: () => <CopyLine text={"bun install\nbun run build"} />,
};

export const Default: S = {
  render: () => <CopyLine text="bun add @hackcove/ui" />,
};
export const LongToken: S = {
  render: () => (
    <CopyLine text="hc_live_0b7f3c9a1e4d6f2a8b5c7e9d1f3a5b7c9e1d3f5a7b9c1e3d5f7a9b1c3e5d7f9a" />
  ),
};
/** `disabled` greys the copy button and stops it taking clicks, e.g. until hydration. */
export const Disabled: S = {
  render: () => <CopyLine text="bun add @hackcove/ui" disabled />,
};
