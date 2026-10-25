import { defineConfig } from "vitest/config";

export default defineConfig({
  // Vitest turns every .css import into an empty string, `?raw` included. themes.ts reads each
  // theme.css as text to find its scope class, so those files must come through as written.
  test: { css: { include: [/themes\/.*theme\.css/] } },
});
