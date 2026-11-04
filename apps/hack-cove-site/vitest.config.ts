import { defineConfig } from "vitest/config";

export default defineConfig({
  // Vitest turns every .css import into an empty string, `?inline` included. The shared themes
  // module reads each theme's CSS file as text to find its scope class, so those files must come through.
  test: { include: ["test/**/*.test.{ts,tsx}"], css: { include: [/themes\/.*\.css/] } },
});
