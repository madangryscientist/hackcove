import type { Meta, StoryObj } from "@storybook/react-vite";
import { CodeBlock } from "@hackcove/ui";

const meta: Meta = { title: "UI/CodeBlock" };
export default meta;
type S = StoryObj;

export const Default: S = {
  render: () => (
    <div className="max-w-xl">
      <CodeBlock language="bash">
        {"bun add @hackcove/ui\nbun add @hackcove/theme-catppuccin-mocha"}
      </CodeBlock>
    </div>
  ),
};

/** `label` names the language or file in a caption, `language` says what to colour, and `lines` is one entry per line. */
export const Labelled: S = {
  render: () => (
    <div className="max-w-xl">
      <CodeBlock
        label="css"
        language="css"
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
      <CodeBlock label="bash" language="bash">
        bunx nx run-many -t typecheck lint test build --skip-nx-cache --output-style=stream
      </CodeBlock>
    </div>
  ),
};

/** A few lines to read or copy go in one `CodeBlock`, with `label` naming the language or file. */
export const DoSnippet: S = {
  render: () => (
    <CodeBlock
      label="bash"
      language="bash"
      lines={["bun add @hackcove/ui", "bun add @hackcove/theme-catppuccin-mocha"]}
    />
  ),
};

/** One line a reader copies is a `CopyLine`, which has the copy button. A `CodeBlock` of one line has none. */
export const DontSnippet: S = {
  render: () => <CodeBlock language="bash">bun add @hackcove/ui</CodeBlock>,
};
