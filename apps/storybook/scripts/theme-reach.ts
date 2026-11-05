import { themeId } from "@hackcove/themes-shared/ids";

const THEME = /^themes\/(.*)$/;

/**
 * The themes a changed path under `themes/` touches (`undefined` for any other path). A CSS file at
 * the top of the folder is its own theme, and a file with no theme left in the repo gives its
 * would-be id, which the caller finds is not a theme there is now. Anything else in the package (the
 * manifest, the README) touches every theme.
 */
export function themesOf(repo: { themes: string[] }, path: string): string[] | undefined {
  const rest = THEME.exec(path)?.[1];
  if (rest === undefined) return undefined;
  return rest.endsWith(".css") && !rest.includes("/") ? [themeId(rest)] : repo.themes;
}

/**
 * The themes to capture on the base: the picked ones it has, and the ones the branch no longer has,
 * so the report shows those as removed. A theme new on the branch is left out, so it shows as new:
 * the base's Storybook would render an id it does not know with no theme at all.
 */
export function themesOnBase(base: string[], picked: string[], branch: string[]): string[] {
  return base.filter((id) => picked.includes(id) || !branch.includes(id));
}

/**
 * The theme ids of the base checkout at `dir`, by the base's own rule: its id scheme may not be this
 * checkout's (a base older than a flattening keeps one folder per theme). Call it under the baseline
 * lock, right after `buildBase`, which leaves `dir` at the base commit.
 */
export async function baseThemeIds(dir: string): Promise<string[]> {
  const list =
    'import { themeFiles } from "./packages/themes-shared/src/files.ts";' +
    'console.log(JSON.stringify(themeFiles("themes").map((theme) => theme.id)));';
  const proc = Bun.spawn(["bun", "-e", list], { cwd: dir, stdout: "pipe", stderr: "inherit" });
  const text = await new Response(proc.stdout).text();
  if ((await proc.exited) !== 0) throw new Error(`could not list the themes of the base in ${dir}`);
  const ids: unknown = JSON.parse(text);
  if (!Array.isArray(ids) || !ids.every((id) => typeof id === "string"))
    throw new Error(`the base listed its themes as ${text}`);
  return ids;
}
