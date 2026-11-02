/**
 * Prints the story files in sidebar order, one repo-relative path per line: Overview, then the
 * site's component docs in rail order. `.storybook/main.ts` runs this for its `stories` list. It
 * is a separate process because it imports the site's sections (TypeScript with extensionless
 * imports) the way the visual scripts do, under Bun.
 */
import { join } from "node:path";
import { sidebarOrder } from "./sidebar-order.js";
import { groupStories, readRepo } from "./visual-plan.js";

const repo = await readRepo(join(import.meta.dirname, "..", "..", ".."));
const paths = sidebarOrder(groupStories(repo.sections, repo.storyFiles));
process.stdout.write(`${paths.join("\n")}\n`);
