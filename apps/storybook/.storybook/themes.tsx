import type { ReactNode } from "react";
import { NONE } from "./none";
import { themeScope } from "./scope";

// Every folder under themes/ ships a theme.css. Globbing them means a new theme appears in the
// toolbar the moment its folder exists; nothing here names a theme.
const themeCss = import.meta.glob<string>("../../../themes/*/theme.css", {
  query: "?inline",
  import: "default",
  eager: true,
});

export const THEMES: Record<string, string> = Object.fromEntries(
  Object.entries(themeCss).map(([path, css]) => [path.split("/").at(-2) ?? path, css]),
);
export { NONE };
export const themeNames = Object.keys(THEMES).toSorted();

/** Each theme remaps under its own scope class; `default` is the components' own Tailwind classes. */
export function ThemeFrame({ theme, children }: { theme: string; children: ReactNode }) {
  const css = THEMES[theme];
  return (
    <div className={css === undefined ? undefined : themeScope(css)} data-theme={theme}>
      {css !== undefined && <style dangerouslySetInnerHTML={{ __html: css }} />}
      <div className="p-8">{children}</div>
    </div>
  );
}
