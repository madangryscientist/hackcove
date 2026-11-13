import type { Meta, StoryObj } from "@storybook/react-vite";
import { CodeBlock } from "@hackcove/ui-react";

const meta: Meta = { title: "Text/Code" };
export default meta;
type S = StoryObj;

export const Default: S = {
  render: () => (
    <div className="max-w-xl">
      <CodeBlock language="bash">
        {"bun add @hackcove/ui-react\nbun add @hackcove/themes"}
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
          '@import "@hackcove/themes/catppuccin-mocha.css";',
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

/** Wrapping breaks at spaces only, so a flag such as `--skip-nx-cache` stays whole. A single word wider than the box (a long URL) is the one thing that breaks inside itself, rather than clip or scroll the page. */
export const LongToken: S = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="max-w-sm">
      <CodeBlock label="bash" language="bash">
        {
          "curl --fail --location https://registry.example.com/packages/hackcove-ui-react/archive/0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef.tgz"
        }
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

/** `copy` adds a button beside the code that copies it exactly as given, wrapped or not. */
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
      lines={["bun add @hackcove/ui-react", "bun add @hackcove/themes"]}
    />
  ),
};

/** One short line a reader copies is a `CopyLine`, the smaller box. A one-line `CodeBlock` is for a command that needs a `label` or colour. */
export const DontSnippet: S = {
  render: () => <CodeBlock language="bash">bun add @hackcove/ui-react</CodeBlock>,
};

/** `yaml` colours keys, strings, numbers and comments. The lines of a `run: |` script are left in one colour, since they are another language. */
export const Yaml: S = {
  render: () => (
    <div className="max-w-xl">
      <CodeBlock
        label=".github/workflows/ci.yml"
        language="yaml"
        lines={[
          "# Run the checks on every pull request.",
          "name: CI",
          "on:",
          "  pull_request:",
          "    branches: [main]",
          "jobs:",
          "  gate:",
          "    runs-on: ubuntu-latest",
          "    timeout-minutes: 15",
          "    steps:",
          "      - uses: actions/checkout@v4",
          "      - uses: oven-sh/setup-bun@v2",
          "        with:",
          '          bun-version: "1.3"',
          "      - name: Gate # typecheck, lint, test, build",
          "        if: ${{ github.event.pull_request.draft == false }}",
          "        run: |",
          "          bun install --frozen-lockfile",
          "          # the e2e flips every theme",
          "          bunx nx run-many -t typecheck lint test build",
          "      - name: Upload report",
          "        if: always()",
          "        continue-on-error: true",
        ]}
      />
    </div>
  ),
};

/** `js` is scanned as `ts` and `tsx` are, without the types. */
export const Js: S = {
  render: () => (
    <div className="max-w-xl">
      <CodeBlock
        label="theme.js"
        language="js"
        lines={[
          'import { colourScheme } from "@hackcove/ui-react";',
          "",
          "// Read the saved choice before the first paint.",
          "export function applyTheme(root = document.documentElement) {",
          '  const saved = localStorage.getItem("theme");',
          "  const dark = saved === null ? matchMedia(`(prefers-color-scheme: dark)`).matches : saved === `dark`;",
          '  root.classList.toggle("dark", dark);',
          "  return dark ? 1 : 0;",
          "}",
        ]}
      />
    </div>
  ),
};

/** `html` colours tags, attributes, strings and comments. A `<script>` is scanned as JS and a `<style>` as CSS. */
export const Html: S = {
  render: () => (
    <div className="max-w-xl">
      <CodeBlock
        label="index.html"
        language="html"
        lines={[
          "<!doctype html>",
          '<html lang="en">',
          "  <head>",
          "    <!-- The theme sets the colours. -->",
          '    <meta charset="utf-8" />',
          "    <title>Hack Cove</title>",
          "    <style>",
          "      body {",
          "        margin: 0;",
          "        font-family: system-ui;",
          "      }",
          "    </style>",
          "  </head>",
          "  <body>",
          '    <button id="save" class="primary" disabled>Don\'t save yet</button>',
          '    <script type="module">',
          '      const save = document.querySelector("#save");',
          '      save.addEventListener("click", () => console.log(1)); // log it',
          "    </script>",
          "  </body>",
          "</html>",
        ]}
      />
    </div>
  ),
};

/** `console` is a shell session: a `$ ` line is a command, coloured as bash, and every other line is output. With `copy`, only the commands are copied. */
export const Console: S = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="max-w-xl">
      <CodeBlock
        copy
        label="console"
        language="console"
        lines={[
          "$ bun add @hackcove/ui-react @hackcove/themes",
          "bun add v1.3.0",
          "",
          "installed @hackcove/ui-react@0.1.0",
          "installed @hackcove/themes@0.1.0",
          "",
          "2 packages installed [312.00ms]",
          "$ bunx playwright test \\",
          "    --project=chromium \\",
          "    --reporter=list",
          "Running 24 tests using 4 workers",
          "  24 passed (18.2s)",
        ]}
      />
    </div>
  ),
};
