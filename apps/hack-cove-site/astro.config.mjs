import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { join } from "node:path";
import { writeProps } from "./scripts/generate-props.ts";

const UI_SRC = join(import.meta.dirname, "..", "..", "packages", "ui-react", "src");

/**
 * In `astro dev` only: when a file of `packages/ui-react/src` changes, write `props.json` again, so
 * a JSDoc edit shows in the API table on reload with no restart. The build runs the `props` task.
 */
const propsInDev = {
  name: "hack-cove-props-in-dev",
  apply: "serve",
  configureServer(server) {
    server.watcher.add(UI_SRC);
    server.watcher.on("change", (file) => {
      if (!file.startsWith(UI_SRC)) return;
      writeProps();
    });
  },
};

// Static output, deployed to Cloudflare by wrangler DIRECT UPLOAD (see deploy.sh),
// never the Pages git integration.
export default defineConfig({
  site: "https://hack-cove.com",
  output: "static",
  integrations: [react()],
  vite: { plugins: [tailwindcss(), propsInDev] },
});
