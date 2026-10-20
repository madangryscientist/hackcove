/** Serves storybook-static on localhost for the e2e run; no dependency, no network beyond the loopback. */
import { join, normalize } from "node:path";

const root = join(import.meta.dirname, "..", "storybook-static");
const port = Number(process.env["PORT"] ?? 6007);

Bun.serve({
  hostname: "127.0.0.1",
  port,
  async fetch(req) {
    const path = normalize(decodeURIComponent(new URL(req.url).pathname));
    const file = Bun.file(join(root, path.endsWith("/") ? `${path}index.html` : path));
    // Refuse anything that resolves outside the build directory.
    if (!file.name?.startsWith(root) || !(await file.exists())) {
      return new Response("not found", { status: 404 });
    }
    return new Response(file);
  },
});
