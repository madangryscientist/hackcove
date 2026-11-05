import type { Meta, StoryObj } from "@storybook/react-vite";
import { CodeBlock } from "@hackcove/ui-react";

const meta: Meta = { title: "Text/Code" };
export default meta;
type S = StoryObj;

export const Default: S = {
  render: () => (
    <div className="max-w-xl">
      <CodeBlock language="bash">
        {"bun add @hackcove/ui-react\nbun add @hackcove/theme-catppuccin-mocha"}
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
          '@source "../node_modules/@hackcove/ui-react/dist";',
        ]}
      />
    </div>
  ),
};

/** Long lines wrap by default; nothing is cut off and nothing scrolls sideways. A wrapped command is still one line when copied. */
export const LongLine: S = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="max-w-sm">
      <CodeBlock label="bash" language="bash">
        bunx nx run-many -t typecheck lint test build --skip-nx-cache --output-style=stream
      </CodeBlock>
    </div>
  ),
};

/** `overflow="scroll"` keeps each line whole and scrolls it sideways under a thin scrollbar in the theme's muted ink, for code whose layout matters. */
export const Scroll: S = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="max-w-sm">
      <CodeBlock
        label="bash"
        language="bash"
        overflow="scroll"
        lines={[
          "bunx nx run-many -t typecheck lint test build --skip-nx-cache --output-style=stream",
          "bun install",
        ]}
      />
    </div>
  ),
};

/** `copy` adds a button beside the code that copies it exactly as given, wrapped or not. It needs the page hydrated. */
export const Copy: S = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="max-w-sm">
      <CodeBlock copy label="bash" language="bash">
        bunx playwright test --project=chromium --reporter=list --output=out
      </CodeBlock>
    </div>
  ),
};

/** `copy` with `overflow="scroll"`: the button stays put while the code scrolls. */
export const CopyScroll: S = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="max-w-sm">
      <CodeBlock copy overflow="scroll" label="bash" language="bash">
        bunx playwright test --project=chromium --reporter=list --output=out
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
      lines={["bun add @hackcove/ui-react", "bun add @hackcove/theme-catppuccin-mocha"]}
    />
  ),
};

/** One short line a reader copies is a `CopyLine`, the smaller box. A one-line `CodeBlock` is for a command that needs a `label` or colour. */
export const DontSnippet: S = {
  render: () => <CodeBlock language="bash">bun add @hackcove/ui-react</CodeBlock>,
};
