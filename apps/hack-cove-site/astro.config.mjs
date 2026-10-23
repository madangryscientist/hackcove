import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// Static output, deployed to Cloudflare by wrangler DIRECT UPLOAD (see deploy.sh)
// — never the Pages git integration.
export default defineConfig({
  site: "https://hack-cove.com",
  output: "static",
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});
