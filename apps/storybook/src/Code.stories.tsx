import type { Meta, StoryObj } from "@storybook/react-vite";
import { Body, Code } from "@hackcove/ui";

const meta: Meta = { title: "UI/Code" };
export default meta;
type S = StoryObj;

export const Inline: S = {
  render: () => (
    <div className="max-w-xl">
      <Body as="p">
        Run <Code>bun install</Code> once, then <Code>bunx nx run-many -t test</Code> to check it.
      </Body>
    </div>
  ),
};

/** `Code` is one short run of code inside a sentence: a command, a name, a path. */
export const DoInline: S = {
  render: () => (
    <Body as="p">
      Run <Code>bun install</Code> once, then <Code>bunx nx run-many -t test</Code> to check it.
    </Body>
  ),
};

/** `Code` is inline, so its line breaks collapse into one run. Several lines are a `CodeBlock`. */
export const DontInline: S = {
  render: () => (
    <Body as="p">
      <Code>{"bun install\nbun run build\nbun run test"}</Code>
    </Body>
  ),
};
