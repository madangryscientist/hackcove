import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";

const storybookDir = fileURLToPath(new URL("..", import.meta.url));

const config: StorybookConfig = {
  // One entry per story file, in the order of the site's component docs. With no `storySort` in
  // preview.tsx, Storybook's sidebar follows the order of `stories`: Overview, then the site's
  // sections in rail order, each with its pages in page order. Nothing here lists a component.
  stories: () =>
    execFileSync("bun", ["scripts/sidebar.ts"], { cwd: storybookDir, encoding: "utf8" })
      .split("\n")
      .filter(Boolean)
      .map((path) => `../${path.replace(/^apps\/storybook\//, "")}`),
  framework: { name: "@storybook/react-vite", options: {} },
  viteFinal: async (cfg) => {
    cfg.plugins = [...(cfg.plugins ?? []), tailwindcss()];
    // Stories import the package by name; read its source so a component edit shows without a build.
    const existing = cfg.resolve?.alias;
    const aliases = Array.isArray(existing)
      ? existing
      : Object.entries(existing ?? {}).map(([find, replacement]) => ({ find, replacement }));
    const source = fileURLToPath(
      new URL("../../../packages/ui-react/src/index.ts", import.meta.url),
    );
    cfg.resolve = {
      ...cfg.resolve,
      alias: [...aliases, { find: "@hackcove/ui-react", replacement: source }],
    };
    return cfg;
  },
};
export default config;
