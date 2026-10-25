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
