import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  framework: { name: "@storybook/react-vite", options: {} },
  viteFinal: async (cfg) => {
    cfg.plugins = [...(cfg.plugins ?? []), tailwindcss()];
    // Stories import the package by name; read its source so a component edit shows without a build.
    const existing = cfg.resolve?.alias;
    const aliases = Array.isArray(existing)
      ? existing
      : Object.entries(existing ?? {}).map(([find, replacement]) => ({ find, replacement }));
    const source = fileURLToPath(new URL("../../../packages/ui/src/index.ts", import.meta.url));
    cfg.resolve = {
      ...cfg.resolve,
      alias: [...aliases, { find: "@hackcove/ui", replacement: source }],
    };
    return cfg;
  },
};
export default config;
