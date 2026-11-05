import { themeId } from "@hackcove/themes-shared/ids";

const THEME = /^themes\/([^/]+)\/(.*)$/;

/**
 * The themes a changed path under `themes/` touches (`undefined` for any other path). A CSS file is
 * its own theme; anything else in the folder (the manifest, the README) touches all of its themes.
 * A folder with no theme left in the repo gives its would-be id, which the caller finds is not a
 * theme there is now.
 */
export function themesOf(
  repo: { themes: string[]; themeFolders: Record<string, string> },
  path: string,
): string[] | undefined {
  const match = THEME.exec(path);
  const folder = match?.[1];
  const rest = match?.[2];
  if (folder === undefined || rest === undefined) return undefined;
  if (rest.endsWith(".css") && !rest.includes("/")) return [themeId(folder, rest)];
  const ids = repo.themes.filter((id) => repo.themeFolders[id] === folder);
  return ids.length > 0 ? ids : [folder];
}
